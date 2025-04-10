/* eslint-disable max-len */
import { cloneDeep } from 'lodash'

import { EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import {
  render,
  renderHook,
  screen,
  within
} from '@acx-ui/test-utils'

import { mockMvSdLanFormData } from './__tests__/fixtures'
import {
  edgeSdLanFormRequestPreProcess,
  isDmzTunnelUtilized,
  isSdLanGuestUtilizedOnDiffVenue,
  isSdLanLastNetworkInVenue,
  transformSdLanScopedVenueMap,
  useGetNetworkTunnelInfo
} from './edgeSdLanUtils'

const { mockedSdLanDataListP2, mockedMvSdLanDataList } = EdgeSdLanFixtures

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

describe('useGetNetworkTunnelInfo', () => {
  const params = { tenantId: 'mock_tenant_id' }

  it('should correctly render DC case', async () => {
    const mockedDcSdlan = mockedSdLanDataListP2[1]
    const targetNetwork = mockedDcSdlan.networkInfos![0]

    const { result } = renderHook(() => useGetNetworkTunnelInfo())
    const resultComp = result.current(targetNetwork.networkId, mockedDcSdlan)
    render(<div>{resultComp}</div>, {
      route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
    })

    const tunnelTxt = screen.getByText(/Tunneled/)
    const btn = within(tunnelTxt).getByRole('link', { name: mockedDcSdlan.edgeClusterName })
    expect(btn).toBeVisible()
    // eslint-disable-next-line max-len
    expect(btn).toHaveAttribute('href', `/${params.tenantId}/t/devices/edge/cluster/${mockedDcSdlan.edgeClusterId}/edit/cluster-details`)
  })

  it('should correctly render DMZ case', async () => {
    const mockedDmzSdlan = mockedSdLanDataListP2[0]
    const targetNetwork = mockedDmzSdlan.networkInfos![1]

    const { result } = renderHook(() => useGetNetworkTunnelInfo())
    const resultComp = result.current(targetNetwork.networkId, mockedDmzSdlan)
    render(<div>{resultComp}</div>, {
      route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
    })

    const tunnelTxt = screen.getByText(/Tunneled/)
    const btn = within(tunnelTxt).getByRole('link', { name: mockedDmzSdlan.guestEdgeClusterName })
    expect(btn).toBeVisible()
    // eslint-disable-next-line max-len
    expect(btn).toHaveAttribute('href', `/${params.tenantId}/t/devices/edge/cluster/${mockedDmzSdlan.guestEdgeClusterId}/edit/cluster-details`)
  })

  it('should correctly render local breakout', async () => {
    const { result } = renderHook(() => useGetNetworkTunnelInfo())

    const resultComp = result.current('test_networkId', undefined)
    render(<div>{resultComp}</div>, {
      route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
    })

    expect(screen.getByText('Local Breakout')).toBeVisible()
  })
})


describe('edgeSdLanFormRequestPreProcess', () => {
  it('should correctly render DC case', async () => {
    const payload = edgeSdLanFormRequestPreProcess(mockMvSdLanFormData)

    expect(payload.isGuestTunnelEnabled).toBe(false)
    expect(payload.guestEdgeClusterId).toBeUndefined()
    expect(payload.guestTunnelProfileId).toBeUndefined()
    expect(payload.guestNetworks).toBeUndefined()
    expect(payload.networks).toStrictEqual({
      venue1: ['network1','network3'],
      venue2: ['network1']
    })
  })

  it('should correctly render DMZ case', async () => {
    const mockDmz = cloneDeep(mockMvSdLanFormData)
    mockDmz.isGuestTunnelEnabled = true
    const payload = edgeSdLanFormRequestPreProcess(mockDmz)

    expect(payload.isGuestTunnelEnabled).toBe(true)
    expect(payload.guestEdgeClusterId).not.toBeUndefined()
    expect(payload.guestTunnelProfileId).not.toBeUndefined()
    expect(payload.networks).toStrictEqual({
      venue1: ['network1','network3'],
      venue2: ['network1']
    })
    expect(payload.guestNetworks).toStrictEqual({
      venue1: ['network1']
    })
  })
})

describe('isDmzTunnelUtilized', () => {
  const mockDcData = mockedMvSdLanDataList[1]
  const mockDmzData = mockedMvSdLanDataList[0]

  it('should return false when it is DC scenario', async () => {
    const result = isDmzTunnelUtilized(mockDcData, 'network_2', 'a307d7077410456f8f1a4fc41d861560')
    expect(result).toBe(false)
  })

  it('should return false when it is DMZ scenario and no guest forwared', async () => {
    const mockData = cloneDeep(mockDmzData)
    mockData.tunneledGuestWlans = []
    const result = isDmzTunnelUtilized(mockData, 'network_4', 'a307d7077410456f8f1a4fc41d861567')
    expect(result).toBe(false)
  })

  it('should return false when one of paramters is undefined', async () => {
    const result = isDmzTunnelUtilized(mockDmzData)
    expect(result).toBe(false)
    const result2 = isDmzTunnelUtilized(mockDmzData, 'network_4')
    expect(result2).toBe(false)
    const result3 = isDmzTunnelUtilized(mockDmzData, undefined, 'a307d7077410456f8f1a4fc41d861567')
    expect(result3).toBe(false)
  })

  it('should return false when no parameter given', async () => {
    const result = isDmzTunnelUtilized()
    expect(result).toBe(false)
  })

  it('should return false when target network venue is not guest forwared', async () => {
    const result = isDmzTunnelUtilized(mockDmzData, 'mock_network_1', 'mock_venue_1')
    expect(result).toBe(false)
  })

  it('should return true when it is DMZ scenario', async () => {
    const result = isDmzTunnelUtilized(mockDmzData, 'network_4', 'a307d7077410456f8f1a4fc41d861567')
    expect(result).toBe(true)
  })
})

describe('isSdLanGuestUtilizedOnDiffVenue', () => {
  const mockDcData = mockedMvSdLanDataList[1]
  const mockDmzData = mockedMvSdLanDataList[0]

  it('should return false when DC case', async () => {
    const result = isSdLanGuestUtilizedOnDiffVenue(mockDcData, 'network_2', 'a307d7077410456f8f1a4fc41d861560')
    expect(result).toBe(false)
  })

  it('should return false when DMZ case but no guest forwarded on other venues', async () => {
    const result = isSdLanGuestUtilizedOnDiffVenue(mockDmzData, 'network_4', 'a307d7077410456f8f1a4fc41d861567')
    expect(result).toBe(false)
  })

  it('should return true when DMZ case and has guest forwarded on other venues', async () => {
    const mockData = cloneDeep(mockDmzData)
    const mockNetwork = {
      venueId: 'other_venue_1_id',
      venueName: 'Mocked-Other-Venue-1',
      networkId: 'network_4',
      networkName: 'Mocked_network_4',
      wlanId: '30'
    }
    mockData.tunneledWlans?.push(mockNetwork)
    mockData.tunneledGuestWlans?.push(mockNetwork)

    const result = isSdLanGuestUtilizedOnDiffVenue(mockData, 'network_4', 'a307d7077410456f8f1a4fc41d861567')
    expect(result).toBe(true)
  })
})

describe('transformSdLanScopedVenueMap', () => {
  it('should correctly transform', async () => {
    const result = transformSdLanScopedVenueMap(mockedMvSdLanDataList)
    expect(result).toStrictEqual({
      a307d7077410456f8f1a4fc41d861567: mockedMvSdLanDataList[0],
      a307d7077410456f8f1a4fc41d861560: mockedMvSdLanDataList[1],
      a307d7077410456f8f1a4fc41d861565: mockedMvSdLanDataList[1]
    })
  })

  it('should return empty object when no data given', async () => {
    const result = transformSdLanScopedVenueMap()
    expect(result).toStrictEqual({})
  })

  it('should return empty object when tunneledWlans is undefined', async () => {
    const mockData = cloneDeep(mockedMvSdLanDataList)
    mockData[1].tunneledWlans = undefined

    const result = transformSdLanScopedVenueMap(mockData)
    expect(result).toStrictEqual({
      a307d7077410456f8f1a4fc41d861567: mockedMvSdLanDataList[0]
    })
  })
})

describe('isSdLanLastNetworkInVenue', () => {
  it('should return true when it is the last one', async () => {
    const sdlan = mockedMvSdLanDataList[1]
    const result = isSdLanLastNetworkInVenue(sdlan.tunneledWlans, sdlan.tunneledWlans![0].venueId)
    expect(result).toBe(true)
  })

  it('should return false when still have other network on target venue', async () => {
    const sdlan = mockedMvSdLanDataList[0]
    const result = isSdLanLastNetworkInVenue(sdlan.tunneledWlans, sdlan.tunneledWlans![0].venueId)
    expect(result).toBe(false)
  })

  it('should return false when no venueId', async () => {
    const result = isSdLanLastNetworkInVenue([])
    expect(result).toBe(false)
  })

  it('should return false object when no params given', async () => {
    const result = isSdLanLastNetworkInVenue()
    expect(result).toBe(false)
  })
})