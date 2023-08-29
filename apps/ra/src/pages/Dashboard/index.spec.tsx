import { act, render, renderHook, screen } from '@acx-ui/test-utils'

import Dashboard, { useMonitorHeight } from '.'

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
    expect(await screen.findByTestId('NetworkHistory')).toBeVisible()
    expect(await screen.findByTestId('SLA')).toBeVisible()
    expect(await screen.findByTestId('ReportTile')).toBeVisible()
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
})
