export const networksResponse = {
  fields: ['name', 'id'],
  totalCount: 0,
  page: 1,
  data: []
}
export const networkDeepResponse = {
  type: 'psk',
  wlan: {
    advancedCustomization: {
      clientIsolation: true,
      userUplinkRateLimiting: 0,
      userDownlinkRateLimiting: 0,
      totalUplinkRateLimiting: 0,
      totalDownlinkRateLimiting: 0,
      maxClientsOnWlanPerRadio: 100,
      enableBandBalancing: true,
      clientIsolationOptions: {
        packetsType: 'UNICAST',
        autoVrrp: false
      },
      hideSsid: false,
      forceMobileDeviceDhcp: false,
      clientLoadBalancingEnable: true,
      directedThreshold: 5,
      enableNeighborReport: true,
      radioCustomization: {
        rfBandUsage: 'BOTH',
        bssMinimumPhyRate: 'default',
        phyTypeConstraint: 'OFDM',
        managementFrameMinimumPhyRate: '6'
      },
      enableSyslog: false,
      clientInactivityTimeout: 120,
      accessControlEnable: false,
      respectiveAccessControl: true,
      applicationPolicyEnable: false,
      l2AclEnable: false,
      l3AclEnable: false,
      wifiCallingEnabled: false,
      proxyARP: false,
      enableAirtimeDecongestion: false,
      enableJoinRSSIThreshold: false,
      joinRSSIThreshold: -85,
      enableTransientClientManagement: false,
      joinWaitTime: 30,
      joinExpireTime: 300,
      joinWaitThreshold: 10,
      enableOptimizedConnectivityExperience: false,
      broadcastProbeResponseDelay: 15,
      rssiAssociationRejectionThreshold: -75,
      enableAntiSpoofing: false,
      enableArpRequestRateLimit: true,
      arpRequestRateLimit: 15,
      enableDhcpRequestRateLimit: true,
      dhcpRequestRateLimit: 15,
      dnsProxyEnabled: false
    },
    vlanId: 1,
    ssid: '',
    enabled: true
  },
  tenantId: '3394d65f20114028996f8301bbde622f',
  name: '',
  id: '3dc530b525654be1bee143728ba39f8a'
}

export const wifiCloudpathResponse = [
  {
    name: 'twoserver',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '4.4.4.4',
        port: 4444,
        sharedSecret: '666666'
      },
      id: '71da40ca44144030a861668cf22f4ec7'
    },
    accountingRadius: {
      primary: {
        ip: '5.5.5.5',
        port: 5555,
        sharedSecret: '666666'
      },
      id: 'd5f3a867ec95466085a939475f396fd7'
    },
    id: '2b94e9cbf3454b71af9ee06af0fcb5ba'
  },
  {
    name: 'test1',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '1.1.1.1',
        port: 11111,
        sharedSecret: '111111'
      },
      id: 'c7f1dfd9ae86482f9a98c939a3202438'
    },
    id: '46ec9547703b424daa9614ea8e80160f'
  },
  {
    name: 'test server 2',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '2.2.2.2',
        port: 2222,
        sharedSecret: '222222'
      },
      id: 'd3753ce508a44633bfd4ad673174ad30'
    },
    id: '6116be7334be493e85a9db7a4efe5576'
  },
  {
    name: 'test2',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '1.1.1.1',
        port: 10,
        sharedSecret: '888888888888888'
      },
      id: 'ceed9973ad994ffbb5b26538fece3005'
    },
    id: 'decbac6f92244933b7ccaba4e06c5137'
  }
]

export const venuesResponse = {
  fields: [
    'country','city','aps','latitude','switches','description',
    'networks','switchClients','vlan','radios','name','scheduling',
    'id','aggregatedApStatus','mesh','activated','longitude','status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '6cf550cdb67641d798d804793aaa82db',name: 'My-Venue',
      description: 'My-Venue',city: 'New York',country: 'United States',
      latitude: '40.7690084',longitude: '-73.9431541',switches: 2,
      status: '1_InSetupPhase',mesh: { enabled: false }
    },{
      id: 'c6ae1e4fb6144d27886eb7693ae895c8',name: 'TDC_Venue',
      description: 'Taipei',city: 'Zhongzheng District, Taipei City',
      country: 'Taiwan',latitude: '25.0346703',longitude: '121.5218293',
      networks: { count: 1,names: ['JK-Network'],vlans: [1] },
      aggregatedApStatus: { '2_00_Operational': 1 },
      switchClients: 1,switches: 1,status: '2_Operational',
      mesh: { enabled: false }
    }
  ]
}

export const venueListResponse = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: '01b1fe5d153d4a2a90455795af6ad877',
      name: 'airport'
    },
    {
      id: 'b2efc20b6d2b426c836d76110f88941b',
      name: 'dsfds'
    },
    {
      id: 'f27f33e0475d4f49af57350fed788c7b',
      name: 'SG office'
    },
    {
      id: '4c778ed630394b76b17bce7fe230cf9f',
      name: 'My-Venue'
    },
    {
      id: 'a678f2e5767746a394a7b10c45235119',
      name: 'sadas'
    }
  ]
}

export const successResponse = { requestId: 'request-id' }

export const cloudpathResponse = [{
  authRadius: {
    primary: {
      ip: '5.54.58.5',
      port: 56,
      sharedSecret: '454545'
    },
    id: 'c615bf8c82dc404ebb98c7e89672ef29'
  },
  deploymentType: 'Cloud',
  id: '6edb22ef74b143f280f2eb3105053840',
  name: 'cloud_02'
}, {
  authRadius: {
    primary: {
      ip: '3.2.34.5',
      port: 56,
      sharedSecret: 'GFHFGH'
    },
    id: '296ee3f68c434aa4bc3b3ba1f7272806'
  },
  deploymentType: 'Cloud',
  id: '5cc1d4a21c4d41b8ab1a839a0e03cc8c',
  name: 'cloud_01'
}]

export const policyListResponse = {
  fields: ['name', 'id'],
  totalCount: 0,
  totalPages: 0,
  page: 1
}