import { act, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import Dashboard, { useMonitorHeight } from '.'

jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object
    .keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(sets)
})

describe('Dashboard', () => {
  it('renders correct components', async () => {
    render(<Dashboard />, { route: true })

    expect(await screen.findByTestId('DidYouKnow')).toBeVisible()
    expect(await screen.findByTestId('IncidentsCountBySeverities')).toBeVisible()
  })
})

describe('useMonitorHeight', () => {
  afterEach(() => jest.restoreAllMocks())
  it('update height', async () => {
    const box = { top: 100 } as DOMRect
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(box)

    const { result, rerender } = renderHook(() => useMonitorHeight(100))
    render(<div ref={result.current[1]} />)
    rerender()

    expect(result.current[0]).toEqual(window.innerHeight - box.top - 20)
  })
  it('fallback to minHeight if computed height lower', async () => {
    const box = { top: window.innerHeight } as DOMRect
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(box)

    const { result, rerender } = renderHook(() => useMonitorHeight(100))
    render(<div ref={result.current[1]} />)
    rerender()

    expect(result.current[0]).toEqual(100)
  })
  it('update height on window resize', async () => {
    const box = { top: 100 } as DOMRect
    const spy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(box)

    const { result, rerender } = renderHook(() => useMonitorHeight(100))
    render(<div ref={result.current[1]} />)
    rerender()

    spy.mockReturnValue({ ...box, top: 200 })
    act(() => { window.dispatchEvent(new Event('resize')) })

    expect(result.current[0]).toEqual(window.innerHeight - 200 - 20)
  })
})
