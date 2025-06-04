import { useContext } from 'react'

import { rest } from 'msw'

import { useIsSplitOn }                                                                                                         from '@acx-ui/feature-toggle'
import { edgeApi }                                                                                                              from '@acx-ui/rc/services'
import { EdgeCompatibilityFixtures, EdgeGeneralFixtures, EdgeLagFixtures, EdgePortConfigFixtures, EdgeSdLanUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                      from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                                                                      from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataProvider } from './EditEdgeDataProvider'

const {
  mockEdgeList, mockEdgeData, mockEdgeClusterList,
  mockEdgeDnsServersData, mockStaticRoutes, mockEdgeCluster,
  mockedHaNetworkSettings
} = EdgeGeneralFixtures
const { mockEdgePortStatus } = EdgePortConfigFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures
const { mockEdgeFeatureCompatibilities } = EdgeCompatibilityFixtures

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
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_req, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeLagStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeLagStatusList))
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
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeClusterNetworkSettings.url,
        (_, res, ctx) => res(ctx.json(mockedHaNetworkSettings))
      )
    )
  })

  it('should get data correctly', async () => {
    const { result } = renderHook(() => useContext(EditEdgeDataContext), {
      wrapper: ({ children }) => <Provider>
        <EditEdgeDataProvider
          serialNumber={mockEdgeClusterList.data[0].edgeList[0].serialNumber}
        >
          {children}
        </EditEdgeDataProvider>
      </Provider>
    })
    await waitFor(() => expect(result.current.generalSettings?.serialNumber).toBe('96123456789'))
    await waitFor(() => expect(result.current.clusterInfo?.clusterId).toBe('clusterId_1'))
    await waitFor(() => expect(result.current.portData.length).toBe(2))
    await waitFor(() => expect(result.current.lagData.length).toBe(1))
    await waitFor(() => expect(result.current.lagStatus.length).toBe(2))
    await waitFor(() => expect(result.current.dnsServersData?.primary).toBe('1.1.1.1'))
    await waitFor(() => expect(result.current.dnsServersData?.secondary).toBe('2.2.2.2'))
    await waitFor(() => expect(result.current.staticRouteData?.routes.length).toBe(2))
    await waitFor(() => expect(result.current.isClusterFormed).toBeTruthy())
    await waitFor(() => expect(result.current.clusterConfig?.id).toBe('clusterId_1'))
    await waitFor(() => expect(result.current.isSupportAccessPort).toBeFalsy())
    await waitFor(() => expect(result.current.subInterfaceData?.length).toBe(3))
  })
})