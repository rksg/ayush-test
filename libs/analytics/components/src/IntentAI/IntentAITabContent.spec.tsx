import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'

import { useAnalyticsFilter, defaultNetworkPath }             from '@acx-ui/analytics/utils'
import { defaultTimeRangeDropDownContextValue, useDateRange } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { intentAIUrl, Provider, store }                       from '@acx-ui/store'
import {
  findTBody,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
  waitFor,
  mockGraphqlMutation
} from '@acx-ui/test-utils'
import { WifiScopes }                                                        from '@acx-ui/types'
import { getUserProfile, RaiPermissions, setRaiPermissions, setUserProfile } from '@acx-ui/user'
import { DateRange, setUpIntl }                                              from '@acx-ui/utils'

import { intentListResult, mockAIDrivenRow, filterOptions } from './__tests__/fixtures'
import IntentAITabContent                                   from './IntentAITabContent'
import {
  api,
  TransitionMutationResponse
} from './services'


const mockShowOneClickOptimize =
jest.fn().mockImplementation((_rows, onOk) => onOk && onOk())
const mockFetchWlans = jest.fn()
const mockHandleTransitionIntent =
jest.fn().mockImplementation((_action, _rows, onOk) => onOk && onOk())
const mockRevert = jest.fn()
jest.mock('./useIntentAIActions', () => ({
  ...jest.requireActual('./useIntentAIActions'),
  useIntentAIActions: () => ({
    showOneClickOptimize: mockShowOneClickOptimize,
    fetchWlans: mockFetchWlans,
    handleTransitionIntent: mockHandleTransitionIntent,
    revert: mockRevert
  })
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: jest.fn()
}))

const bannerTestId = 'banner-test'
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useDateRange: jest.fn(),
  Banner: () => <div data-testid={bannerTestId} />
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useRaiR1HelpPageLink: () => ''
}))
setUpIntl({ locale: 'en-US', messages: {} })
//Refer to libs/analytics/components/src/Recommendations/index.spec.tsx
describe('IntentAITabContent', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  const now = new Date('2024-07-20T04:01:00.000Z').getTime()

  const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse

  beforeEach(() => {
    setRaiPermissions({ WRITE_AI_OPERATIONS: true, WRITE_INTENT_AI: true } as RaiPermissions)
    store.dispatch(api.util.resetApiState())
    jest.spyOn(Date, 'now').mockReturnValue(now)
    const pathFilters = { ...filters, path: defaultNetworkPath }
    jest.mocked(useAnalyticsFilter).mockReturnValue({
      filters,
      pathFilters,
      setNetworkPath: jest.fn(),
      raw: []
    })

    jest.mocked(useDateRange).mockReturnValue(defaultTimeRangeDropDownContextValue)
    jest.mocked(get).mockReturnValue('') // get('IS_MLISA_SA')
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockFetchWlans.mockClear()
    mockHandleTransitionIntent.mockClear()
    mockRevert.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    Modal.destroyAll()
  })

  it('should render loader and empty table', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [] } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: { intentFilterOptions: { zones: [], codes: [], statuses: [] } }
    })
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    const loader = screen.queryByRole('img', { name: 'loader' })
    expect(loader).toBeVisible()

    await waitForElementToBeRemoved(loader)

    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })

  it('should render intentAI table for R1', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: intentListResult
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    //search row text
    const rowText = await screen.findAllByText('AI-Driven RRM')
    expect(rowText).toHaveLength(1)
    //search column title
    expect(screen.getByText('Intent')).toBeVisible()
    expect(screen.getByText('Venue')).toBeVisible()
    expect(screen.queryByText('Zone')).toBeNull()
    expect(screen.getAllByRole('checkbox')).toHaveLength(4)
    expect(screen.getByTestId(bannerTestId)).toBeVisible()
  })

  it('should render read only intentAI table for R1 when wifi-u is missing', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ]
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: intentListResult
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const rowText = await screen.findAllByText('AI-Driven RRM')
    expect(rowText).toHaveLength(1)
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('should render intentAI table for RA', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: intentListResult
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent />, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    //search row text
    const rowText = await screen.findAllByText('AI-Driven RRM')
    expect(rowText).toHaveLength(1)
    //search column title
    expect(screen.getByText('Intent')).toBeVisible()
    expect(screen.getByText('Zone')).toBeVisible()
    expect(screen.queryByText('Venue')).toBeNull()
    //search test id
    expect(screen.getByTestId('intentAI')).toBeVisible()
  })

  it('should render One_Click_Optimize', async () => {
    const extractItem = {
      root: 'root',
      sliceId: 'sliceId',
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'new',
      statusTooltip: 'statusTooltip'
    }

    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: 'Optimize' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeVisible()
    expect(await screen.findByRole('button', { name: '1-Click Optimize' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: '1-Click Optimize' }))
    await waitFor(() =>
      expect(mockShowOneClickOptimize).toBeCalledTimes(1)
    )
  })

  it('should render Optimize', async () => {
    const extractItem = {
      root: 'root',
      sliceId: 'sliceId',
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'new',
      statusTooltip: 'statusTooltip'
    }
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: { params: { tenantId: 'tenant-id' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: 'Optimize' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Optimize' }))
    await waitFor(() =>
      expect(mockedUsedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/ai/intentAI/root/sliceId/c-crrm-channel24g-auto/edit',
        search: '?intentTableFilters=%257B%257D'
      })
    )
  })

  it('should render Optimize(RAI)', async () => {
    const extractItem = {
      root: 'root',
      sliceId: 'sliceId',
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'new',
      statusTooltip: 'statusTooltip'
    }
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.mocked(get).mockReturnValue('') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: { params: { tenantId: 'tenant-id' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: 'Optimize' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Optimize' }))
    await waitFor(() =>
      expect(mockedUsedNavigate).toBeCalledWith({
        hash: '',
        pathname: '/tenant-id/t/analytics/intentAI/sliceId/c-crrm-channel24g-auto/edit',
        search: '?intentTableFilters=%257B%257D'
      })
    )
  })

  it('should render Pause', async () => {
    const extractItem = {
      root: 'root',
      sliceId: 'sliceId',
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'new',
      statusTooltip: 'statusTooltip'
    }
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Pause' }))
    await waitFor(() =>
      expect(mockHandleTransitionIntent).toBeCalledTimes(1)
    )
  })

  it('should render Revert', async () => {
    const extractItem = {
      root: 'root',
      sliceId: 'sliceId',
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'revertscheduled',
      displayStatus: 'revertscheduled',
      metadata: { appliedAt: '2024-04-19T07:30:00.000Z' },
      statusTooltip: 'statusTooltip'
    }
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(await screen.findByText('Revert')).toBeVisible()
    await userEvent.click((await screen.findAllByText('Revert'))[0])
    await userEvent.click((await screen.findAllByText('Apply'))[0])
    await waitFor(() =>
      expect(mockRevert).toBeCalledTimes(1)
    )
  })

  it('should render Cancel', async () => {
    const extractItem = {
      root: 'root',
      sliceId: 'sliceId',
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'revertscheduled',
      displayStatus: 'revertscheduled',
      statusTooltip: 'statusTooltip'
    }
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(mockHandleTransitionIntent).toBeCalledTimes(1)
    )
  })

  it('should render Resume', async () => {
    const extractItem = {
      root: 'root',
      sliceId: 'sliceId',
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'paused',
      displayStatus: 'paused-reverted',
      statusTooltip: 'statusTooltip'
    }
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: 'Resume' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Resume' }))
    await waitFor(() =>
      expect(mockHandleTransitionIntent).toBeCalledTimes(1)
    )
  })

})
