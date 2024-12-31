import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'

import { intentAIApi, intentAIUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockIntentContext } from '../__tests__/fixtures'
import { Statuses }          from '../states'
import { IntentDetail }      from '../useIntentDetailsQuery'

import { mocked, mockedKPIs, mockedStatusTrail }              from './__tests__/mockedCBandbalancingEnable'
import { configuration, kpis, IntentAIDetails, IntentAIForm } from './CBandbalancingEnable'

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
  useNavigate: () => mockNavigate
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
  mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail', { data: { intent: mockedStatusTrail } })
  mockGraphqlQuery(intentAIUrl, 'IntentKPIs', { data: { intent: mockedKPIs } })
})

afterEach((done) => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
  const toast = screen.queryByRole('img', { name: 'close' })
  if (toast) {
    waitForElementToBeRemoved(toast).then(done)
    message.destroy()
  } else {
    done()
  }
})

const mockIntentContextWith = (data: Partial<IntentDetail> = {}) => {
  let intent = mocked
  intent = _.merge({}, intent, data) as typeof intent
  mockIntentContext({ intent, configuration, kpis })
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
    expect(await screen.findByText('When activated, this AIOps Intent takes over the automatic configuration of Band balancing in the network.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()

    expect(screen.queryByTestId('KPI')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Benefits')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Potential Trade-off')).not.toBeInTheDocument()

    expect(await screen.findByTestId('Status Trail')).toBeVisible()
    expect(await screen.findByTestId('Current Status')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI is active on Venue 14-US-CA-D14-Ken-Home.')).toBeVisible()
  })

  it('should render', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI will enable band balancing for this network, this change shall optimize network performance by efficiently distributing devices across available frequency bands, reducing congestion and enhancing overall Wi-Fi experience.')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI will continuously monitor these configurations.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()
    const kpiElements = await screen.findAllByTestId('KPI')
    kpiElements.forEach(element => expect(element).toBeVisible())
    expect(await screen.findByTestId('Benefits')).toBeVisible()
    expect(await screen.findByTestId('Potential Trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()
  })
})

describe('IntentAIForm', () => {
  it('handle schedule intent', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.new })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Benefits')).length).toEqual(1)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Yes, apply the recommendation' })
    await click(radioEnabled)
    expect(radioEnabled).toBeChecked()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    const date = await screen.findByPlaceholderText('Select date')
    await click(date)
    await click(await screen.findByRole('cell', { name: '2024-08-13' }))
    expect(date).toHaveValue('08/13/2024')
    const time = await screen.findByPlaceholderText('Select time')
    await selectOptions(time, '12:30 (UTC+08)')
    expect(time).toHaveValue('12.5')
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    expect(await screen.findByText('Recommended Configuration: Enabled')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    await click(await screen.findByText(/View/))
    expect(mockNavigate).toBeCalled()
  })
  it('handle pause intent', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.new })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Benefits')).length).toEqual(1)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioDisabled = screen.getByRole('radio', { name: 'No, do not apply the recommendation' })
    await click(radioDisabled)
    expect(radioDisabled).toBeChecked()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    expect(await screen.findByPlaceholderText('Select date')).toBeDisabled()
    expect(await screen.findByPlaceholderText('Select time')).toBeDisabled()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/IntentAI will maintain the existing network configuration and will cease automated monitoring and change for this Intent./)).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    await click(await screen.findByText(/View/))
    expect(mockNavigate).toBeCalled()
  })
})
