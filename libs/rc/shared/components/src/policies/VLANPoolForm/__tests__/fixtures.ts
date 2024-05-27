import { TableResult, VLANPoolPolicyType, VLANPoolViewModelType } from '@acx-ui/rc/utils'

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
