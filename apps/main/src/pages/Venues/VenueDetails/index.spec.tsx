import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, Dashboard }  from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  venueDetailHeaderData,
  venueNetworkList,
  networkDeepList,
  venueNetworkApGroup
} from '../__tests__/fixtures'

import { VenueDetails } from '.'

const data: Dashboard = {
  summary: {
    alarms: {
      summary: {
        critical: 1,
        major: 1
      },
      totalCount: 2
    }
  }
}

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


describe('VenueDetails', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json(venueDetailHeaderData))
      ),
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (req, res, ctx) => res(ctx.json(data))
      ),
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(venueNetworkList))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.json(networkDeepList))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })

    expect(await screen.findByText('testVenue')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(7)

    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to analytic tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'analytics'
    }
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to client tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'clients'
    }
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to device tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'devices'
    }
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to network tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'networks'
    }
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to service tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'services'
    }
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'timeline'
    }
    const { asFragment } = render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'not-exist'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })
  it('should go to edit page', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'overview'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Configure' }))
  })
})
