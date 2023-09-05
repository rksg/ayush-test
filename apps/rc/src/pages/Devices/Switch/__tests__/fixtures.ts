export const venuelist = {
  totalCount: 2,
  page: 1,
  data: [
    {
      country: 'United States',
      dhcp: { enabled: false, mode: 'DHCPMODE_EACH_AP' },
      enabled: false,
      mode: 'DHCPMODE_EACH_AP',
      id: '908c47ee1cd445838c3bf71d4addccdf',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'Test-Venue'
    },
    {
      country: 'United States',
      dhcp: { enabled: false, mode: 'DHCPMODE_EACH_AP' },
      id: '4c778ed630394b76b17bce7fe230cf9f',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue'
    },
    {
      country: 'Malaysia',
      dhcp: { enabled: true, mode: 'DHCPMODE_EACH_AP' },
      id: 'a4f9622e9c7547ba934fbb5ee55646c2',
      latitude: '4.854995099999999',
      longitude: '100.751032',
      name: 'Venue-DHCP'
    },
    {
      country: 'United States',
      dhcp: { enabled: true, mode: 'DHCPMODE_MULTIPLE_AP' },
      id: '16b11938ee934928a796534e2ee47661',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'Venue-DHCP 2'
    },
    {
      country: 'Canada',
      id: 'b6cd663931b34a8b8fc97a81bfaa0929',
      latitude: '51.12090129999999',
      longitude: '-114.0044601',
      name: 'Venue-MESH'
    }
  ]
}

export const apGrouplist = {
  fields: ['name', 'id'],
  totalCount: 0,
  page: 1,
  data: [
    {
      id: '484eb4220e4b424da1f54b207cc678b9',
      name: 'test'
    }
  ]
}

export const successResponse = {
  requestId: 'request-id'
}

export const editStackData = {
  id: 'FEK4124R28X',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  enableStack: true,
  igmpSnooping: 'none',
  jumboMode: false,
  dhcpClientEnabled: true,
  dhcpServerEnabled: false,
  rearModule: 'none'
}

export const editStackDetail = {
  suspendingDeployTime: '',
  stackMemberOrder: 'FEK4124R28X',
  isStack: true,
  rearModule: 'none',
  deviceStatus: 'OPERATIONAL',
  syncedSwitchConfig: true,
  sendedHostname: true,
  switchMac: '',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  model: 'ICX7150-C12P',
  id: 'FEK4124R28X',
  floorplanId: '117c43124ed24069b127c50a49a0db36',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FEK4124R28X',
  xPercent: 69.75138092041016,
  yPercent: 12.195121765136719,
  portsStatus: {},
  stackMember: false,
  cliApplied: false,
  stackMembers: [
    { model: 'ICX7150-C12P', id: 'FEK4124R28X' },
    { model: 'ICX7150-C12P', id: 'FEK4224R17X' }
  ],
  poeUsage: {},
  venueName: 'My-Venue',
  isIpFullContentParsed: false,
  ipFullContentParsed: true,
  formStacking: true,
  name: '',
  tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
  activeSerial: 'FEK4124R28X'
}

export const editStackMembers = {
  data: [
    {
      venueName: 'My-Venue',
      serialNumber: 'FEK4124R28X',
      operStatusFound: false,
      switchMac: '',
      model: 'ICX7150-C12P',
      activeSerial: 'FEK4124R28X',
      id: 'FEK4124R28X',
      uptime: '',
      order: '1'
    },
    {
      venueName: 'My-Venue',
      serialNumber: 'FEK4224R17X',
      operStatusFound: false,
      switchMac: '',
      model: 'ICX7150-C12P',
      activeSerial: 'FEK4224R17X',
      id: 'FEK4224R17X',
      uptime: '',
      order: '2'
    }
  ],
  totalCount: 1
}

export const staticRoutes = [
  {
    id: '6975f36e590b43f5a47beb12af87e5f6',
    destinationIp: '0.0.0.0/1',
    nextHop: '192.168.1.254',
    adminDistance: 254
  }
]

export const standaloneSwitches = [{
  id: 'FEK3224R07X', model: 'ICX7150-C12P', serialNumber: 'FEK3224R07X', name: 'FEK3224R07X_name'
}, {
  id: 'FEK3224R08X', model: 'ICX7150-C12P', serialNumber: 'FEK3224R08X', name: 'FEK3224R08X_name'
}]
