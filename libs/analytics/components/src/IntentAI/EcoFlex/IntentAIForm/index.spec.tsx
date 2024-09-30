/* eslint-disable max-len */
import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import moment      from 'moment-timezone'

import { intentAIApi, intentAIUrl, Provider, store }                                         from '@acx-ui/store'
import { fireEvent, mockGraphqlMutation, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockIntentContext } from '../../__tests__/fixtures'
import { Statuses }          from '../../states'
import { Intent }            from '../../useIntentDetailsQuery'
import { mocked }            from '../__tests__/mockedEcoFlex'
import { kpis }              from '../common'

import { IntentAIForm } from '.'

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

const { click, selectOptions } = userEvent

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children, ...props
  }: React.PropsWithChildren<{ onChange?: (value: string) => void }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigateToPath: () => mockNavigate
}))

jest.mock('../common/ScheduleTiming', () => ({
  ...jest.requireActual('../common/ScheduleTiming'),
  validateScheduleTiming: jest.fn().mockResolvedValue(true)
}))

jest.mock('../IntentContext')

window.ResizeObserver = ResizeObserver

beforeEach(() => {
  store.dispatch(intentAIApi.util.resetApiState())
  moment.tz.setDefault('Asia/Singapore')
  const now = +new Date('2024-08-08T12:00:00.000Z')
  jest.spyOn(Date, 'now').mockReturnValue(now)

  mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
    data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
  })
})

afterEach((done) => {
  const toast = screen.queryByRole('img', { name: 'close' })
  if (toast) {
    waitForElementToBeRemoved(toast).then(done)
    message.destroy()
  } else {
    done()
  }
})

const mockIntentContextWith = (data: Partial<Intent> = {}) => {
  const intent = { ...mocked, ...data }
  mockIntentContext({ intent, kpis })
  return {
    params: { code: mocked.code, root: mocked.root, sliceId: mocked.sliceId }
  }
}

describe('IntentAIForm', () => {
  it('handle schedule intent', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.new })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Intent: Energy Footprint vs Mission Criticality')).length).toEqual(1)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Reduction in energy footprint' })
    await click(radioEnabled)
    expect(radioEnabled).toBeChecked()
    const currInput = await screen.findByDisplayValue('USD')
    fireEvent.change(currInput, { target: { value: 'SGD' } })
    expect(screen.getByDisplayValue('SGD')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    const date = await screen.findByPlaceholderText('Select date')
    await click(date)
    await click(await screen.findByRole('cell', { name: '2024-08-09' }))
    expect(date).toHaveValue('08/09/2024')
    const time = await screen.findByPlaceholderText('Select time')
    await selectOptions(time, '12:30 (UTC+08)')
    expect(time).toHaveValue('12.5')

    const scheduleEnabled = screen.getByRole('checkbox', { name: /following time slots of the week/ })
    await click(scheduleEnabled)
    expect(scheduleEnabled).toBeChecked()
    expect(await screen.findByText(/Local time/)).toBeVisible()

    await click(actions.getByRole('button', { name: 'Next' }))
    expect((await screen.findAllByText('Summary')).length).toEqual(2)
    expect(await screen.findByText('Hours not applied for EcoFlex')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    expect(mockNavigate).toBeCalled()
  })
  it('handle pause intent', async () => {
    const { params } = mockIntentContextWith({
      status: Statuses.new,
      metadata: {
        preferences: {
          averagePowerPrice: { currency: 'SGD', value: 0 },
          crrmFullOptimization: true
        },
        scheduledAt: '',
        dataEndTime: ''
      }
    })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioDisabled = screen.getByRole(
      'radio',
      { name: 'Operation of the mission critical network' }
    )
    await click(radioDisabled)
    expect(radioDisabled).toBeChecked()
    expect(screen.getByDisplayValue('SGD')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()

    expect(await screen.findByPlaceholderText('Select date')).toBeDisabled()
    expect(await screen.findByPlaceholderText('Select time')).toBeDisabled()

    const scheduleEnabled = screen.getByRole('checkbox', { name: /following time slots of the week/ })
    expect(scheduleEnabled).toBeDisabled()

    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()

    expect(await screen.findByText(/IntentAI will maintain the existing network configuration and will cease automated monitoring of configuration for handling PowerSafe request\/response in the network./)).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    expect(mockNavigate).toBeCalled()
  })
})
