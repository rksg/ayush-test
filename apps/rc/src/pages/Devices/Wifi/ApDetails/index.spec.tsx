import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ApDetails } from '.'

jest.mock(
  'analytics/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`analytics-${name}`} title={name} />,
  { virtual: true })

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })


describe('ApDetails', () => {
  // beforeEach(() => {
  //   store.dispatch(venueApi.util.resetApiState())
  //   mockServer.use(
  //     rest.get(
  //       CommonUrlsInfo.getApDetailsHeader.url,
  //       (req, res, ctx) => res(ctx.json(venueDetailHeaderData))
  //     ),
  //     rest.get(
  //       CommonUrlsInfo.getDashboardOverview.url,
  //       (req, res, ctx) => res(ctx.json(data))
  //     ),
  //     rest.post(
  //       CommonUrlsInfo.getVenueNetworkList.url,
  //       (req, res, ctx) => res(ctx.json(venueNetworkList))
  //     ),
  //     rest.post(
  //       CommonUrlsInfo.getNetworkDeepList.url,
  //       (req, res, ctx) => res(ctx.json(networkDeepList))
  //     ),
  //     rest.post(
  //       CommonUrlsInfo.venueNetworkApGroup.url,
  //       (req, res, ctx) => res(ctx.json(venueNetworkApGroup))
  //     )
  //   )
  // })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
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
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
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
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
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
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
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
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
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
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
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
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
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
    render(<Provider><ApDetails /></Provider>, {
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
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/:venueId/venue-details/:activeTab' }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Configure' }))
  })
})
