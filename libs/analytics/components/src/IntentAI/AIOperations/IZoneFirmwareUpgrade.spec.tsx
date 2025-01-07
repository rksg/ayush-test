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

import { mocked, mockedIntentAps, mockedKPIs, mockedStatusTrail } from './__tests__/mockedIZoneFirmwareUpgrade'
import { configuration, kpis, IntentAIDetails, IntentAIForm }     from './IZoneFirmwareUpgrade'

const { click, selectOptions, hover } = userEvent

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
  const intent = _.merge({}, mocked, data) as IntentDetail
  const context = mockIntentContext({ intent, configuration, kpis })
  return { params: _.pick(context.intent, ['code', 'root', 'sliceId']) }
}

describe('IntentAIDetails', () => {
  beforeEach(() => {
    mockGraphqlQuery(intentAIUrl, 'GetAps', { data: { intent: { aps: mockedIntentAps } } })
  })

  it('should handle when status is paused/na', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.paused })
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('When activated, this AIOps Intent takes over the automatic upgrade of Zone firmware in the network.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()

    expect(screen.queryByTestId('KPI')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Benefits')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Potential Trade-off')).not.toBeInTheDocument()

    expect(await screen.findByTestId('Current Status')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()
  })
  it('should render correctly for firmware drawer', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    await userEvent.click(await screen.findByText('3 of 3 APs (100 %)'))
    const drawerEl = await screen.findByRole('dialog')
    const drawer = within(drawerEl)
    expect(await drawer.findByText('3 Impacted APs')).toBeVisible()
    expect(await drawer.findByText('B4:79:C8:3E:7E:50')).toBeVisible()
    expect(await drawer.findByText('28:B3:71:27:38:E0')).toBeVisible()
    expect(await drawer.findByText('C8:84:8C:3E:46:B0')).toBeVisible()
    await userEvent.click(drawer.getByRole('button', { name: 'Close' }))
    expect(drawerEl).not.toBeVisible()
  })
  it('should render', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI will upgrade the Zone firmware ensuring the network remains secure and up-to-date with the latest features. This change will enhance protection against cyber threats and enabling access to new functionalities for improved performance and management.')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('IntentAI will continuously monitor these configurations.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()
    expect(await screen.findByTestId('KPI')).toBeVisible()
    expect(await screen.findByTestId('Benefits')).toBeVisible()
    expect(await screen.findByTestId('Potential Trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()

    await hover(await screen.findByTestId('InformationSolid'))
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('When applied, the Intent will use the latest available firmware version.')
    expect(screen.queryByText('Scheduled Date')).not.toBeInTheDocument()
  })
  it('should render with scheduled date', async () => {
    const { params } = mockIntentContextWith({
      ...mocked,
      status: Statuses.scheduled,
      metadata: {
        scheduledAt: '2022-01-01T00:00:00.000Z',
        dataEndTime: '2022-01-01T00:00:00.000Z'
      } as IntentDetail['metadata']
    })
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByText('Scheduled Date')).toBeVisible()
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
    expect(await screen.findByText('Recommended Configuration: 7.0.0')).toBeVisible()
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
