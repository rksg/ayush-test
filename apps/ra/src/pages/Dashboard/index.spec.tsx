import { useEffect } from 'react'

import { BrowserRouter }                   from '@acx-ui/react-router-dom'
import { act, render, renderHook, screen } from '@acx-ui/test-utils'
import { DateRange }                       from '@acx-ui/utils'

import Dashboard, { useMonitorHeight, useDashBoardUpdatedFilters } from '.'

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

describe('Dashboard', () => {
  beforeEach(() => mockedUseLayoutContext.mockReturnValue({ pageHeaderY: 100 }))
  afterEach(() => jest.restoreAllMocks())

  it('renders correct components', async () => {
    render(<Dashboard />, { route: true })

    expect(await screen.findByTestId('DidYouKnow')).toBeVisible()
    expect(await screen.findByTestId('IncidentsCountBySeverities')).toBeVisible()
    expect(await screen.findByTestId('SLA')).toBeVisible()
    expect(await screen.findByTestId('ReportTile')).toBeVisible()
    expect(await screen.findByTestId('SANetworkFilter')).toBeVisible()
    expect(await screen.findByTestId('AIDrivenRRM')).toBeVisible()
    expect(await screen.findByTestId('AIOperations')).toBeVisible()
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
})
