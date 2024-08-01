import { NetworkTypeEnum, EdgeSdLanFixtures, EdgeMvSdLanViewData } from '@acx-ui/rc/utils'

import { SdLanScopedNetworkVenuesData } from '../../EdgeSdLan/useEdgeSdLanActions'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

export const mockSdLanScopeVenueMap = {} as SdLanScopedNetworkVenuesData['sdLansVenueMap']
mockedMvSdLanDataList?.forEach(sdlan => {
  sdlan.tunneledWlans?.forEach(wlan => {
    if (!mockSdLanScopeVenueMap[wlan.venueId]) mockSdLanScopeVenueMap[wlan.venueId] = []

    mockSdLanScopeVenueMap[wlan.venueId].push(sdlan as EdgeMvSdLanViewData)
  })
})

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN },
    { name: 'MockedNetwork 4', id: 'network_4', type: NetworkTypeEnum.CAPTIVEPORTAL }
  ]
}