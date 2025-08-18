import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import {
  EdgeConfigTemplateUrlsInfo,
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeTunnelProfileFixtures,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { mockServer, renderHook } from '@acx-ui/test-utils'

import { useGetAvailableTunnelTemplate } from './useGetAvailableTunnelTemplate'

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const modifiedMockSdLanDataList = cloneDeep(mockedMvSdLanDataList)
modifiedMockSdLanDataList[0].tunnelProfileId = mockedTunnelProfileViewData.data[0].id

describe('useGetAvailableTunnelProfile', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(EdgeSdLanUrls.getEdgeSdLanViewDataList.url, (_, res, ctx) => {
        return res(ctx.json({ data: modifiedMockSdLanDataList }))
      }),
      rest.post(
        EdgeConfigTemplateUrlsInfo.getTunnelProfileTemplateViewDataListSkipRecRewrite.url,
        (_, res, ctx) => {
          return res(ctx.json(mockedTunnelProfileViewData))
        }),
      rest.post(EdgeUrlsInfo.getEdgeClusterStatusList.url, (_, res, ctx) => {
        return res(ctx.json(mockEdgeClusterList))
      })
    )
  })

  it('should return the available tunnel profiles', () => {
    const { result } = renderHook(() => useGetAvailableTunnelTemplate(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    expect(result.current.availableTunnelTemplates.length).toBe(4)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[0].id).toBe(mockedTunnelProfileViewData.data[1].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[1].id).toBe(mockedTunnelProfileViewData.data[2].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[2].id).toBe(mockedTunnelProfileViewData.data[3].id)
  })

  it('bound cluster at the same venue should be excluded', () => {
    // Create a modified mock where cluster 1 and cluster 2 are in the same venue
    const modifiedMockEdgeClusterList = cloneDeep(mockEdgeClusterList)
    modifiedMockEdgeClusterList.data[1].venueId = modifiedMockEdgeClusterList.data[0].venueId

    // Create a modified tunnel profile data where tunnelProfileId1 uses clusterId_1 and tunnelProfileId2 uses clusterId_2
    const modifiedTunnelProfileData = cloneDeep(mockedTunnelProfileViewData)
    modifiedTunnelProfileData.data[0].destinationEdgeClusterId = 'clusterId_1'
    modifiedTunnelProfileData.data[1].destinationEdgeClusterId = 'clusterId_2'

    mockServer.use(
      rest.post(EdgeSdLanUrls.getEdgeSdLanViewDataList.url, (_, res, ctx) => {
        return res(ctx.json({ data: modifiedMockSdLanDataList }))
      }),
      rest.post(
        EdgeConfigTemplateUrlsInfo.getTunnelProfileTemplateViewDataListSkipRecRewrite.url,
        (_, res, ctx) => {
          return res(ctx.json(modifiedTunnelProfileData))
        }),
      rest.post(EdgeUrlsInfo.getEdgeClusterStatusList.url, (_, res, ctx) => {
        return res(ctx.json(modifiedMockEdgeClusterList))
      })
    )

    const { result } = renderHook(() => useGetAvailableTunnelTemplate(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })



    // Should exclude tunnel profiles that are bound to clusters in the same venue
    // The first SD-LAN uses tunnelProfileId1 (cluster 1), so tunnelProfileId2 (cluster 2, same venue) should be excluded
    expect(result.current.availableTunnelTemplates.length).toBe(3)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[0].id).toBe(mockedTunnelProfileViewData.data[2].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[1].id).toBe(mockedTunnelProfileViewData.data[3].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[2].id).toBe(mockedTunnelProfileViewData.data[4].id)
  })

  it('should return the correct available tunnel profiles when sdLanServiceId is provided', () => {
    const { result } = renderHook(() =>
      useGetAvailableTunnelTemplate({ serviceIds: [modifiedMockSdLanDataList[0].id] }), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    expect(result.current.availableTunnelTemplates.length).toBe(5)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[0].id).toBe(mockedTunnelProfileViewData.data[0].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[1].id).toBe(mockedTunnelProfileViewData.data[1].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[2].id).toBe(mockedTunnelProfileViewData.data[2].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[3].id).toBe(mockedTunnelProfileViewData.data[3].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelTemplates[4].id).toBe(mockedTunnelProfileViewData.data[4].id)
  })

  it('should include L2GRE tunnel profiles even without destination cluster', () => {
    const { result } = renderHook(() => useGetAvailableTunnelTemplate(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    // L2GRE tunnel profiles should be included regardless of cluster binding
    const l2greProfiles = result.current.availableTunnelTemplates.filter(
      profile => profile.tunnelType === 'L2GRE'
    )
    expect(l2greProfiles.length).toBeGreaterThan(0)

    // Verify that L2GRE profiles without destinationEdgeClusterId are included
    const l2greWithoutCluster = l2greProfiles.find(
      profile => !profile.destinationEdgeClusterId
    )
    expect(l2greWithoutCluster).toBeDefined()
  })

  it('should exclude tunnel profiles that are already used by SD-LANs', () => {
    const { result } = renderHook(() => useGetAvailableTunnelTemplate(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    // The first SD-LAN uses tunnelProfileId1, so it should be excluded
    const usedProfileIds = modifiedMockSdLanDataList.map(sdLan => sdLan.tunnelProfileId)
    const availableProfileIds = result.current.availableTunnelTemplates.map(profile => profile.id)

    const validUsedIds = usedProfileIds.filter(usedId => usedId !== undefined && usedId !== null)
    validUsedIds.forEach(usedId => {
      expect(availableProfileIds).not.toContain(usedId)
    })
  })
})