export const flexAuthList = {
  totalCount: 3,
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
    authenticationType: '802.1x_and_macauth',
    dot1xPortControl: 'auto',
    authDefaultVlan: 1,
    guestVlan: 5,
    authFailAction: 'block',
    authTimeoutAction: 'none',
    changeAuthOrder: true
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

export const appliedTargets = [{
  id: '88a05a1e0c5e4d108532e92ca5bfc246',
  ports: ['1/1/2,1/1/3'],
  switchId: 'c0:c5:20:78:fc:04',
  switchModel: 'ICX7650_48ZP',
  switchName: 'Switch-1',
  venueId: '51ceb59612724c2cb4d3b9c01315749d',
  venueName: 'ProfileVenue'
}, {
  id: '88a05a1e0c5e4d108532e92ca5bfc247',
  ports: ['1/1/2'],
  switchId: 'c0:c5:20:78:fc:05',
  switchModel: 'ICX7650_48ZP',
  switchName: 'Switch-2',
  venueId: '51ceb59612724c2cb4d3b9c01315749e',
  venueName: 'ProfileVenue2'
}]