import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { Features, useIsSplitOn }                                                                                                       from '@acx-ui/feature-toggle'
import { CompatibilityDeviceEnum, EdgeCompatibilityFixtures, EdgeUrlsInfo, getFeaturesIncompatibleDetailData, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                     from '@acx-ui/store'
import { mockServer, renderHook, waitFor }                                                                                              from '@acx-ui/test-utils'

import {
  useEdgePinDetailsCompatibilitiesData,
  useEdgePinsCompatibilityData,
  useEdgeSdLanDetailsCompatibilitiesData,
  useEdgeSdLansCompatibilityData
} from './compatibility'

import { useIsEdgeFeatureReady } from '.'

const {
  mockEdgeSdLanCompatibilities,
  mockEdgeSdLanCompatibilitiesV1_1,
  mockEdgeSdLanApCompatibilites,
  mockEdgePinCompatibilities,
  mockEdgePinApCompatibilites
} = EdgeCompatibilityFixtures

jest.mock('.', () => ({
  ...jest.requireActual('.'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('useEdgeSvcsPcysCompatibilitiesData', () => {
  it('useEdgeSdLanDetailsCompatibilitiesData should return correct data', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )

    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgeSdLanDetailsCompatibilitiesData( { serviceId: 'mock_id' } ),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData[CompatibilityDeviceEnum.EDGE]
    const edgeSdLan = edgeData[IncompatibilityFeatures.SD_LAN]
    expect(edgeSdLan.total).toBe(14)
    expect(edgeSdLan.incompatible).toBe(5)

    const edgeTunnelProfile = edgeData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(edgeTunnelProfile.total).toBe(14)
    expect(edgeTunnelProfile.incompatible).toBe(7)

    const apData = resultData[CompatibilityDeviceEnum.AP]
    const apSdLan = apData[IncompatibilityFeatures.SD_LAN]
    expect(apSdLan.total).toBe(16)
    expect(apSdLan.incompatible).toBe(4)

    const apTunnelProfile = apData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(apTunnelProfile).toBeUndefined()
  })

  // eslint-disable-next-line max-len
  it('useEdgeSdLanDetailsCompatibilitiesData should return correct data when EdgeCompatibilityEnhancement FF is ON', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(i => i === Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilitiesV1_1.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilitiesV1_1))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )

    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgeSdLanDetailsCompatibilitiesData( { serviceId: 'mock_id' } ),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData[CompatibilityDeviceEnum.EDGE]
    const edgeSdLan = edgeData[IncompatibilityFeatures.SD_LAN]
    expect(edgeSdLan.total).toBe(10)
    expect(edgeSdLan.incompatible).toBe(1)

    const edgeTunnelProfile = edgeData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(edgeTunnelProfile.total).toBe(10)
    expect(edgeTunnelProfile.incompatible).toBe(2)

    const edgeNatTraversal = edgeData[IncompatibilityFeatures.NAT_TRAVERSAL]
    expect(edgeNatTraversal.total).toBe(10)
    expect(edgeNatTraversal.incompatible).toBe(5)

    const apData = resultData[CompatibilityDeviceEnum.AP]
    const apSdLan = apData[IncompatibilityFeatures.SD_LAN]
    expect(apSdLan.total).toBe(16)
    expect(apSdLan.incompatible).toBe(4)

    const apTunnelProfile = apData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(apTunnelProfile).toBeUndefined()
  })

  it('useEdgeSdLansCompatibilityData should return correct data', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )

    const mockIds = ['mock_sdlan_id']
    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgeSdLansCompatibilityData(mockIds),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData?.[CompatibilityDeviceEnum.EDGE]
    expect(edgeData).toStrictEqual(mockEdgeSdLanCompatibilities.compatibilities)

    const apData = resultData?.[CompatibilityDeviceEnum.AP]
    expect(apData).toStrictEqual(mockEdgeSdLanApCompatibilites.compatibilities)
  })

  // eslint-disable-next-line max-len
  it('useEdgeSdLansCompatibilityData should return correct data when EdgeCompatibilityEnhancement FF is ON', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(i => i === Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilitiesV1_1.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilitiesV1_1))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )

    const mockIds = ['mock_sdlan_id']
    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgeSdLansCompatibilityData(mockIds),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData?.[CompatibilityDeviceEnum.EDGE]
    expect(edgeData).toStrictEqual(mockEdgeSdLanCompatibilitiesV1_1.compatibilities)

    const apData = resultData?.[CompatibilityDeviceEnum.AP]
    expect(apData).toStrictEqual(mockEdgeSdLanApCompatibilites.compatibilities)
  })

  // eslint-disable-next-line max-len
  it('useEdgePinsCompatibilityData should not have AP Compatibilities query when FF off', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getPinEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinCompatibilities)))
    )

    const mockIds = ['mock_pin_id']
    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgePinsCompatibilityData(mockIds),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData?.[CompatibilityDeviceEnum.EDGE]
    expect(edgeData).toStrictEqual(mockEdgePinCompatibilities.compatibilities)

    const apData = resultData?.[CompatibilityDeviceEnum.AP]
    expect(apData).toBeUndefined()
  })

  it('useEdgePinsCompatibilityData should return correct data', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(i => i === Features.WIFI_COMPATIBILITY_BY_MODEL)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getPinEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getPinApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinApCompatibilites)))
    )

    const mockIds = ['mock_pin_id']
    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgePinsCompatibilityData(mockIds),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData?.[CompatibilityDeviceEnum.EDGE]
    expect(edgeData).toStrictEqual(mockEdgePinCompatibilities.compatibilities)

    const apData = resultData?.[CompatibilityDeviceEnum.AP]
    expect(apData).toStrictEqual(mockEdgePinApCompatibilites.compatibilities)

    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  it('useEdgePinDetailsCompatibilitiesData should return correct data', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(i => i === Features.WIFI_COMPATIBILITY_BY_MODEL)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getPinEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getPinApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinApCompatibilites)))
    )

    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgePinDetailsCompatibilitiesData( { serviceId: 'mock_id' } ),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData[CompatibilityDeviceEnum.EDGE]
    const edgePin = edgeData[IncompatibilityFeatures.PIN]
    expect(edgePin.total).toBe(14)
    expect(edgePin.incompatible).toBe(5)

    const edgeTunnelProfile = edgeData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(edgeTunnelProfile.total).toBe(14)
    expect(edgeTunnelProfile.incompatible).toBe(7)

    const apData = resultData[CompatibilityDeviceEnum.AP]
    const apPin = apData[IncompatibilityFeatures.PIN]
    expect(apPin.total).toBe(1)
    expect(apPin.incompatible).toBe(1)

    const apTunnelProfile = apData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(apTunnelProfile.total).toBe(1)
    expect(apTunnelProfile.incompatible).toBe(1)
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  // eslint-disable-next-line max-len
  it('useEdgePinDetailsCompatibilitiesData should correctlt handle data when compatibility is empty', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(i => i === Features.WIFI_COMPATIBILITY_BY_MODEL)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getPinEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getPinApCompatibilities.url,
        (_, res, ctx) => res(ctx.json({})))
    )

    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgePinDetailsCompatibilitiesData( { serviceId: 'mock_id' } ),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    const resultData = result.current.compatibilities
    const edgeData = resultData[CompatibilityDeviceEnum.EDGE]
    const edgePin = edgeData[IncompatibilityFeatures.PIN]
    expect(edgePin.total).toBe(14)
    expect(edgePin.incompatible).toBe(5)

    const edgeTunnelProfile = edgeData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(edgeTunnelProfile.total).toBe(14)
    expect(edgeTunnelProfile.incompatible).toBe(7)

    const apData = resultData[CompatibilityDeviceEnum.AP]
    const apPin = apData[IncompatibilityFeatures.PIN]
    expect(apPin).toBeUndefined()
    const apTunnelProfile = apData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(apTunnelProfile).toBeUndefined()
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  // eslint-disable-next-line max-len
  it('useEdgePinDetailsCompatibilitiesData should not trigger AP Compatibilities query when FF off', async () => {
    const apCompatibilityReq = jest.fn()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getPinEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgePinCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getPinApCompatibilities.url,
        (_, res, ctx) => {
          apCompatibilityReq()
          return res(ctx.json(mockEdgePinCompatibilities))
        })
    )

    // eslint-disable-next-line max-len
    const { result } = renderHook(() => useEdgePinDetailsCompatibilitiesData( { serviceId: 'mock_id' } ),
      { wrapper: Provider })

    await waitFor(() => {expect(result.current.isLoading).toBe(false)})

    expect(apCompatibilityReq).not.toBeCalled()
    const resultData = result.current.compatibilities
    const edgeData = resultData[CompatibilityDeviceEnum.EDGE]
    const edgePin = edgeData[IncompatibilityFeatures.PIN]
    expect(edgePin.total).toBe(14)
    expect(edgePin.incompatible).toBe(5)

    const edgeTunnelProfile = edgeData[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(edgeTunnelProfile.total).toBe(14)
    expect(edgeTunnelProfile.incompatible).toBe(7)

    const apData = resultData[CompatibilityDeviceEnum.AP]
    expect(apData).toBeUndefined()
  })
})

describe('getFeaturesIncompatibleDetailData', () => {
  const serviceCompatibilityEdgeData = mockEdgeSdLanCompatibilities!.compatibilities![0]
  const serviceCompatibilityEdgeDataV1_1 = mockEdgeSdLanCompatibilitiesV1_1!.compatibilities![0]

  it('should return empty object when given undefined', async () => {
    const result = getFeaturesIncompatibleDetailData(undefined)
    expect(result).toStrictEqual({})
  })

  it('should return correct result base on edge compatibility data', async () => {
    const result = getFeaturesIncompatibleDetailData(serviceCompatibilityEdgeData)

    const sdLan = result[IncompatibilityFeatures.SD_LAN]
    expect(sdLan.total).toBe(14)
    expect(sdLan.incompatible).toBe(5)

    const tunnelProfile = result[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(tunnelProfile.total).toBe(14)
    expect(tunnelProfile.incompatible).toBe(7)

    const otherFeature = result[IncompatibilityFeatures.AP_70]
    expect(otherFeature).toBe(undefined)
  })

  // eslint-disable-next-line max-len
  it('should return correct result base on edge compatibility data when given v1_1 response', async () => {
    const result = getFeaturesIncompatibleDetailData(serviceCompatibilityEdgeDataV1_1)

    const sdLan = result[IncompatibilityFeatures.SD_LAN]
    expect(sdLan.total).toBe(10)
    expect(sdLan.incompatible).toBe(1)

    const tunnelProfile = result[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(tunnelProfile.total).toBe(10)
    expect(tunnelProfile.incompatible).toBe(2)

    const natTraversal = result[IncompatibilityFeatures.NAT_TRAVERSAL]
    expect(natTraversal.total).toBe(10)
    expect(natTraversal.incompatible).toBe(5)

    const otherFeature = result[IncompatibilityFeatures.AP_70]
    expect(otherFeature).toBe(undefined)
  })

  it('should return correct result base on ap compatibility data', async () => {
    const serviceCompatibilityApData = cloneDeep(mockEdgeSdLanApCompatibilites!.compatibilities![0])
    serviceCompatibilityApData!.venueSdLanApCompatibilities![0].incompatibleFeatures?.push( {
      featureName: 'Tunnel Profile',
      requiredFw: '7.0.0.0.0',
      supportedModelFamilies: [
        'Wi-Fi 6',
        'Wi-Fi 6E',
        'Wi-Fi 7'
      ],
      incompatibleDevices: [
        {
          firmware: '6.2.3.103.233',
          model: 'R560',
          count: 2
        }
      ]
    })

    const result = getFeaturesIncompatibleDetailData(serviceCompatibilityApData)

    const sdLan = result[IncompatibilityFeatures.SD_LAN]
    expect(sdLan.total).toBe(16)
    expect(sdLan.incompatible).toBe(4)

    const tunnelProfile = result[IncompatibilityFeatures.TUNNEL_PROFILE]
    expect(tunnelProfile.total).toBe(16)
    expect(tunnelProfile.incompatible).toBe(2)

    const otherFeature = result[IncompatibilityFeatures.AP_70]
    expect(otherFeature).toBe(undefined)
  })

})