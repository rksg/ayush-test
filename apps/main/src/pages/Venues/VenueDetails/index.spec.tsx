import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, Dashboard }  from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  venueDetailHeaderData
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

jest.mock(
  'analytics/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`analytics-${name}`} title={name} />,
  { virtual: true })

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

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
      )
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
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
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
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
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
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
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
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
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
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
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
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
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
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
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'not-exist'
    }
    render(<Provider><VenueDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })
})
