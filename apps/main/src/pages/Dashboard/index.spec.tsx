import '@testing-library/jest-dom'
import { BrowserRouter }             from '@acx-ui/react-router-dom'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import Dashboard from '.'

jest.mock(
  'analytics/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`analytics-${name}`} title={name} />,
  { virtual: true })

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

describe('Dashboard', () => {
  it('renders correctly', async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(8)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(5)
  })

  it('switches between tabs', async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>)

    const wifiWidgets = [
      'trafficByVolume',
      'networkHistory',
      'connectedClientsOverTime',
      'topApplicationsByTraffic'
    ]
    wifiWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'Switch' }))

    const switchWidgets = [
      'switchTrafficByVolume',
      'topSwitchesByPoeUsage',
      'topSwitchesByTraffic',
      'topSwitchesByErrors',
      'topSwitchModelsByCount'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())
  })

  it('should switch tab correctly', async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>)
    fireEvent.click(await screen.findByText('Switch'))
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(5)
  })
})
