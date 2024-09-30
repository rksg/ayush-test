import { cloneDeep } from 'lodash'

import { EdgeCompatibilityFixtures, getFeaturesIncompatibleDetailData, IncompatibilityFeatures } from '@acx-ui/rc/utils'

const { mockEdgeSdLanCompatibilities, mockEdgeSdLanApCompatibilites } = EdgeCompatibilityFixtures

describe('getFeaturesIncompatibleDetailData', () => {
  const serviceCompatibilityEdgeData = mockEdgeSdLanCompatibilities.compatibilities[0]

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

  it('should return correct result base on ap compatibility data', async () => {
    const serviceCompatibilityApData = cloneDeep(mockEdgeSdLanApCompatibilites.compatibilities[0])
    serviceCompatibilityApData.venueSdLanApCompatibilities[0].incompatibleFeatures?.push( {
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