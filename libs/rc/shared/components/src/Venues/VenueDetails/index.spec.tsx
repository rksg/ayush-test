import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { venueApi }                            from '@acx-ui/rc/services'
import { CommonUrlsInfo, DHCPUrls, Dashboard } from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen }          from '@acx-ui/test-utils'
import { RolesEnum }                           from '@acx-ui/types'
import { getUserProfile, setUserProfile }      from '@acx-ui/user'

import {
  venueDetailHeaderData,
  venueNetworkList,
  networkDeepList,
  venueNetworkApGroup,
  serviceProfile
} from '../__tests__/fixtures'

import { events, eventsMeta } from './VenueTimelineTab/__tests__/fixtures'

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

jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={`analytics-${key}`} title={key} />])
  return Object.fromEntries(sets)
})
jest.mock('@acx-ui/rc/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/rc/components'))
    .map(key => [key, () => <div data-testid={`rc-${key}`} title={key} />])
  return Object.fromEntries(sets)
})

jest.mock('./VenueAnalyticsTab', () => ({
  VenueAnalyticsTab: () => <div data-testid={'rc-VenueAnalyticsTab'} title='VenueAnalyticsTab' />
}))
jest.mock('./VenueClientsTab', () => ({
  VenueClientsTab: () => <div data-testid={'rc-VenueClientsTab'} title='VenueClientsTab' />
}))
jest.mock('./VenueDevicesTab', () => ({
  VenueDevicesTab: () => <div data-testid={'rc-VenueDevicesTab'} title='VenueDevicesTab' />
}))
jest.mock('./VenueNetworksTab', () => ({
  VenueNetworksTab: () => <div data-testid={'rc-VenueNetworksTab'} title='VenueNetworksTab' />
}))
jest.mock('./VenueServicesTab', () => ({
  VenueServicesTab: () => <div data-testid={'rc-VenueServicesTab'} title='VenueServicesTab' />
}))
jest.mock('./VenueTimelineTab', () => ({
  VenueTimelineTab: () => <div data-testid={'rc-VenueTimelineTab'} title='VenueTimelineTab' />
}))

describe('VenueDetails', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

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
      ),
      rest.get(
        DHCPUrls.getVenueDHCPServiceProfile.url,
        (_, res, ctx) => res(ctx.json(serviceProfile))
      ),
      rest.post(
        CommonUrlsInfo.getEventList.url,
        (_, res, ctx) => res(ctx.json(events))
      ),
      rest.post(
        CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventsMeta))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [{ apMac: '11:22:33:44:55:66' }], totalCount: 0 }))
      ),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'overview'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByText('testVenue')).toBeVisible()
    expect(screen.getAllByRole('tab')).toHaveLength(7)
  })

  it('should navigate to analytic tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'analytics'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/t/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueAnalyticsTab')).toBeVisible()
  })

  it('should navigate to client tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'clients'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/t/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueClientsTab')).toBeVisible()
  })

  it('should navigate to device tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'devices'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueDevicesTab')).toBeVisible()
  })

  it('should navigate to network tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'networks'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueNetworksTab')).toBeVisible()
  })

  it('should navigate to service tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'services'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(screen.getAllByRole('tab', { selected: true }).at(0)?.textContent)
      .toEqual('Services')
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'timeline'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })
    expect(await screen.findByTestId('rc-VenueTimelineTab')).toBeVisible()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'not-exist'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/t/:venueId/venue-details/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

  it('should hide analytics when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'analytics'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })
    expect(screen.queryByTestId('rc-VenueAnalyticsTab')).toBeNull()
  })
})
