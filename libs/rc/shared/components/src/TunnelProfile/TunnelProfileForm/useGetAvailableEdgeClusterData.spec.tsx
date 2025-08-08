import { rest } from 'msw'

import { EdgeConfigTemplateUrlsInfo, EdgeGeneralFixtures, EdgeUrlsInfo, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                         from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                                  from '@acx-ui/test-utils'

import { useGetAvailableEdgeClusterData } from './useGetAvailableEdgeClusterData'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

const mockTunnelProfileRequest = jest.fn()
const mockTunnelProfileTemplateRequest = jest.fn()

const { mockEdgeClusterList } = EdgeGeneralFixtures

describe('useGetAvailableEdgeClusterData', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => {
          mockTunnelProfileRequest()
          return res(ctx.json({ data: [
            { destinationEdgeClusterId: 'clusterId_1' },
            { destinationEdgeClusterId: 'clusterId_2' }
          ] }))
        }
      ),
      rest.post(
        EdgeConfigTemplateUrlsInfo.getTunnelProfileTemplateViewDataList.url,
        (req, res, ctx) => {
          mockTunnelProfileTemplateRequest()
          return res(ctx.json({ data: [
            { destinationEdgeClusterId: 'clusterId_3' },
            { destinationEdgeClusterId: 'clusterId_4' }
          ] }))
        }
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return available cluster data with isTemplate false', async () => {
    const { result } = renderHook(
      () => useGetAvailableEdgeClusterData({
        isTemplate: false
      }),
      {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      }
    )

    await waitFor(() => expect(mockTunnelProfileRequest).toHaveBeenCalled())
    expect(result.current.availableClusterData).toEqual(mockEdgeClusterList.data.slice(2, 5))
  })

  it('should return available cluster data with isTemplate true', async () => {
    const { result } = renderHook(
      () => useGetAvailableEdgeClusterData({
        isTemplate: true
      }),
      {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      }
    )
    await waitFor(() => expect(mockTunnelProfileTemplateRequest).toHaveBeenCalled())
    expect(result.current.availableClusterData).toEqual([
      ...mockEdgeClusterList.data.slice(0, 2),
      ...mockEdgeClusterList.data.slice(4, 5)
    ])
  })

  it('should return available cluster data with currentBoundEdgeClusterId', async () => {
    const { result } = renderHook(
      () => useGetAvailableEdgeClusterData({
        isTemplate: false,
        currentBoundEdgeClusterId: 'clusterId_2'
      }),
      {
        wrapper: ({ children }) => <Provider>{children}</Provider>
      }
    )
    await waitFor(() => expect(mockTunnelProfileRequest).toHaveBeenCalled())
    expect(result.current.availableClusterData).toEqual(mockEdgeClusterList.data.slice(1, 5))
  })
})