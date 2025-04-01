import { renderHook } from '@testing-library/react'
import { cloneDeep }  from 'lodash'
import { rest }       from 'msw'

import { EdgePinFixtures, EdgePinUrls, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeTunnelProfileFixtures, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { TunnelProfileViewData, TunnelTypeEnum }                                                                        from '@acx-ui/rc/utils'
import { Provider }                                                                                                     from '@acx-ui/store'
import { mockServer }                                                                                                   from '@acx-ui/test-utils'

import { useGetAvailableTunnelProfile } from './useGetAvailableTunnelProfile'
import { transToOptions }               from './useGetAvailableTunnelProfile'

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockPinStatsList } = EdgePinFixtures
const modifiedMockSdLanDataList = cloneDeep(mockedMvSdLanDataList)
modifiedMockSdLanDataList[0].tunnelProfileId = mockedTunnelProfileViewData.data[0].id
const modifiedMockPinStatsList = cloneDeep(mockPinStatsList)
modifiedMockPinStatsList.data[0].vxlanTunnelProfileId = mockedTunnelProfileViewData.data[1].id

describe('useGetAvailableTunnelProfile', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(EdgeSdLanUrls.getEdgeSdLanViewDataList.url, (_, res, ctx) => {
        return res(ctx.json({ data: modifiedMockSdLanDataList }))
      }),
      rest.post(EdgePinUrls.getEdgePinStatsList.url, (_, res, ctx) => {
        return res(ctx.json(modifiedMockPinStatsList))
      }),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url, (_, res, ctx) => {
        return res(ctx.json(mockedTunnelProfileViewData))
      })
    )
  })

  it('should return the available tunnel profiles', () => {
    const { result } = renderHook(() => useGetAvailableTunnelProfile(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    expect(result.current.availableTunnelProfiles.length).toBe(2)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[0].id).toBe(mockedTunnelProfileViewData.data[2].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[1].id).toBe(mockedTunnelProfileViewData.data[3].id)
  })

  it('should return the correct available tunnel profiles when sdLanServiceId is provided', () => {
    const { result } = renderHook(() =>
      useGetAvailableTunnelProfile({ sdLanServiceId: modifiedMockSdLanDataList[0].id }), {
      wrapper: ({ children }) => <Provider>{children}</Provider>
    })

    expect(result.current.availableTunnelProfiles.length).toBe(3)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[0].id).toBe(mockedTunnelProfileViewData.data[0].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[1].id).toBe(mockedTunnelProfileViewData.data[2].id)
    // eslint-disable-next-line max-len
    expect(result.current.availableTunnelProfiles[2].id).toBe(mockedTunnelProfileViewData.data[3].id)
  })
})

describe('transToOptions', () => {
  const mockTunnelProfiles: TunnelProfileViewData[] = [
    {
      id: 'l2gre-1',
      name: 'L2GRE Profile 1',
      tunnelType: TunnelTypeEnum.L2GRE,
      destinationEdgeClusterId: 'cluster-1',
      destinationEdgeClusterName: 'Cluster 1'
    },
    {
      id: 'l2gre-2',
      name: 'L2GRE Profile 2',
      tunnelType: TunnelTypeEnum.L2GRE,
      destinationEdgeClusterId: 'cluster-2',
      destinationEdgeClusterName: 'Cluster 2'
    },
    {
      id: 'vxlan-1',
      name: 'VXLAN Profile 1',
      tunnelType: TunnelTypeEnum.VXLAN_GPE,
      destinationEdgeClusterId: 'cluster-3',
      destinationEdgeClusterName: 'Cluster 3'
    }
  ] as unknown as TunnelProfileViewData[]

  it('should return all options enabled when no profiles are activated', () => {
    const result = transToOptions(mockTunnelProfiles)

    expect(result).toHaveLength(3)
    result.forEach(option => {
      expect(option.disabled).toBe(false)
      expect(option.title).toBeUndefined()
    })
  })

  it('should disable options with different tunnel type', () => {
    const result = transToOptions(mockTunnelProfiles, ['l2gre-1'])

    expect(result).toHaveLength(3)
    expect(result[0].disabled).toBe(false) // L2GRE Profile 1
    expect(result[1].disabled).toBe(false) // L2GRE Profile 2
    expect(result[2].disabled).toBe(true)  // VXLAN Profile 1
    // eslint-disable-next-line max-len
    expect(result[2].title).toBe('All forwarding destinations must use tunnel profiles of the same type.')
  })

  it('should disable L2GRE options when max L2GRE count is reached', () => {
    // Create 8 unique L2GRE profile IDs to properly test the limit
    const activatedIds = Array.from({ length: 8 }, (_, i) => `l2gre-${i + 2}`)
    const result = transToOptions(mockTunnelProfiles, activatedIds)

    expect(result).toHaveLength(3)
    expect(result[0].disabled).toBe(true)  // L2GRE Profile 1
    expect(result[1].disabled).toBe(false)  // L2GRE Profile 2
    expect(result[2].disabled).toBe(true)  // VXLAN option
    expect(result[0].title).toBe('A SD-LAN service can only support 8 L2GRE tunnel profiles.')
  })

  it('should disable VXLAN-GPE options when max VXLAN-GPE count is reached', () => {
    const result = transToOptions(mockTunnelProfiles, ['vxlan-1'])

    expect(result).toHaveLength(3)
    expect(result[0].disabled).toBe(true)  // L2GRE option
    expect(result[1].disabled).toBe(true)  // L2GRE option
    expect(result[2].disabled).toBe(false) // Already activated VXLAN
    // eslint-disable-next-line max-len
    expect(result[0].title).toBe('All forwarding destinations must use tunnel profiles of the same type.')
  })

  it('should handle empty or invalid activated profile IDs', () => {
    const result = transToOptions(mockTunnelProfiles, ['', 'invalid-id'])

    expect(result).toHaveLength(3)
    result.forEach(option => {
      expect(option.disabled).toBe(false)
      expect(option.title).toBeUndefined()
    })
  })

  it('should include tunnel type in option labels', () => {
    const result = transToOptions(mockTunnelProfiles)

    expect(result[0].label).toBe('L2GRE Profile 1 (L2GRE)')
    expect(result[1].label).toBe('L2GRE Profile 2 (L2GRE)')
    expect(result[2].label).toBe('VXLAN Profile 1 (VxLAN)')
  })
})
