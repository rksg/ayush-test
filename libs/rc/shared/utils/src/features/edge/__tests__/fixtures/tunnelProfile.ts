import { NetworkSegmentTypeEnum, TunnelTypeEnum } from '../../../../models'

export const mockedTunnelProfileViewData = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'tunnelProfileId1',
      name: 'tunnelProfile1',
      tags: ['tag1'],
      mtuType: 'MANUAL',
      mtuSize: 1450,
      ageTimeMinutes: 20,
      forceFragmentation: true,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      sdLanIds: [],
      type: NetworkSegmentTypeEnum.VXLAN,
      natTraversalEnabled: true,
      tunnelType: TunnelTypeEnum.VXLAN_GPE,
      destinationEdgeClusterId: 'edge-cluster-1',
      destinationEdgeClusterName: 'EdgeCluster1',
      mtuRequestRetry: 1,
      mtuRequestTimeout: 10,
      keepAliveRetry: 1,
      keepAliveInterval: 1000
    },
    {
      id: 'tunnelProfileId2',
      name: 'tunnelProfile2',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      ageTimeMinutes: 20,
      forceFragmentation: false,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      sdLanIds: [],
      type: NetworkSegmentTypeEnum.VXLAN,
      natTraversalEnabled: false,
      tunnelType: TunnelTypeEnum.VXLAN_GPE,
      destinationEdgeClusterId: 'edge-cluster-2',
      destinationEdgeClusterName: 'EdgeCluster2',
      mtuRequestRetry: 1,
      mtuRequestTimeout: 10,
      keepAliveRetry: 1,
      keepAliveInterval: 1000
    },
    {
      id: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      name: 'Default',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      ageTimeMinutes: 20,
      forceFragmentation: false,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      sdLanIds: [],
      type: NetworkSegmentTypeEnum.VXLAN,
      tunnelType: TunnelTypeEnum.L2GRE
    },
    {
      id: 'SLecc2d7cf9d2342fdb31ae0e24958fcac',
      name: 'Default tunnel profile (SD-LAN)',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      ageTimeMinutes: 20,
      forceFragmentation: false,
      personalIdentityNetworkIds: [],
      networkIds: ['network1', 'network2'],
      sdLanIds: ['sdlan1', 'sdlan2'],
      type: NetworkSegmentTypeEnum.VLAN_VXLAN,
      tunnelType: TunnelTypeEnum.L2GRE,
      mtuRequestRetry: 1,
      mtuRequestTimeout: 10,
      keepAliveRetry: 1,
      keepAliveInterval: 1000
    },
    {
      id: 'tunnelProfileId7',
      name: 'tunnelProfile7',
      tags: ['tag1'],
      mtuType: 'MANUAL',
      mtuSize: 1450,
      ageTimeMinutes: 20,
      forceFragmentation: true,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      sdLanIds: [],
      type: NetworkSegmentTypeEnum.VXLAN,
      natTraversalEnabled: true,
      tunnelType: TunnelTypeEnum.VXLAN_GPE,
      destinationEdgeClusterId: 'clusterId_3',
      destinationEdgeClusterName: 'Edge Cluster 3',
      mtuRequestRetry: 1,
      mtuRequestTimeout: 10,
      keepAliveRetry: 1,
      keepAliveInterval: 1000
    }
  ]
}

export const mockedDefaultTunnelProfileViewData = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      name: 'Default',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      ageTimeMinutes: 20,
      forceFragmentation: false,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      sdLanIds: [],
      type: NetworkSegmentTypeEnum.VXLAN,
      tunnelType: TunnelTypeEnum.VXLAN_GPE
    }
  ]
}

export const mockedDefaultVlanVxlanTunnelProfileViewData = {
  totalCount: 1,
  page: 1,
  data: [
    {
      ...mockedDefaultTunnelProfileViewData.data[0],
      id: 'SLecc2d7cf9d2342fdb31ae0e24958fcac',
      name: 'Default tunnel profile (SD-LAN)',
      personalIdentityNetworkIds: [],
      sdLanIds: ['sdlan1'],
      type: NetworkSegmentTypeEnum.VLAN_VXLAN
    }
  ]
}

export const mockedTunnelProfileData = {
  id: 'tunnelProfileId1',
  name: 'tunnelProfile1',
  tag: 'test',
  mtuType: 'MANUAL',
  mtuSize: 1450,
  forceFragmentation: true,
  ageTimeMinutes: 20,
  natTraversalEnabled: false
}

export const mockedDefaultTunnelProfileData = {
  id: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  name: 'Default',
  tag: '',
  mtuType: 'AUTO',
  mtuSize: 0,
  ageTimeMinutes: 20,
  forceFragmentation: false
}

export const mockedTunnelTypeL2greData = {
  id: 'mock_tunnel_l2gre_1',
  type: NetworkSegmentTypeEnum.VLAN_VXLAN,
  name: 'L2GRE',
  tunnelType: TunnelTypeEnum.L2GRE,
  destinationIpAddress: '10.10.10.10',
  mtuSize: 600,
  forceFragmentation: false
}