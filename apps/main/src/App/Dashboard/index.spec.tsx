import '@testing-library/jest-dom'
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
    render(<Dashboard />)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(6)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(5)
  })

  it('switches between tabs', async () => {
    render(<Dashboard />)

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
      'topSwitchesByModels'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())
  })
})
