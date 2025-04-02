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
      destinationEdgeClusterName: 'EdgeCluster1'
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
      destinationEdgeClusterName: 'EdgeCluster2'
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
      tunnelType: TunnelTypeEnum.L2GRE,
      destinationEdgeClusterId: 'edge-cluster-3',
      destinationEdgeClusterName: 'EdgeCluster3'
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
      destinationEdgeClusterId: 'edge-cluster-4',
      destinationEdgeClusterName: 'EdgeCluster4'
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