import { rest } from 'msw'

import { edgeApi }                           from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { NodesTabs } from './'

const { mockEdgeClusterList } = EdgeGeneralFixtures

describe('EdgeCluster NodesTabs', () => {
  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should display all nodes', async () => {
    render(<Provider>
      <NodesTabs
        clusterId='edge_cluster_0'
      />
    </Provider>)

    await screen.findByRole('tab', { name: 'Smart Edge 1' })
    screen.getByRole('tab', { name: 'Smart Edge 2' })
    expect(screen.getAllByRole('tab').length).toBe(2)
  })
})