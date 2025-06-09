import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import moment      from 'moment-timezone'

import { get }                                                            from '@acx-ui/config'
import { dataApi, dataApiURL, intentAIApi, intentAIUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockIntentContext }                                          from '../../__tests__/fixtures'
import { Statuses }                                                   from '../../states'
import { IntentDetail }                                               from '../../useIntentDetailsQuery'
import { mocked, mockApHierarchy, mockNetworkHierarchy, mockKpiData } from '../__tests__/mockedEcoFlex'
import { kpis }                                                       from '../common'

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
  useNavigate: () => mockNavigate
}))

jest.mock('../common/ScheduleTiming', () => ({
  ...jest.requireActual('../common/ScheduleTiming'),
  validateScheduleTiming: jest.fn().mockResolvedValue(true)
}))

jest.mock('../IntentContext')

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

window.ResizeObserver = ResizeObserver

beforeEach(() => {
  store.dispatch(intentAIApi.util.resetApiState())
  moment.tz.setDefault('Asia/Singapore')
  const now = +new Date('2024-08-08T12:00:00.000Z')
  jest.spyOn(Date, 'now').mockReturnValue(now)

  mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
    data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
  })
  mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
    data: { intent: mockKpiData }
  })
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
  const intent = { ...mocked, ...data }
  mockIntentContext({ intent, kpis })
  return {
    params: {
      code: mocked.code,
      root: mocked.root,
      sliceId: mocked.sliceId,
      tenantId: 'tenant-id'
    }
  }
}

describe('IntentAIForm', () => {
  beforeEach(() => {
    jest.mocked(get).mockReturnValue('')
    store.dispatch(intentAIApi.util.resetApiState())
    moment.tz.setDefault('Asia/Singapore')
    const now = +new Date('2024-08-08T12:00:00.000Z')
    jest.spyOn(Date, 'now').mockReturnValue(now)
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'VenueHierarchy', { data: mockNetworkHierarchy })
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockApHierarchy })
    mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
      data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
    })
  })

  it('handle schedule intent', async () => {
    const { params } = mockIntentContextWith({
      status: Statuses.new,
      sliceId: 'id1',
      metadata: {
        preferences: {
          enabled: true,
          // Must select partial APs (cannot select all APs)
          excludedAPs: [[{ name: 'name', type: 'zone' }, { name: 'name', type: 'apMac' }]],
          excludedHours: []
        }
      } as IntentDetail['metadata']
    })
    const { container } = render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(container).toMatchSnapshot('step 1')
    await click(actions.getByRole('button', { name: 'Next' }))

    const radioEnabled = await screen.findByRole('radio', { name: 'Reduction in energy footprint' })
    await click(radioEnabled)
    expect(radioEnabled).toBeChecked()
    expect(container).toMatchSnapshot('step 2')
    await click(actions.getByRole('button', { name: 'Next' }))

    const date = await screen.findByPlaceholderText('Select date')
    await click(date)
    await click(await screen.findByRole('cell', { name: '2024-08-09' }))
    expect(date).toHaveValue('08/09/2024')
    const time = await screen.findByPlaceholderText('Select time')
    await selectOptions(time, '12:30 (UTC+08)')
    expect(time).toHaveValue('12.5')
    expect(await screen.findByText(/Local time/)).toBeVisible()
    expect(container).toMatchSnapshot('step 3')
    await click(actions.getByRole('button', { name: 'Next' }))

    expect((await screen.findAllByText('Summary')).length).toEqual(2)
    expect(await screen.findByText('Hours not applied for Energy Saving')).toBeVisible()
    expect(
      await screen.findByText(
        /PowerSave will not be triggered during specific hours set in the Settings/
      )
    ).toBeVisible()
    expect(
      await screen.findByText(
        /PowerSave will not be triggered for the specific APs set in the Settings./
      )
    ).toBeVisible()
    expect(await screen.findByText('Projection')).toBeVisible()

    await click(actions.getByRole('button', { name: 'Apply' }))
    expect(await screen.findByText(/has been updated/)).toBeVisible()
    await click(await screen.findByText(/View/))
    expect(mockNavigate).toBeCalled()
  })

  it('handle pause intent', async () => {
    const { params } = mockIntentContextWith({
      status: Statuses.new,
      metadata: {
        preferences: {
          averagePowerPrice: { currency: 'SGD', value: 0 },
          crrmFullOptimization: true,
          excludedAPs: [[{ name: 'name', type: 'zone' }, { name: 'name', type: 'apMac' }]]
        },
        scheduledAt: '',
        dataEndTime: '2024-08-08T12:00:00.000Z'
      } as IntentDetail['metadata']
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
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()

    expect(await screen.findByPlaceholderText('Select date')).toBeDisabled()
    expect(await screen.findByPlaceholderText('Select time')).toBeDisabled()

    const scheduleEnabled = screen.getByRole('checkbox', {
      name: /following time slots of the week/
    })
    expect(scheduleEnabled).toBeDisabled()

    const excludeAPsEnabled = screen.getByRole('checkbox', { name: /following APs/ })
    expect(excludeAPsEnabled).toBeDisabled()

    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
    expect(screen.queryByText('Hours not applied for Energy Saving')).toBeNull()

    expect(
      await screen.findByText(
        // eslint-disable-next-line max-len
        /IntentAI will maintain the existing network configuration and will cease automated monitoring of configuration for handling PowerSafe request\/response in the network./
      )
    ).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    await click(await screen.findByText(/View/))
    expect(mockNavigate).toBeCalled()
  })

  it('handle active intent in RAI', async () => {
    jest.mocked(get).mockReturnValue('true')
    const { params } = mockIntentContextWith({
      status: Statuses.new,
      path: [
        { name: 'system 1', type: 'system' },
        { name: 'domain', type: 'domain' },
        { name: 'zone 2', type: 'zone' }
      ],
      metadata: {
        unsupportedAPs: ['00:00:00:00:00:01'],
        scheduledAt: '',
        dataEndTime: ''
      } as IntentDetail['metadata']
    })
    render(<IntentAIForm />, {
      route: {
        params,
        path: '/intentAI',
        wrapRoutes: false
      }, wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    const radioEnabled = screen.getByRole('radio', { name: 'Reduction in energy footprint' })
    await click(radioEnabled)
    await click(actions.getByRole('button', { name: 'Next' }))

    const date = await screen.findByPlaceholderText('Select date')
    await click(date)
    await click(await screen.findByRole('cell', { name: '2024-08-09' }))
    const time = await screen.findByPlaceholderText('Select time')
    await selectOptions(time, '12:30 (UTC+08)')

    const excludeAPsEnabled = screen.getByRole('checkbox', { name: /following APs/ })
    await click(excludeAPsEnabled)
    expect(excludeAPsEnabled).toBeChecked()
    await click(excludeAPsEnabled)
    expect(excludeAPsEnabled).not.toBeChecked()

    await click(actions.getByRole('button', { name: 'Next' }))
    expect((await screen.findAllByText('Summary')).length).toEqual(2)

    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    await click(await screen.findByText(/View/))
    expect(mockNavigate).toBeCalled()
  })

  it('handle cancel button', async () => {
    const { params } = mockIntentContextWith({ status: Statuses.new })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    await click(actions.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toBeCalled()
  })
})
