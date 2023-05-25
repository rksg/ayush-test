import { rest } from 'msw'

import { EdgeUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockEdgeList } from '../__tests__/fixtures'

import { VenueEdge } from '.'

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
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      )
      // rest.post(
      //   CommonUrlsInfo.getVenuesList.url,
      //   (req, res, ctx) => res(ctx.json({ data: [] }))
      // )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><VenueEdge /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/venue-details/:activeTab/:activeSubTab' }
    })

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(6)
  })
})