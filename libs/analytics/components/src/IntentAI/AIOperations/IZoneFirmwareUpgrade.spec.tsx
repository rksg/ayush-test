import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'

import { intentAIApi, intentAIUrl, Provider, store }                                                         from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen, waitForElementToBeRemoved, within, waitFor } from '@acx-ui/test-utils'

import { useIntentContext } from '../IntentContext'
import { Statuses }         from '../states'
import { Intent }           from '../useIntentDetailsQuery'

import { mocked, mockedIntentAps }                            from './__tests__/mockedIZoneFirmwareUpgrade'
import { configuration, kpis, IntentAIDetails, IntentAIForm } from './IZoneFirmwareUpgrade'

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
    expect(await screen.findByTestId('KPI')).toBeVisible()
    expect(await screen.findByTestId('Why the intent?')).toBeVisible()
    expect(await screen.findByTestId('Potential trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()
  })
  it('should show different tooltip based on return value of compareVersion', async () => {
    const { params } = mockIntentContextWith({ currentValue: '7.0.0' })
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    await hover(await screen.findByTestId('InformationSolid'))
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('Zone was upgraded manually to recommended AP firmware version. Manually check whether this intent is still valid.')
  })
  it('should render correctly for firmware drawer', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    const affectedAps = await screen.findByText('3 of 3 APs (100 %)')
    userEvent.click(affectedAps)
    const tableTitle = await screen.findByText('3 Impacted APs')
    expect(tableTitle).toBeVisible()
    expect(await screen.findByText('B4:79:C8:3E:7E:50')).toBeVisible()
    expect(await screen.findByText('28:B3:71:27:38:E0')).toBeVisible()
    expect(await screen.findByText('C8:84:8C:3E:46:B0')).toBeVisible()
    const closeButton = screen.queryByRole('button', { name: 'Close' })
    expect(closeButton).not.toBeNull()
    userEvent.click(closeButton!)
    await waitFor(async () => {
      expect(screen.queryByText('3 Impacted APs')).not.toBeVisible()
    })
  })
  it('should render', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Venue: weiguo-mesh is running with older AP firmware version . It is recommended to upgrade zone to the latest available AP firmware version.')).toBeVisible()
    expect(await screen.findByTestId('Details')).toBeVisible()
    expect(await screen.findByTestId('Configuration')).toBeVisible()
    expect(await screen.findByTestId('KPI')).toBeVisible()
    expect(await screen.findByTestId('Why the intent?')).toBeVisible()
    expect(await screen.findByTestId('Potential trade-off')).toBeVisible()
    expect(await screen.findByTestId('Status Trail')).toBeVisible()

    await hover(await screen.findByTestId('InformationSolid'))
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('Latest available AP firmware version will be used when this intent is applied.')
  })
})

describe('IntentAIForm', () => {
  it('should render when active', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why the intent?')).length).toEqual(2)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Yes, apply the intent' })
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
    expect(await screen.findByText('Recommended Configuration: 7.0.0')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    expect(mockNavigate).toBeCalled()
  })
  it('should render when paused', async () => {
    const { params } = mockIntentContextWith()
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    expect((await screen.findAllByText('Why the intent?')).length).toEqual(2)
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioDisabled = screen.getByRole('radio', { name: 'No, do not apply the intent' })
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
