export const mockAuthProfiles = [
  {
    id: '7de28fc02c0245648dfd58590884bad2',
    profileName: 'Profile01--auth10-guest5',
    authenticationType: '802.1x',
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    guestVlan: 5,
    authFailAction: 'block',
    authTimeoutAction: 'none'
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
  },
  {
    id: 'b2e70648d1504a278a2a3340e6e4a1b7',
    profileName: 'Profile04--auth10-r3-c4',
    authenticationType: '802.1x',
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    restrictedVlan: 3,
    criticalVlan: 4,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  },
  {
    id: '7a0101e8e97b4b518032e6e4e432cacf',
    profileName: 'Profile05--auth100-r3-c4',
    authenticationType: '802.1x',
    dot1xPortControl: 'auto',
    authDefaultVlan: 100,
    restrictedVlan: 3,
    criticalVlan: 4,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  },
  {
    id: '79a2a159d5cd435fb5bb971ff1e4707f',
    profileName: 'Profile06--auth10-r4-c3',
    authenticationType: '802.1x',
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    restrictedVlan: 4,
    criticalVlan: 3,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  },
  {
    id: 'b0ad250928ae41d2be003a87fe61fbf7',
    profileName: 'Profile07--auth10-r1-c2',
    authenticationType: 'macauth',
    changeAuthOrder: false,
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    restrictedVlan: 1,
    criticalVlan: 2,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  },
  {
    id: '9b84ee6f014b42ce8fa0ef1a1c24bd8d',
    profileName: 'Profile08--auth10-r2-c1',
    authenticationType: '802.1x_and_macauth',
    changeAuthOrder: true,
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    restrictedVlan: 2,
    criticalVlan: 1,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  },
  {
    id: '9b84ee6f014b42ce8fa0ef1a1c24bd8e',
    profileName: 'Profile09--auth10-r3-c3-g4',
    authenticationType: '802.1x_and_macauth',
    changeAuthOrder: true,
    dot1xPortControl: 'auto',
    authDefaultVlan: 10,
    restrictedVlan: 3,
    criticalVlan: 3,
    guestVlan: 4,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  },
  {
    id: '9b84ee6f014b42ce8fa0ef1a1c24bd8f',
    profileName: 'Profile10--auth99-r3-c3-g4',
    authenticationType: 'macauth',
    changeAuthOrder: true,
    dot1xPortControl: 'auto',
    authDefaultVlan: 99,
    restrictedVlan: 3,
    criticalVlan: 3,
    guestVlan: 4,
    authFailAction: 'restricted_vlan',
    authTimeoutAction: 'critical_vlan'
  }
]