import '@testing-library/jest-dom'
import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { BrowserRouter }                  from '@acx-ui/react-router-dom'
import { Provider }                       from '@acx-ui/store'
import { fireEvent, render, screen }      from '@acx-ui/test-utils'

import Dashboard from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
  IncidentsDashboardv2: () => <div data-testid={'analytics-IncidentsDashboardv2'} title='IncidentsDashboard' />,
  NetworkHistory: () => <div data-testid={'analytics-NetworkHistory'} title='NetworkHistory' />,
  SwitchesTrafficByVolume: () => <div data-testid={'analytics-SwitchesTrafficByVolume'} title='SwitchesTrafficByVolume' />,
  TopAppsByTraffic: () => <div data-testid={'analytics-TopAppsByTraffic'} title='TopAppsByTraffic' />,
  TopSSIDsByClient: () => <div data-testid={'analytics-TopSSIDsByClient'} title='TopSSIDsByClient' />,
  TopWiFiNetworks: () => <div data-testid={'analytics-TopWiFiNetworks'} title='TopWiFiNetworks' />,
  TopSwitchesByError: () => <div data-testid={'analytics-TopSwitchesByError'} title='TopSwitchesByError' />,
  TopSwitchesByPoEUsage: () => <div data-testid={'analytics-TopSwitchesByPoEUsage'} title='TopSwitchesByPoEUsage' />,
  TopSwitchesByTraffic: () => <div data-testid={'analytics-TopSwitchesByTraffic'} title='TopSwitchesByTraffic' />,
  TopSwitchModels: () => <div data-testid={'analytics-TopSwitchModels'} title='TopSwitchModels' />,
  TrafficByVolume: () => <div data-testid={'analytics-TrafficByVolume'} title='TrafficByVolume' />,
  DidYouKnow: () => <div data-testid={'analytics-DidYouKnow'} title='DidYouKnow' />,
  ClientExperience: () => <div data-testid={'analytics-ClientExperience'} title='ClientExperience' />,
  TopEdgesByTraffic: () => <div data-testid={'analytics-TopEdgesByTraffic'} title='TopEdgesByTraffic' />,
  TopEdgesByResources: () => <div data-testid={'analytics-TopEdgesByResources'} title='TopEdgesByResources' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  AlarmWidgetV2: () => <div data-testid={'rc-AlarmWidgetV2'} title='AlarmWidgetV2' />,
  ClientsWidgetV2: () => <div data-testid={'rc-ClientsWidgetV2'} title='ClientsWidgetV2' />,
  DevicesDashboardWidgetV2: () => <div data-testid={'rc-DevicesDashboardWidgetV2'} title='DevicesDashboardWidgetV2' />,
  MapWidgetV2: () => <div data-testid={'rc-MapWidgetV2'} title='MapWidgetV2' />,
  VenuesDashboardWidgetV2: () => <div data-testid={'rc-VenuesDashboardWidgetV2'} title='VenuesDashboardWidgetV2' />
}))
jest.mock('@acx-ui/main/components', () => ({
  VenueFilter: () => <div data-testid={'rc-VenueFilter'} title='VenueFilter' />
}))
/* eslint-enable */

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

describe('Dashboard', () => {
  it('renders correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(6)
  })

  it('switches between tabs', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    expect(localStorage.getItem('dashboard-tab')).toBe(undefined)

    const wifiWidgets = [
      'TrafficByVolume',
      'ConnectedClientsOverTime',
      'TopAppsByTraffic'
    ]
    wifiWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'Switch' }))
    expect(localStorage.getItem('dashboard-tab')).toBe('switch')

    const switchWidgets = [
      'SwitchesTrafficByVolume',
      'TopSwitchesByPoEUsage',
      'TopSwitchesByTraffic',
      'TopSwitchesByError',
      'TopSwitchModels'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'SmartEdge' }))
    expect(localStorage.getItem('dashboard-tab')).toBe('edge')

    const edgeWidgets = [
      'TopEdgesByTraffic',
      'TopEdgesByResources'
    ]
    edgeWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())
  })

  it('should switch tab correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    fireEvent.click(await screen.findByText('Switch'))
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(8)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(6)
  })

  it('should show report link correctly', async () => {
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    expect(screen.getByText('See more reports')).toBeVisible()
  })

  it('should hide edge tab when FF is off', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    expect(await screen.findAllByRole('radio')).toHaveLength(2)
  })

  it('should hide edge tab when EDGE_STATS_TOGGLE is off', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<BrowserRouter><Provider><Dashboard /></Provider></BrowserRouter>)
    expect(await screen.findAllByRole('radio')).toHaveLength(2)
  })
})
