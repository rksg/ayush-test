import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { VenueDetails } from './VenueDetails'

const venueDetailHeaderData = {
  activeNetworkCount: 1,
  aps: {
    totalApCount: 1
  },
  totalClientCount: 2,
  venue: {
    name: 'testVenue'
  }
}

describe('VenueDetails', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueDetailsHeader.url,
        (req, res, ctx) => res(ctx.json(venueDetailHeaderData))
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

  it('should active analytic teb correctly', async () => {
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

  it('should active client teb correctly', async () => {
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

  it('should active device teb correctly', async () => {
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

  it('should active network teb correctly', async () => {
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

  it('should active service teb correctly', async () => {
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

  it('should active timeline teb correctly', async () => {
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

  it('should not have active tab if it does not exist', async () => {
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
