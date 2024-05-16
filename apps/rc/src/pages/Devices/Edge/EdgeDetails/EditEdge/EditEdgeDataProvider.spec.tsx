import { useContext } from 'react'

import { rest } from 'msw'

import { useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import { edgeApi }                                                                    from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                            from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                            from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataProvider } from './EditEdgeDataProvider'

const {
  mockEdgeList, mockEdgeData, mockEdgeClusterList,
  mockEdgeDnsServersData, mockStaticRoutes, mockEdgeCluster
} = EdgeGeneralFixtures
const { mockEdgePortConfig, mockEdgePortStatus } = EdgePortConfigFixtures
const { mockEdgeLagStatusList, mockedEdgeLagList } = EdgeLagFixtures

describe('EditEdge - EditEdgeDataProvider', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeUrlsInfo.getEdge.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeLagStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeLagStatusList))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeLagList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeLagList))
      ),
      rest.get(
        EdgeUrlsInfo.getDnsServers.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDnsServersData))
      ),
      rest.get(
        EdgeUrlsInfo.getStaticRoutes.url,
        (req, res, ctx) => res(ctx.json(mockStaticRoutes))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeCluster.url,
        (req, res, ctx) => res(ctx.json(mockEdgeCluster))
      )
    )
  })

  it('should get data correctly', async () => {
    const { result } = renderHook(() => useContext(EditEdgeDataContext), {
      wrapper: ({ children }) => <Provider>
        <EditEdgeDataProvider
          serialNumber='serial-number'
        >
          {children}
        </EditEdgeDataProvider>
      </Provider>
    })
    await waitFor(() => expect(result.current.generalSettings?.serialNumber).toBe('96123456789'))
    await waitFor(() => expect(result.current.clusterInfo?.clusterId).toBe('clusterId_1'))
    await waitFor(() => expect(result.current.portData.length).toBe(5))
    await waitFor(() => expect(result.current.lagData.length).toBe(2))
    await waitFor(() => expect(result.current.lagStatus.length).toBe(2))
    await waitFor(() => expect(result.current.dnsServersData?.primary).toBe('1.1.1.1'))
    await waitFor(() => expect(result.current.dnsServersData?.secondary).toBe('2.2.2.2'))
    await waitFor(() => expect(result.current.staticRouteData?.routes.length).toBe(2))
    await waitFor(() => expect(result.current.isCluster).toBeTruthy())
    await waitFor(() => expect(result.current.clusterConfig?.id).toBe('clusterId_1'))
  })
})