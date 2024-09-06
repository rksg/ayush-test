/* eslint-disable max-len */
import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'

import { get }                                                                                      from '@acx-ui/config'
import { intentAIApi, intentAIUrl, Provider, store }                                                from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { useIntentContext } from '../../IntentContext'
import { Intent }           from '../../useIntentDetailsQuery'
import { mocked }           from '../__tests__/mockedAirFlexAI'
import { kpis }             from '../common'

import { IntentAIForm } from '.'

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
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
beforeEach(() => {
  store.dispatch(intentAIApi.util.resetApiState())
  mockGet.mockReturnValue('true')
  moment.tz.setDefault('Asia/Singapore')
  const now = +new Date('2024-08-08T12:00:00.000Z')
  jest.spyOn(Date, 'now').mockReturnValue(now)

  mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
    data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
  })
  mockGraphqlQuery(intentAIUrl, 'Wlans', {
    data: {
      intent: {
        wlans: [
          {
            name: 'DENSITY-GUEST',
            ssid: 'DENSITY-GUEST'
          },
          {
            name: 'DENSITY',
            ssid: 'DENSITY'
          }
        ]
      }
    }
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
  let intent = mocked
  intent = _.merge({}, intent, data) as typeof intent
  jest.mocked(useIntentContext).mockReturnValue({ intent, kpis })
  return {
    params: { code: mocked.code, root: mocked.root, sliceId: mocked.sliceId }
  }
}

describe('IntentAIForm', () => {
  it('should work when active', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Time to Connect vs Client Density for 5 GHz')).length).toEqual(1)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Reduce Management traffic in dense network' })
    await click(radioEnabled)
    expect(radioEnabled).toBeChecked()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const date = await screen.findByPlaceholderText('Select date')
    await click(date)
    await click(await screen.findByRole('cell', { name: '2024-08-09' }))
    expect(date).toHaveValue('08/09/2024')
    await selectOptions(
      await screen.findByRole('combobox', { name: 'Start Time' }),
      '12:30 (UTC+08)'
    )
    expect(await screen.findByRole('combobox', { name: 'Start Time' })).toHaveValue('12.5')
    await click(actions.getByRole('button', { name: 'Next' }))
    expect((await screen.findAllByText('Summary')).length).toEqual(2)
    expect(await screen.findByText('Average management traffic per client')).toBeVisible()
    expect(await screen.findByText('2 Networks selected')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    expect(mockNavigate).toBeCalled()
  })
  it('should work when paused', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioDisabled = screen.getByRole(
      'radio',
      { name: 'Standard Management traffic in a sparse network' }
    )
    await click(radioDisabled)
    expect(radioDisabled).toBeChecked()
    await click(actions.getByRole('button', { name: 'Next' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()

    expect(await screen.findByRole('combobox', { name: 'Start Time' })).toBeDisabled()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()

    expect(await screen.findByText(/IntentAI will maintain the existing network configuration and will cease automated monitoring of configuration for handling probe request\/response in the network./)).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    expect(mockNavigate).toBeCalled()
  })
})
