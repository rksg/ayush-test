import { TunnelTypeEnum }                                       from '../../../../models'
import { ClusterHighAvailabilityModeEnum, NodeClusterRoleEnum } from '../../../../models/EdgeEnum'
import { EdgeAlarmSummary }                                     from '../../../../types/edge'
import { EdgeMvSdLanExtended, EdgeMvSdLanViewData }             from '../../../../types/services/edgeSdLanService'

// ============= multi venue SDLAN =============

export const mockedMvSdLanService = {
  id: 'mocked_sdLan_id',
  name: 'mockedSdLanData',
  venueId: 'f28540166b95406cae64b46bd12b742f',
  venueName: 'airport',
  edgeClusterId: '9618C4AC2B1FC511EE8B2B000C2943FE7F',
  networks: { f28540166b95406cae64b46bd12b742f: ['32e06116667b4749855ffbb991d8ac4b'] },
  tunnelProfileId: 'f93802759efc49628c572df8af0718b8',
  isGuestTunnelEnabled: false,
  guestEdgeClusterId: '',
  guestTunnelProfileId: '',
  guestNetworks: {}
} as EdgeMvSdLanExtended

export const mockedMvSdLanServiceDmzData = {
  id: 'mocked-sd-lan-1',
  name: 'Mocked_SDLAN_1',
  edgeClusterId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843'
}

export const mockedMvSdLanDataList = [{
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
  tunneledWlans: [{
    venueId: 'a307d7077410456f8f1a4fc41d861567',
    venueName: 'Mocked-Venue-1',
    networkId: 'network_1',
    networkName: 'Mocked_network',
    wlanId: '3',
    forwardingTunnelProfileId: '',
    forwardingTunnelType: ''
  }, {
    venueId: 'a307d7077410456f8f1a4fc41d861567',
    venueName: 'Mocked-Venue-1',
    networkId: 'network_4',
    networkName: 'Mocked_network_4',
    wlanId: '6',
    forwardingTunnelProfileId: '',
    forwardingTunnelType: ''
  }],
  tunneledGuestWlans: [{
    venueId: 'a307d7077410456f8f1a4fc41d861567',
    venueName: 'Mocked-Venue-1',
    networkId: 'network_4',
    networkName: 'Mocked_network_4',
    wlanId: '3'
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
  vlanNum: 37,
  guestVlanNum: 20,
  guestVxlanTunnelNum: 10,
  vlans: ['2-9', '20', '22', '62-63'],
  guestVlans: ['11-15', '30', '32', '51-53'],
  edgeClusterTunnelInfo: [
    {
      serialNumber: 'serialNumber-1',
      activeApCount: 3,
      allocatedApCount: 10
    },
    {
      serialNumber: 'serialNumber-2',
      activeApCount: 6,
      allocatedApCount: 10
    }
  ],
  guestEdgeClusterTunnelInfo: [
    {
      serialNumber: 'serialNumber-1',
      activeNodeCount: 2,
      allocatedNodeCount: 2
    },
    {
      serialNumber: 'serialNumber-2',
      activeNodeCount: 1,
      allocatedNodeCount: 2
    }
  ]
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
  tunneledWlans: [{
    venueId: 'a307d7077410456f8f1a4fc41d861560',
    venueName: 'Mocked-Venue-2',
    networkId: 'network_2',
    networkName: 'Mocked_network_2',
    wlanId: '1'
  }, {
    venueId: 'a307d7077410456f8f1a4fc41d861565',
    venueName: 'Mocked-Venue-3',
    networkId: 'network_1',
    networkName: 'Mocked_network_1',
    wlanId: '2'
  }],
  tunneledGuestWlans: [{
    venueId: 'a307d7077410456f8f1a4fc41d861560',
    venueName: 'Mocked-Venue-2',
    networkId: 'network_2',
    networkName: 'Mocked_network_2',
    wlanId: '1'
  }],
  edgeAlarmSummary: {} as EdgeAlarmSummary,
  serviceVersion: '1.0.0.100',
  vxlanTunnelNum: 20,
  vlanNum: 15,
  edgeClusterTunnelInfo: [],
  guestEdgeClusterTunnelInfo: []
}] as EdgeMvSdLanViewData[]

export const mockedMvSdLanServiceDmz = mockedMvSdLanDataList[0]

export const mockedL2oGreSdLanDataList = [{
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
  tunneledWlans: [{
    venueId: 'a307d7077410456f8f1a4fc41d861567',
    venueName: 'Mocked-Venue-1',
    networkId: 'network_1',
    networkName: 'Mocked_network',
    wlanId: '3',
    forwardingTunnelProfileId: 'mock_tunnel_l2gre_1',
    forwardingTunnelType: TunnelTypeEnum.L2GRE
  }, {
    venueId: 'a307d7077410456f8f1a4fc41d861567',
    venueName: 'Mocked-Venue-1',
    networkId: 'network_4',
    networkName: 'Mocked_network_4',
    wlanId: '6',
    forwardingTunnelProfileId: 'mock_forwardingTunnelProfileId_2',
    forwardingTunnelType: TunnelTypeEnum.VXLAN_GPE
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
  vlanNum: 37,
  guestVlanNum: 20,
  guestVxlanTunnelNum: 10,
  vlans: ['2-9', '20', '22', '62-63'],
  guestVlans: ['11-15', '30', '32', '51-53'],
  edgeClusterTunnelInfo: [
    {
      serialNumber: 'serialNumber-1',
      activeApCount: 3,
      allocatedApCount: 10
    },
    {
      serialNumber: 'serialNumber-2',
      activeApCount: 6,
      allocatedApCount: 10
    }
  ],
  guestEdgeClusterTunnelInfo: [
    {
      serialNumber: 'serialNumber-1',
      activeNodeCount: 2,
      allocatedNodeCount: 2
    },
    {
      serialNumber: 'serialNumber-2',
      activeNodeCount: 1,
      allocatedNodeCount: 2
    }
  ]
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
  tunneledWlans: [{
    venueId: 'a307d7077410456f8f1a4fc41d861560',
    venueName: 'Mocked-Venue-2',
    networkId: 'network_2',
    networkName: 'Mocked_network_2',
    wlanId: '1'
  }, {
    venueId: 'a307d7077410456f8f1a4fc41d861565',
    venueName: 'Mocked-Venue-3',
    networkId: 'network_1',
    networkName: 'Mocked_network_1',
    wlanId: '2'
  }],
  edgeAlarmSummary: {} as EdgeAlarmSummary,
  serviceVersion: '1.0.0.100',
  vxlanTunnelNum: 20,
  vlanNum: 15,
  edgeClusterTunnelInfo: [],
  guestEdgeClusterTunnelInfo: []
}] as EdgeMvSdLanViewData[]


export const mockSdLanDataForPinMutuallyExclusive = [{
  id: 'mocked-sd-lan-1',
  name: 'Mocked_SDLAN_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'mock_venue_3',
  venueName: 'Mocked-Venue-3',
  edgeClusterId: 'clusterId_1',
  edgeClusterName: 'SE_Cluster 1',
  guestEdgeClusterId: 'clusterId_2',
  guestEdgeClusterName: 'SE_Cluster 2',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'Mocked_tunnel-1',
  guestTunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b845',
  guestTunnelProfileName: 'Mocked_tunnel-3',
  isGuestTunnelEnabled: true,
  tunneledWlans: [{
    venueId: 'mock_venue_1',
    venueName: 'Mocked-Venue-1',
    networkId: 'network3',
    networkName: 'Mocked_network3',
    wlanId: '3'
  }, {
    venueId: 'mock_venue_4',
    venueName: 'Mocked-Venue-4',
    networkId: 'network5',
    networkName: 'Mocked_network_5',
    wlanId: '6'
  }],
  tunneledGuestWlans: [{
    venueId: 'a307d7077410456f8f1a4fc41d861567',
    venueName: 'Mocked-Venue-1',
    networkId: 'network6',
    networkName: 'Mocked_network_6',
    wlanId: '3'
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
  vlanNum: 37,
  guestVlanNum: 20,
  guestVxlanTunnelNum: 10,
  vlans: ['2-9', '20', '22', '62-63'],
  guestVlans: ['11-15', '30', '32', '51-53'],
  edgeClusterTunnelInfo: [
    {
      serialNumber: 'serialNumber-1',
      activeApCount: 3,
      allocatedApCount: 10
    },
    {
      serialNumber: 'serialNumber-2',
      activeApCount: 6,
      allocatedApCount: 10
    }
  ],
  guestEdgeClusterTunnelInfo: [
    {
      serialNumber: 'serialNumber-1',
      activeNodeCount: 2,
      allocatedNodeCount: 2
    },
    {
      serialNumber: 'serialNumber-2',
      activeNodeCount: 1,
      allocatedNodeCount: 2
    }
  ]
}]

export const mockApListForApTableTest = {
  fields: [
    'serialNumber',
    'name',
    'venueId',
    'venueName',
    'deviceGroupId',
    'deviceGroupName',
    'apStatusData.vxlanStatus.vxlanMtu',
    'apStatusData.vxlanStatus.tunStatus',
    'apStatusData.vxlanStatus.primaryRvtepInfo.deviceId',
    'apStatusData.vxlanStatus.activeRvtepInfo.deviceId'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      serialNumber: '121749001049',
      name: 'AP-R610',
      venueId: 'a307d7077410456f8f1a4fc41d861567',
      venueName: 'Venue1',
      deviceGroupId: 'ap-group-1',
      deviceGroupName: 'APGroup1',
      apStatusData: {
        vxlanStatus: {
          vxlanMtu: 1500,
          tunStatus: 'VxLAN_TUN_STATUS_CONNECTED',
          primaryRvtepInfo: {
            deviceId: 'mocked-edge-1'
          },
          activeRvtepInfo: {
            deviceId: 'mocked-edge-1'
          }
        }
      }
    },
    {
      serialNumber: '121749001050',
      name: 'AP-R510',
      venueId: 'a307d7077410456f8f1a4fc41d861568',
      venueName: 'Venue2',
      deviceGroupId: 'ap-group-2',
      deviceGroupName: 'APGroup2',
      apStatusData: {
        vxlanStatus: {
          vxlanMtu: 1300,
          tunStatus: 'VxLAN_TUN_STATUS_DISCONNECTED',
          primaryRvtepInfo: {
            deviceId: 'mocked-edge-2'
          },
          activeRvtepInfo: {
            deviceId: 'mocked-edge-2'
          }
        }
      }
    }
  ]
}

export const mockApGroupListForApTableTest = [
  {
    key: 'ap-group-1',
    value: 'APGroup1'
  },
  {
    key: 'ap-group-2',
    value: 'APGroup2'
  }
]

export const mockClusterForApTableTest = {
  fields: [
    'tenantId', 'clusterId', 'name', 'virtualIp', 'venueId', 'venueName',
    'clusterStatus', 'edgeList'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
      clusterId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
      name: 'Cluster1',
      highAvailabilityMode: ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE,
      edgeList: [
        {
          name: 'Edge1',
          serialNumber: 'mocked-edge-1',
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_ACTIVE
        },
        {
          name: 'Edge2',
          serialNumber: 'mocked-edge-2',
          haStatus: NodeClusterRoleEnum.CLUSTER_ROLE_BACKUP
        }
      ]
    }
  ]
}
