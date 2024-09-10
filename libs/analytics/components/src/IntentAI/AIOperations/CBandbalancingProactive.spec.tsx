import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'

import { intentAIApi, intentAIUrl, Provider, store }                              from '@acx-ui/store'
import { mockGraphqlMutation, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { useIntentContext } from '../IntentContext'
import { Statuses }         from '../states'
import { Intent }           from '../useIntentDetailsQuery'

import { mocked }                                             from './__tests__/mockedCBandbalancingProactive'
import { configuration, kpis, IntentAIDetails, IntentAIForm } from './CBandbalancingProactive'

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
  let intent = mocked
  intent = _.merge({}, intent, data) as typeof intent
  jest.mocked(useIntentContext).mockReturnValue({ intent, configuration, kpis })
  return {
    params: { code: mocked.code, root: mocked.root, sliceId: mocked.sliceId }
  }
}

describe('IntentAIDetails', () => {
  it('should handle when status is paused/na', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.paused })
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('When activated, this AIOps Intent takes over the automatic configuration of Band balancing mode in the network.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()
    const kpiElements = await screen.findAllByTestId('KPI')
    kpiElements.forEach(element => expect(element).toBeVisible())
    expect(await screen.findByTestId('Why is the recommendation?')).toBeVisible()
    expect(await screen.findByTestId('Potential trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()
  })

  it('should render', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByText('This Intent is active, with following priority:')).toBeVisible()
    expect(await screen.findByText('Yes, apply the recommendation')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI will change band balancing mode to Proactive for this network, this change will optimizes client distribution, enhancing overall network performance by efficiently balancing client load across access points, which shall improve throughput and reduce congestion.')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI will continuously monitor these configurations.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()
    const kpiElements = await screen.findAllByTestId('KPI')
    kpiElements.forEach(element => expect(element).toBeVisible())
    expect(await screen.findByTestId('Why is the recommendation?')).toBeVisible()
    expect(await screen.findByTestId('Potential trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()
  })
})

describe('IntentAIForm', () => {
  it('should render when active', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.active })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why is the recommendation?')).length).toEqual(1)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Yes, apply the recommendation' })
    await click(radioEnabled)
    expect(radioEnabled).toBeChecked()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await selectOptions(
      await screen.findByRole('combobox', { name: 'Schedule Time' }),
      '12:30 (UTC+08)'
    )
    expect(await screen.findByRole('combobox', { name: 'Schedule Time' })).toHaveValue('12.5')
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    expect(await screen.findByText('Recommended Configuration: PROACTIVE')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    expect(mockNavigate).toBeCalled()
  })
  it('should render when paused', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.paused })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why is the recommendation?')).length).toEqual(1)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioDisabled = screen.getByRole('radio', { name: 'No, do not apply the recommendation' })
    await click(radioDisabled)
    expect(radioDisabled).toBeChecked()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    expect(await screen.findByRole('combobox', { name: 'Schedule Time' })).toBeDisabled()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/IntentAI will maintain the existing network configuration and will cease automated monitoring and change for this Intent./)).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    expect(mockNavigate).toBeCalled()
  })
})
