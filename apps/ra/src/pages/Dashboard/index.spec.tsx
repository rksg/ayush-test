import { useEffect } from 'react'

import { defaultNetworkPath, getUserProfile }                    from '@acx-ui/analytics/utils'
import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { BrowserRouter }                                         from '@acx-ui/react-router-dom'
import { act, render, renderHook, screen }                       from '@acx-ui/test-utils'
import { RaiPermissions, raiPermissionsList, setRaiPermissions } from '@acx-ui/user'
import { DateRange }                                             from '@acx-ui/utils'

import Dashboard, { useMonitorHeight, useDashBoardUpdatedFilters, getFiltersForRecommendationWidgets } from '.'

const original = Date.now
jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object
    .keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(sets)
})

const mockedUseLayoutContext = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useLayoutContext: () => mockedUseLayoutContext(),
  cssNumber: () => 20
}))

jest.mock('@acx-ui/analytics/utils', () => (
  {
    ...jest.requireActual('@acx-ui/analytics/utils'),
    getUserProfile: jest.fn()
  }))
const defaultMockPermissions = Object.keys(raiPermissionsList)
  .reduce((permissions, name) => ({ ...permissions, [name]: true }), {})
const defaultMockUserProfile = {
  accountId: 'accountId',
  selectedTenant: {
    permissions: defaultMockPermissions,
    id: 'accountId'
  },
  tenants: [
    {
      id: 'accountId',
      permissions: defaultMockPermissions
    },
    {
      id: 'accountId2',
      permissions: defaultMockPermissions
    }
  ]
}

describe('Dashboard', () => {
  beforeEach(() => {
    mockedUseLayoutContext.mockReturnValue({ pageHeaderY: 100 })
    const mockUseUserProfileContext = getUserProfile as jest.Mock
    mockUseUserProfileContext.mockReturnValue(defaultMockUserProfile)
  })
  afterEach(() => jest.restoreAllMocks())

  it('renders correct components for admin', async () => {
    setRaiPermissions({ READ_INTENT_AI: true } as RaiPermissions)
    render(<Dashboard />, { route: true })

    expect(await screen.findByTestId('DidYouKnow')).toBeVisible()
    expect(await screen.findByTestId('IncidentsCountBySeverities')).toBeVisible()
    expect(await screen.findByTestId('SLA')).toBeVisible()
    expect(await screen.findByTestId('ReportTile')).toBeVisible()
    expect(await screen.findByTestId('SANetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('IntentAIWidget')).toBeVisible()
  })

  it('renders correct components for network admin', async () => {
    setRaiPermissions({ READ_INTENT_AI: false } as RaiPermissions)
    render(<Dashboard />, { route: true })

    expect(await screen.findByTestId('DidYouKnow')).toBeVisible()
    expect(await screen.findByTestId('IncidentsCountBySeverities')).toBeVisible()
    expect(await screen.findByTestId('SLA')).toBeVisible()
    expect(await screen.findByTestId('ReportTile')).toBeVisible()
    expect(await screen.findByTestId('SANetworkFilter')).toBeVisible()
    expect(screen.queryByTestId('IntentAIWidget')).toBeNull()
  })

  it('renders correct component when appInsight FF is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    setRaiPermissions({ READ_INTENT_AI: true } as RaiPermissions)
    render(<Dashboard />, { route: true })

    expect(await screen.findByTestId('DidYouKnow')).toBeVisible()
    expect(await screen.findByTestId('AppInsights')).toBeVisible()
    expect(await screen.findByTestId('SLA')).toBeVisible()
    expect(await screen.findByTestId('ReportTile')).toBeVisible()
    expect(await screen.findByTestId('SANetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('IntentAIWidget')).toBeVisible()
  })

  describe('useMonitorHeight', () => {
    it('update height', async () => {
      const { result } = renderHook(() => useMonitorHeight(100))
      expect(result.current).toEqual(window.innerHeight - 100 - 20)
    })
    it('fallback to minHeight if computed height lower', async () => {
      const { innerHeight } = window
      Object.defineProperty(window, 'innerHeight',
        { writable: true, configurable: true, value: 100 })
      const { result } = renderHook(() => useMonitorHeight(100))
      expect(result.current).toEqual(100)
      Object.defineProperty(window, 'innerHeight',
        { writable: true, configurable: true, value: innerHeight })
    })
    it('update height on window resize', async () => {
      const { innerHeight } = window
      Object.defineProperty(window, 'innerHeight',
        { writable: true, configurable: true, value: 1000 })
      const { result } = renderHook(() => useMonitorHeight(100))
      act(() => { window.dispatchEvent(new Event('resize')) })
      expect(result.current).toEqual(1000 - 100 - 20)
      Object.defineProperty(window, 'innerHeight',
        { writable: true, configurable: true, value: innerHeight })
    })
  })
  describe('useDashBoardUpdatedFilters', () => {
    it('should provide default values', async () => {
      const { result } = renderHook(() => useDashBoardUpdatedFilters(),
        {
          wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>
        })
      expect(result.current.range).toEqual(DateRange.last8Hours)
    })
    it('should provide startDate and endDate when custome range is selected', async () => {
      const TestComponent = () => {
        const { startDate, setDateFilterState } = useDashBoardUpdatedFilters()
        useEffect(()=>{
          setDateFilterState({
            range: DateRange.custom,
            startDate: '2021-12-31T00:01:00+00:00',
            endDate: '2022-01-01T00:01:00+00:00'
          })
        },[])
        return <div>{startDate}</div>
      }
      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      )
      expect(await screen.findByText('2021-12-31T00:01:00+00:00')).toBeInTheDocument()
    })
  })
  describe('getFiltersForRecommendationWidgets', () => {
    beforeEach(() => {
      Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
    })
    afterAll(() => Date.now = original)
    it('should return last24hours when last8hours is selected', async () => {
      const result = getFiltersForRecommendationWidgets({
        startDate: 'startDate',
        endDate: 'endDate',
        range: DateRange.last8Hours,
        path: defaultNetworkPath
      })
      expect(result).toEqual({
        path: defaultNetworkPath,
        range: 'Last 7 Days',
        startDate: '2021-12-25T00:01:00+00:00',
        endDate: '2022-01-01T00:01:00+00:00'
      })
    })
    it('should return last24hours', async () => {
      const result = getFiltersForRecommendationWidgets({
        startDate: 'startDate',
        endDate: 'endDate',
        range: DateRange.last30Days,
        path: defaultNetworkPath
      })
      expect(result).toEqual({
        path: defaultNetworkPath,
        range: 'Last 30 Days',
        startDate: 'startDate',
        endDate: 'endDate'
      })
    })
  })
})
