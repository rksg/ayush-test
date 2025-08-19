import { renderHook, waitFor } from '@testing-library/react'

import { Features, useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { useGetIpsecViewDataListQuery, useGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'
import { IpSecTunnelUsageTypeEnum, useIsEdgeFeatureReady }              from '@acx-ui/rc/utils'
import { Provider }                                                     from '@acx-ui/store'

import { mockSoftGreViewModelWith8Profiles } from './fixture'
import { useIpsecProfileLimitedSelection }   from './useIpsecProfileLimitedSelection'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSoftGreViewDataListQuery: jest.fn().mockReturnValue({
    softGreData: []
  }),
  useGetIpsecViewDataListQuery: jest.fn().mockReturnValue({
    ipsecData: []
  })
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const mockUseGetSoftGreViewDataListQuery = useGetSoftGreViewDataListQuery as jest.Mock
const mockUseGetIpsecViewDataListQuery = useGetIpsecViewDataListQuery as jest.Mock
const venueId = 'mockVenueId'

describe('useIpsecProfileLimitedSelection', () => {
  const mockIpsecDataWithVxlanGpe = {
    fields: null,
    totalCount: 3,
    page: 1,
    data: [
      {
        id: 'e19a07e22a9846fda91bda603b9ddd09',
        name: 'ipsec7',
        tunnelUsageType: IpSecTunnelUsageTypeEnum.VXLAN_GPE,
        activations: [],
        venueActivations: [
          {
            venueId: venueId,
            softGreProfileId: 'soft7',
            apModel: 'H350',
            portId: 1,
            apSerialNumbers: []
          }
        ],
        apActivations: []
      },
      {
        id: 'a2d333bdbf1f48ddb4a184d2f3432935',
        name: 'ipsec4',
        tunnelUsageType: IpSecTunnelUsageTypeEnum.SOFT_GRE,
        activations: [],
        venueActivations: [
          {
            venueId: venueId,
            softGreProfileId: 'soft4',
            apModel: 'H350',
            portId: 2,
            apSerialNumbers: []
          }
        ],
        apActivations: []
      },
      {
        id: 'b3e444cecf2f59eec5b295e3f4543046',
        name: 'ipsec5',
        // tunnelUsageType is undefined (old profile)
        activations: [],
        venueActivations: [
          {
            venueId: venueId,
            softGreProfileId: 'soft5',
            apModel: 'H350',
            portId: 3,
            apSerialNumbers: []
          }
        ],
        apActivations: []
      }
    ]
  }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE
      || ff === Features.ETHERNET_PORT_PROFILE_TOGGLE
      || ff === Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE
    )
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_IPSEC_VXLAN_TOGGLE )

    mockUseGetSoftGreViewDataListQuery.mockReturnValue({
      softGreData: mockSoftGreViewModelWith8Profiles.data
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should filter out VXLAN_GPE tunnel usage type profiles', async () => {
    mockUseGetIpsecViewDataListQuery.mockReturnValue({
      ipsecData: mockIpsecDataWithVxlanGpe.data
    })

    const { result } = renderHook(() => useIpsecProfileLimitedSelection(
      { venueId, isVenueOperation: true, duplicationChangeDispatch: jest.fn() }), {
      wrapper: Provider
    })

    await waitFor(() => {
      expect(result.current.ipsecOptionList.length).toBe(2)
    })

    const options = result.current.ipsecOptionList

    // VXLAN_GPE profile should be filtered out
    const vxlanGpeOption = options.find(opt => opt.label === 'ipsec7')
    expect(vxlanGpeOption).toBeUndefined()

    // SOFT_GRE profile should be included
    const softGreOption = options.find(opt => opt.label === 'ipsec4')
    expect(softGreOption).toBeDefined()
    expect(softGreOption?.value).toBe('a2d333bdbf1f48ddb4a184d2f3432935')

    // Profile with undefined tunnelUsageType should be included (old profile)
    const undefinedTunnelOption = options.find(opt => opt.label === 'ipsec5')
    expect(undefinedTunnelOption).toBeDefined()
    expect(undefinedTunnelOption?.value).toBe('b3e444cecf2f59eec5b295e3f4543046')

    // Should only have 2 options (VXLAN_GPE filtered out)
    expect(options).toHaveLength(2)
  })
})