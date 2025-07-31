export const flexAuthList = {
  totalCount: 2,
  page: 1,
  data: [{
    id: '7de28fc02c0245648dfd58590884bad2',
    profileName: 'Profile01--auth10-guest5',
    authenticationType: '802.1x',
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    restrictedVlan: 3,
    criticalVlan: 4,
    guestVlan: 5,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  },
  {
    id: '8814a74f53c04c08bf280f247fab527b',
    profileName: 'Profile02--auth1-guest5',
    authenticationType: '802.1x',
    dot1xPortControl: 'auto',
    authDefaultVlan: 1,
    guestVlan: 5,
    authFailAction: 'block',
    authTimeoutAction: 'none'
  },
  {
    id: 'dccf7d0272024d3ca03bcf5b48497685',
    profileName: 'Profile03--auth10-r3-c4-g5',
    authenticationType: '802.1x',
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    restrictedVlan: 3,
    criticalVlan: 4,
    guestVlan: 5,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  }]
}