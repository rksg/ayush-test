import { rest } from 'msw'

import { EdgeTnmServiceUrls, EdgeTnmServiceFixtures } from '@acx-ui/rc/utils'
import { Provider }                                   from '@acx-ui/store'
import { mockServer, render, screen }                 from '@acx-ui/test-utils'

import { EdgeTnmGraphWrapper } from './EdgeTnmGraphWrapper'

const { mockTnmGraphItems, mockTnmItemInfo, mockTnmHistory } = EdgeTnmServiceFixtures
const mockPath = '/:tenantId/services/edgeTnmServices/:serviceId'

describe('Edge TNM Graph Wrapper', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'mock-service-id',
    graphId: 'mock-graph-id',
    graphName: 'mock-graph-name'
  }

  beforeEach(() => {
    mockServer.use(
      rest.get(EdgeTnmServiceUrls.getEdgeTnmGraphItems.url, (req, res, ctx) => {
        return res(ctx.json(mockTnmGraphItems))
      }),
      rest.post(EdgeTnmServiceUrls.getEdgeTnmGraphItemsInfo.url, (req, res, ctx) => {
        return res(ctx.json(mockTnmItemInfo))
      }),
      rest.post(EdgeTnmServiceUrls.getEdgeTnmGraphHistory.url, (req, res, ctx) => {
        return res(ctx.json(mockTnmHistory))
      })
    )})

  it('should render the EdgeTnmGraphWrapper component', async () => {
    render(
      <Provider>
        <EdgeTnmGraphWrapper serviceId='mock-service-id'
          graphId='mock-graph-id'
          graphName='mock-graph-name' />
      </Provider>, {
        route: { path: mockPath, params }
      }
    )

    await screen.findByText('mock-graph-name')
  })
})