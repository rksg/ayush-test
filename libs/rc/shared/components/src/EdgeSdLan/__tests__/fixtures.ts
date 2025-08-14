import { EdgeSdLanFixtures, Network, NetworkTypeEnum, EdgeMvSdLanViewData, EdgeMvSdLanFormNetwork, EdgeMvSdLanFormModel } from '@acx-ui/rc/utils'

import { SdLanScopedNetworkVenuesData } from '../useEdgeSdLanActions'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

export const mockNetworkSaveData = {
  fields: ['venueId', 'networkId'],
  totalCount: 3,
  page: 1,
  data: [
    { networkId: 'network_1', venueId: 'venue_00002' },
    { networkId: 'network_2', venueId: 'venue_00002' },
    { networkId: 'network_3', venueId: 'venue_00005' },
    { networkId: 'network_4', venueId: 'venue_00005' }
  ]
}

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN },
    { name: 'MockedNetwork 4', id: 'network_4', type: NetworkTypeEnum.CAPTIVEPORTAL }
  ]
}

export const mockNetworkViewmodelList = [
  { name: 'MockedNetwork 1', id: 'network_1', nwSubType: NetworkTypeEnum.DPSK },
  { name: 'MockedNetwork 2', id: 'network_2', nwSubType: NetworkTypeEnum.PSK },
  { name: 'MockedNetwork 3', id: 'network_3', nwSubType: NetworkTypeEnum.OPEN },
  { name: 'MockedNetwork 4', id: 'network_4', nwSubType: NetworkTypeEnum.CAPTIVEPORTAL },
  {
    name: 'MockedNetwork 5',
    id: 'network_5',
    nwSubType: NetworkTypeEnum.OPEN,
    isOweMaster: true,
    owePairNetworkId: 'network_6'
  }, {
    name: 'MockedNetwork 6',
    id: 'network_6',
    nwSubType: NetworkTypeEnum.OPEN,
    isOweMaster: false,
    owePairNetworkId: 'network_5'
  }, {
    name: 'MockedNetwork 7',
    id: 'network_7',
    nwSubType: NetworkTypeEnum.DPSK,
    dsaeOnboardNetwork: {
      id: 'network_7',
      name: 'MockedNetwork 7-dpsk3-wpa2',
      description: 'It is a DPSK3 onboard network and not configurable.',
      nwSubType: 'dpsk'
    }
  }
] as Network[]

export const mockSdLanScopeVenueMap = {} as SdLanScopedNetworkVenuesData['sdLansVenueMap']
mockedMvSdLanDataList?.forEach(sdlan => {
  sdlan.tunneledWlans?.forEach(wlan => {
    if (!mockSdLanScopeVenueMap[wlan.venueId]) mockSdLanScopeVenueMap[wlan.venueId] = []

    mockSdLanScopeVenueMap[wlan.venueId].push(sdlan as EdgeMvSdLanViewData)
  })
})

export const mockMvSdLanFormData = {
  id: 'mocked-sd-lan-1',
  name: 'Mocked_SDLAN_1',
  edgeClusterId: 'mocked_cluster0_id',
  edgeClusterName: 'SE_Cluster 0',
  tunnelProfileId: 'mocked_tunnel1_id',
  tunnelProfileName: 'Mocked_tunnel-1',
  isGuestTunnelEnabled: false,
  guestEdgeClusterId: 'mocked_cluster3_id',
  guestEdgeClusterName: 'SE_Cluster 3',
  guestTunnelProfileId: 'mocked_tunnel3_id',
  guestTunnelProfileName: 'Mocked_tunnel-3',
  activatedNetworks: {
    venue1: [{
      id: 'network1',
      name: 'Network1'
    }, {
      id: 'network3',
      name: 'Network3'
    }],
    venue2: [{
      id: 'network1',
      name: 'Network1'
    }]
  } as EdgeMvSdLanFormNetwork,
  activatedGuestNetworks: {
    venue1: [{
      id: 'network1',
      name: 'Network1'
    }]
  } as EdgeMvSdLanFormNetwork
} as unknown as EdgeMvSdLanFormModel