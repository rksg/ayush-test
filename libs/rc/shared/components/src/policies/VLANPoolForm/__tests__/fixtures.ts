import { VLANPoolPolicyType } from '@acx-ui/rc/utils'

export const vlanData: VLANPoolPolicyType = {
  id: 'policy-id',
  name: 'test1',
  vlanMembers: ['2','3']
}

export const vlanList: VLANPoolPolicyType[] = [
  {
    id: '1',
    name: 'test1',
    vlanMembers: ['2','3']
  },
  {
    id: 'policy-id',
    name: 'test2',
    vlanMembers: ['2','3']
  }
]

export const vlanTemplateList: VLANPoolPolicyType[] = [
  {
    id: '1',
    name: 'test1-temp',
    vlanMembers: ['2','3']
  },
  {
    id: '2',
    name: 'test2-temp',
    vlanMembers: ['2','3']
  }
]
