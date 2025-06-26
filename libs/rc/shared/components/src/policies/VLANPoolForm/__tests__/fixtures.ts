import { VLANPoolPolicyType, VLANPoolViewModelRbacType, VLANPoolViewModelType } from '@acx-ui/rc/utils'
import { TableResult } from '@acx-ui/utils'

export const vlanData: VLANPoolPolicyType = {
  id: 'policy-id',
  name: 'test1',
  vlanMembers: ['2','3']
}

export const vlanList: TableResult<VLANPoolViewModelType> = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'test1',
      vlanMembers: ['2','3'],
      venueIds: [],
      venueApGroups: []
    },
    {
      id: '2',
      name: 'test2',
      vlanMembers: ['2','3'],
      venueIds: [],
      venueApGroups: []
    }
  ]
}

export const vlanRbacList: TableResult<VLANPoolViewModelRbacType> = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'test1',
      vlanMembers: ['2','3'],
      wifiNetworkIds: [],
      wifiNetworkVenueApGroups: []
    },
    {
      id: '2',
      name: 'test2',
      vlanMembers: ['2','3'],
      wifiNetworkIds: [],
      wifiNetworkVenueApGroups: []
    }
  ]
}

export const vlanPoolRbacDetail = {
  name: 'test',
  vlanMembers: ['2-6','7-9'],
  id: '9461e5412c1b424f975cd4aee2b1eca2',
  wifiNetworkIds: ['51134687bde947cb86a0426995fdd442'],
  wifiNetworkVenueApGroups: [{
    venueId: 'ebcccef6b366415dbb85073e5aa7248c',
    isAllGroups: false,
    apGroupIds: [
      '33e6a901d4a8492eb4a1f2b75de75af3',
      '81134687bde947cb86a0426995fdd442'
    ]
  }]
}

export const vlanTemplateList: TableResult<VLANPoolViewModelType> = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'test1-temp',
      vlanMembers: ['2','3'],
      venueIds: [],
      venueApGroups: []
    },
    {
      id: '2',
      name: 'test2-temp',
      vlanMembers: ['2','3'],
      venueIds: [],
      venueApGroups: []
    }
  ]
}
