import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { generatePath }                          from '@acx-ui/react-router-dom'
import { Provider, store  }                      from '@acx-ui/store'
import { mockServer, fireEvent, render, screen } from '@acx-ui/test-utils'

import { VenueOverviewTab } from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
  IncidentBySeverity: () => <div data-testid={'analytics-IncidentBySeverity'} title='IncidentBySeverity' />,
  NetworkHistory: () => <div data-testid={'analytics-NetworkHistory'} title='NetworkHistory' />,
  SwitchesTrafficByVolume: () => <div data-testid={'analytics-SwitchesTrafficByVolume'} title='SwitchesTrafficByVolume' />,
  TopSwitchModels: () => <div data-testid={'analytics-TopSwitchModels'} title='TopSwitchModels' />,
  TopApplicationsByTraffic: () => <div data-testid={'analytics-TopApplicationsByTraffic'} title='TopApplicationsByTraffic' />,
  TopSSIDsByClient: () => <div data-testid={'analytics-TopSSIDsByClient'} title='TopSSIDsByClient' />,
  TopSSIDsByTraffic: () => <div data-testid={'analytics-TopSSIDsByTraffic'} title='TopSSIDsByTraffic' />,
  TopSwitchesByError: () => <div data-testid={'analytics-TopSwitchesByError'} title='TopSwitchesByError' />,
  TopSwitchesByPoEUsage: () => <div data-testid={'analytics-TopSwitchesByPoEUsage'} title='TopSwitchesByPoEUsage' />,
  TopSwitchesByTraffic: () => <div data-testid={'analytics-TopSwitchesByTraffic'} title='TopSwitchesByTraffic' />,
  TrafficByVolume: () => <div data-testid={'analytics-TrafficByVolume'} title='TrafficByVolume' />,
  VenueHealth: () => <div data-testid={'analytics-VenueHealth'} title='VenueHealth' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  TopologyFloorPlanWidget: () => <div data-testid={'rc-TopologyFloorPlanWidget'} title='TopologyFloorPlanWidget' />,
  VenueAlarmWidget: () => <div data-testid={'rc-VenueAlarmWidget'} title='VenueAlarmWidget' />,
  VenueDevicesWidget: () => <div data-testid={'rc-VenueDevicesWidget'} title='VenueDevicesWidget' />
}))
/* eslint-enable */

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const url = generatePath(CommonUrlsInfo.getVenueDetailsHeader.url, params)

const venueDetailHeaderData = {
  venue: {
    name: 'testVenue'
  }
}

describe('VenueOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(url, (_, res, ctx) => res(ctx.json(venueDetailHeaderData)))
    )
  })

  it('renders correctly', async () => {
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(8)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(3)
  })

  it('switches between tabs', async () => {
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })

    const wifiWidgets = [
      'TrafficByVolume',
      'NetworkHistory',
      'ConnectedClientsOverTime',
      'TopApplicationsByTraffic',
      'TopSSIDsByTraffic',
      'TopSSIDsByClient'
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
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })

    fireEvent.click(await screen.findByText('Switch'))
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(3)
  })
})
