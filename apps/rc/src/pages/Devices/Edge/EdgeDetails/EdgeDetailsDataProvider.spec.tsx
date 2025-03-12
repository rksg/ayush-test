import { useContext } from 'react'

import { rest } from 'msw'

import { edgeApi }                           from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                   from '@acx-ui/store'
import { mockServer, renderHook, waitFor }   from '@acx-ui/test-utils'

import { EdgeDetailsDataContext, EdgeDetailsDataProvider } from './EdgeDetailsDataProvider'

const { mockEdgeList, mockEdgeCluster } = EdgeGeneralFixtures

describe('EdgeDetails - EdgeDetailsDataProvider', () => {
  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeCluster.url,
        (req, res, ctx) => res(ctx.json(mockEdgeCluster))
      )
    )
  })

  it('should get data correctly', async () => {
    const { result } = renderHook(() => useContext(EdgeDetailsDataContext), {
      wrapper: ({ children }) => <Provider>
        <EdgeDetailsDataProvider
          serialNumber='serial-number'
        >
          {children}
        </EdgeDetailsDataProvider>
      </Provider>
    })
    await waitFor(() => expect(result.current?.currentEdgeStatus?.name).toBe('Smart Edge 1'))
    await waitFor(() => expect(result.current?.currentCluster?.name).toBe('Edge Cluster 1'))
  })
})