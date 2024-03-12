import { EdgeAlarmSummary }                       from '../../../../types/edge'
import { EdgeSdLanViewData, EdgeSdLanViewDataP2 } from '../../../../types/services/edgeSdLanService'

export const mockedSdLanDataList = [{
  id: 'mocked-sd-lan-1',
  name: 'Mocked_SDLAN_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  venueName: 'Mocked-Venue-1',
  edgeId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  edgeName: 'vSE-b490',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'Mocked_tunnel-1',
  networkIds: ['8e22159cfe264ac18d591ea492fbc05a'],
  networkInfos: [{
    networkId: '8e22159cfe264ac18d591ea492fbc05a',
    networkName: 'Mocked_network'
  }],
  corePortMac: 'c2:58:00:ae:63:f2',
  edgeAlarmSummary: {
    edgeId: 'mocked-edge-1',
    severitySummary: {
      critical: 1
    },
    totalCount: 1
  },
  serviceVersion: '1.0.0.100',
  vxlanTunnelNum: 12,
  vlanNum: 37
}, {
  id: 'mocked-sd-lan-2',
  name: 'Mocked_SDLAN_2',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a8def420bd6c4f3e8b28114d6c78f237',
  venueName: 'Mocked-Venue-2',
  edgeId: '96BD19BB3B5CE111EE80500E35957BEDC3',
  edgeName: 'vSE-b466',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'Mocked_tunnel-1',
  networkIds: [],
  networkInfos: [],
  corePortMac: 'a2:51:0f:bc:89:c5',
  edgeAlarmSummary: {} as EdgeAlarmSummary,
  serviceVersion: '1.0.0.100',
  vxlanTunnelNum: 0,
  vlanNum: 0
}] as EdgeSdLanViewData[]

export const mockedCorePortLostEdgeSdLanDataList = [{
  id: 'mocked-cf-2',
  edgeId: '96BD19BB3B5CE111EE80500E35957BEDC3',
  corePortMac: ''
}] as EdgeSdLanViewData[]

export const mockedSdLanService = {
  id: 'mocked_sdLan_id',
  name: 'mockedSdLanData',
  venueId: 'f28540166b95406cae64b46bd12b742f',
  venueName: 'airport',
  edgeId: '9618C4AC2B1FC511EE8B2B000C2943FE7F',
  corePortMac: 'p2',
  networkIds: ['32e06116667b4749855ffbb991d8ac4b'],
  tunnelProfileId: 'f93802759efc49628c572df8af0718b8'
}

export const mockedSdLanServiceP2 = {
  id: mockedSdLanService.id,
  name: mockedSdLanService.name,
  venueId: mockedSdLanService.venueId,
  venueName: mockedSdLanService.venueName,
  edgeClusterId: mockedSdLanService.edgeId,
  networkIds: mockedSdLanService.networkIds,
  tunnelProfileId: mockedSdLanService.tunnelProfileId,
  isGuestTunnelEnabled: false,
  guestEdgeClusterId: '',
  guestTunnelProfileId: '',
  guestNetworkIds: []
}

export const mockedSdLanServiceP2Dmz = {
  id: 'mocked-sd-lan-1',
  name: 'Mocked_SDLAN_1',
  edgeClusterId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843'
}

export const mockedSdLanDataListP2 = [{
  id: 'mocked-sd-lan-1',
  name: 'Mocked_SDLAN_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  venueName: 'Mocked-Venue-1',
  edgeClusterId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  edgeClusterName: 'SE_Cluster 0',
  guestEdgeClusterId: 'c0000000003',
  guestEdgeClusterName: 'SE_Cluster 3',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'Mocked_tunnel-1',
  guestTunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b845',
  guestTunnelProfileName: 'Mocked_tunnel-3',
  isGuestTunnelEnabled: true,
  networkIds: ['network_1', 'network_4'],
  networkInfos: [{
    networkId: 'network_1',
    networkName: 'Mocked_network'
  }, {
    networkId: 'network_4',
    networkName: 'Mocked_network_4'
  }],
  guestNetworkIds: ['network_4'],
  guestNetworkInfos: [{
    networkId: 'network_4',
    networkName: 'Mocked_network_4'
  }],
  edgeAlarmSummary: {
    edgeId: 'mocked-edge-1',
    severitySummary: {
      critical: 1
    },
    totalCount: 1
  },
  serviceVersion: '1.0.0.100',
  vxlanTunnelNum: 12,
  vlanNum: 37
}, {
  id: 'mocked-sd-lan-2',
  name: 'Mocked_SDLAN_2',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861560',
  venueName: 'Mocked-Venue-2',
  edgeClusterId: '96B968BD2C76ED11EEA8E4B2E81F537A93',
  edgeClusterName: 'SE_Cluster 1',
  guestEdgeClusterId: '',
  guestEdgeClusterName: '',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b842',
  tunnelProfileName: 'Mocked_tunnel-2',
  guestTunnelProfileId: '',
  guestTunnelProfileName: '',
  isGuestTunnelEnabled: false,
  networkIds: ['network_2'],
  networkInfos: [{
    networkId: 'network_2',
    networkName: 'Mocked_network_2'
  }],
  guestNetworkIds: [],
  guestNetworkInfos: [],
  edgeAlarmSummary: {} as EdgeAlarmSummary,
  serviceVersion: '1.0.0.100',
  vxlanTunnelNum: 20,
  vlanNum: 15
}, {
  id: 'mocked-sd-lan-3',
  name: 'Mocked_SDLAN_3',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a8def420bd6c4f3e8b28114d6c78f231',
  venueName: 'Mocked-Venue-3',
  edgeClusterId: '96BD19BB3B5CE111EE80500E35957BEDC3',
  edgeClusterName: 'SE_Cluster 2',
  guestEdgeClusterId: '',
  guestEdgeClusterName: '',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'Mocked_tunnel-1',
  guestTunnelProfileId: '',
  guestTunnelProfileName: '',
  isGuestTunnelEnabled: false,
  networkIds: [],
  networkInfos: [],
  guestNetworkIds: [],
  guestNetworkInfos: [],
  edgeAlarmSummary: {} as EdgeAlarmSummary,
  serviceVersion: '1.0.0.100',
  vxlanTunnelNum: 0,
  vlanNum: 0
}] as EdgeSdLanViewDataP2[]