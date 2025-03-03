import { rest } from 'msw'

import { useIsSplitOn, Features }                      from '@acx-ui/feature-toggle'
import { EdgeCompatibilityFixtures, EdgeUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { VenueEdge } from '.'

const { mockEdgeCompatibilitiesVenue, mockEdgeCompatibilitiesVenueV1_1 } = EdgeCompatibilityFixtures

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgesTable: (props: {
    incompatibleCheck:boolean,
    filterables: Record<string, unknown>
  }) => <div data-testid={'EdgesTable'} >
    <div>incompatibleCheck:{''+props.incompatibleCheck}</div>
    <div>filterables:{JSON.stringify(props.filterables)}</div>
  </div>
}))

describe('VenueEdge', () => {
  const params = {
    tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
    venueId: '8caa8f5e01494b5499fa156a6c565138',
    activeTab: 'devices',
    activeSubTab: 'edge'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeCompatibilitiesVenue))
      ),
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilitiesV1_1.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeCompatibilitiesVenueV1_1))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><VenueEdge /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })

    expect(await screen.findByTestId('EdgesTable')).toBeVisible()

    const target = await screen.findByRole('link', { name: 'Add RUCKUS Edge' })
    expect(target.getAttribute('href')).toBe(`/${params.tenantId}/t/devices/edge/add`)
  })

  it('should render edge compatibility warning correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      [Features.EDGES_TOGGLE, Features.EDGE_COMPATIBILITY_CHECK_TOGGLE].includes(ff as Features))

    render(<Provider><VenueEdge /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })

    const edgeTable = await screen.findByTestId('EdgesTable')
    expect(edgeTable).toBeVisible()

    const target = screen.getByRole('link', { name: 'Add RUCKUS Edge' })
    expect(target.getAttribute('href')).toBe(`/${params.tenantId}/t/devices/edge/add`)
    await waitFor(() => expect(within(edgeTable).queryByText('incompatibleCheck:true')).toBeValid())

    // eslint-disable-next-line max-len
    await waitFor(() => expect(edgeTable).toHaveTextContent('SD-LAN'))
    expect(edgeTable).toHaveTextContent('Tunnel Profile')
  })

  it('should render edge compatibility warning correctly - V1_1', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      [Features.EDGES_TOGGLE, Features.EDGE_COMPATIBILITY_CHECK_TOGGLE,
        Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE].includes(ff as Features))

    render(<Provider><VenueEdge /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })

    const edgeTable = await screen.findByTestId('EdgesTable')
    expect(edgeTable).toBeVisible()

    const target = screen.getByRole('link', { name: 'Add RUCKUS Edge' })
    expect(target.getAttribute('href')).toBe(`/${params.tenantId}/t/devices/edge/add`)
    await waitFor(() => expect(within(edgeTable).queryByText('incompatibleCheck:true')).toBeValid())

    // eslint-disable-next-line max-len
    await waitFor(() => expect(edgeTable).toHaveTextContent('SD-LAN'))
    expect(edgeTable).toHaveTextContent('Tunnel Profile')
  })
})
