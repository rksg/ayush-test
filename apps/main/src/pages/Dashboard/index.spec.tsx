import '@testing-library/jest-dom'
import { BrowserRouter }             from '@acx-ui/react-router-dom'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import Dashboard from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
  IncidentsDashboard: () => <div data-testid={'analytics-IncidentsDashboard'} title='IncidentsDashboard' />,
  NetworkHistory: () => <div data-testid={'analytics-NetworkHistory'} title='NetworkHistory' />,
  SwitchesTrafficByVolume: () => <div data-testid={'analytics-SwitchesTrafficByVolume'} title='SwitchesTrafficByVolume' />,
  TopApplicationsByTraffic: () => <div data-testid={'analytics-TopApplicationsByTraffic'} title='TopApplicationsByTraffic' />,
  TopSSIDsByClient: () => <div data-testid={'analytics-TopSSIDsByClient'} title='TopSSIDsByClient' />,
  TopSSIDsByTraffic: () => <div data-testid={'analytics-TopSSIDsByTraffic'} title='TopSSIDsByTraffic' />,
  TopSwitchesByError: () => <div data-testid={'analytics-TopSwitchesByError'} title='TopSwitchesByError' />,
  TopSwitchesByPoEUsage: () => <div data-testid={'analytics-TopSwitchesByPoEUsage'} title='TopSwitchesByPoEUsage' />,
  TopSwitchesByTraffic: () => <div data-testid={'analytics-TopSwitchesByTraffic'} title='TopSwitchesByTraffic' />,
  TopSwitchModels: () => <div data-testid={'analytics-TopSwitchModels'} title='TopSwitchModels' />,
  TrafficByVolume: () => <div data-testid={'analytics-TrafficByVolume'} title='TrafficByVolume' />,
  VenuesHealthDashboard: () => <div data-testid={'analytics-VenuesHealthDashboard'} title='VenuesHealthDashboard' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  AlarmWidget: () => <div data-testid={'rc-AlarmWidget'} title='AlarmWidget' />,
  ClientsWidget: () => <div data-testid={'rc-ClientsWidget'} title='ClientsWidget' />,
  DevicesDashboardWidget: () => <div data-testid={'rc-DevicesDashboardWidget'} title='DevicesDashboardWidget' />,
  MapWidget: () => <div data-testid={'rc-MapWidget'} title='MapWidget' />,
  VenuesDashboardWidget: () => <div data-testid={'rc-VenuesDashboardWidget'} title='VenuesDashboardWidget' />
}))
/* eslint-enable */

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

describe('Dashboard', () => {
  it('renders correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(8)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(5)
  })

  it('switches between tabs', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)

    const wifiWidgets = [
      'TrafficByVolume',
      'NetworkHistory',
      'ConnectedClientsOverTime',
      'TopApplicationsByTraffic'
    ]
    wifiWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'Switch' }))

    const switchWidgets = [
      'SwitchesTrafficByVolume',
      'TopSwitchesByPoEUsage',
      'TopSwitchesByTraffic',
      'TopSwitchesByError',
      'TopSwitchModels'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())
  })

  it('should switch tab correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    fireEvent.click(await screen.findByText('Switch'))
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(5)
  })
})
