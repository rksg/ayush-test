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

export const switchFirmwareVenue = {
  upgradeVenueViewList: [
    {
      id: 'a2b8c535a600476a93bce1a450881fba',
      name: 'cliApplied',
      switchFirmwareVersion: {
        id: '09010f_b18',
        name: '09010f_b18',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010b_b43',
        name: '10010b_b43',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010h_rc1',
          name: '09010h_rc1',
          category: 'RECOMMENDED'
        },
        {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: 'RECOMMENDED'
        }
      ],
      lastScheduleUpdateTime: '2023-08-31T03:00:00.058+00:00',
      preDownload: true,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      upgradeVenueViewList: null
    }, {
      id: '8fc3ac989b2341a4b68d32ef5297662e',
      name: '9010fVenue',
      switchFirmwareVersion: {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010a_b35',
        name: '10010a_b35',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010h_rc1',
          name: '09010h_rc1',
          category: 'RECOMMENDED'
        },
        {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: 'RECOMMENDED'
        }
      ],
      lastScheduleUpdateTime: '2023-08-02T10:19:27.919+00:00',
      preDownload: false,
      switchCount: 1,
      aboveTenSwitchCount: 0,
      upgradeVenueViewList: null
    }, {
      id: '0888c7d7c5e04764a8dfd45ad433abce',
      name: 'testNewTarget',
      switchFirmwareVersion: {
        id: '09010h_rc1',
        name: '09010h_rc1',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010a_cd3_b11',
        name: '10010a_cd3_b11',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010h_rc1',
          name: '09010h_rc1',
          category: 'RECOMMENDED'
        },
        {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: 'RECOMMENDED'
        }
      ],
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      upgradeVenueViewList: null
    }, {
      id: 'd046e35d3c554fedbdd88df55451fd16',
      name: 'My-Venue',
      switchFirmwareVersion: {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010_rc3',
        name: '10010_rc3',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010h_rc1',
          name: '09010h_rc1',
          category: 'RECOMMENDED'
        },
        {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: 'RECOMMENDED'
        }
      ],
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      upgradeVenueViewList: null
    }, {
      id: 'd24e1cf660174b2eb419d739d1f76ca3',
      name: 'new10010Venue',
      switchFirmwareVersion: {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010a_b36',
        name: '10010a_b36',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010h_rc1',
          name: '09010h_rc1',
          category: 'RECOMMENDED'
        },
        {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: 'RECOMMENDED'
        }
      ],
      lastScheduleUpdateTime: '2023-08-15T10:52:24.639+00:00',
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      upgradeVenueViewList: null
    }, {
      id: '5953c855edc140ec9628a672817b234c',
      name: '10010Venue',
      switchFirmwareVersion: {
        id: '09010f_b401',
        name: '09010f_b401',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010a_b1',
        name: '10010a_b1',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010h_rc1',
          name: '09010h_rc1',
          category: 'RECOMMENDED'
        },
        {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: 'RECOMMENDED'
        }
      ],
      lastScheduleUpdateTime: '2023-07-14T02:46:02.929+00:00',
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      upgradeVenueViewList: null
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
