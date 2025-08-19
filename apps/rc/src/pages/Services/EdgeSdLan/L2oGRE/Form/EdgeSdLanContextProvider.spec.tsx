import { rest } from 'msw'

import { CommonUrlsInfo, EdgeGeneralFixtures, EdgePinFixtures, EdgePinUrls, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeTunnelProfileFixtures, EdgeUrlsInfo, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                              from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                                                                                                                       from '@acx-ui/test-utils'

import { EdgeSdLanContextProvider, useEdgeSdLanContext } from './EdgeSdLanContextProvider'

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockPinStatsList } = EdgePinFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  useGetAvailableTunnelProfile: jest.fn().mockImplementation(() => ({
    isDataLoading: false,
    availableTunnelProfiles: mockedTunnelProfileViewData.data
  }))
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useGetSoftGreScopeVenueMap: jest.fn().mockReturnValue({})
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

describe('EdgeSdLanContextProvider', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_, res, ctx) => res(ctx.json(mockPinStatsList))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedMvSdLanDataList }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should get data correctly', async () => {
    const { result } = renderHook(() => useEdgeSdLanContext(), {
      wrapper: ({ children }) => <Provider>
        <EdgeSdLanContextProvider>
          {children}
        </EdgeSdLanContextProvider>
      </Provider>
    })

    await waitFor(() => {
      expect(result.current.allSdLans).toEqual(mockedMvSdLanDataList)
    })
    await waitFor(() =>
      expect(result.current.allPins).toEqual(mockPinStatsList.data)
    )
    expect(result.current.allSoftGreVenueMap).toEqual({})
    await waitFor(() =>
      expect(result.current.availableTunnelProfiles).toEqual(mockedTunnelProfileViewData.data)
    )
    await waitFor(() =>
      expect(result.current.associatedEdgeClusters).toEqual(mockEdgeClusterList.data)
    )
    await waitFor(() =>
      expect(result.current.requiredFwMap).toEqual({
        [IncompatibilityFeatures.L2OGRE]: undefined
      })
    )
    expect(result.current.allVenues).toEqual([])
  })
})