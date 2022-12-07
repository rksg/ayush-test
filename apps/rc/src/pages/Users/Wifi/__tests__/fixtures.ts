export const GuestClient = {
  totalCount: 34,
  page: 1,
  data: [
    {
      name: 'test1',
      id: '865c88e0-7bae-47a1-9247-508a027a9500',
      creationDate: '2022-11-14T08:51:36.499Z',
      expiryDate: '0',
      emailAddress: '',
      guestType: 'type',
      ssid: 'guest pass wlan',
      networkId: '',
      passDurationHours: 1,
      guestStatus: 'Expired',
      notes: '',
      maxNumberOfClients: -1
    },
    {
      name: 'test2',
      id: '16bcc049-6f38-47b9-8ad1-daf803c4e8b9',
      creationDate: '2022-11-15T08:57:50.392Z',
      expiryDate: '',
      mobilePhoneNumber: '+12015550123',
      emailAddress: '',
      guestType: 'SelfSign',
      ssid: 'guest pass wlan',
      networkId: '3f04e252a9d04180855813131d007aca',
      passDurationHours: '',
      guestStatus: 'Not Applicable',
      notes: '',
      maxNumberOfClients: ''
    },
    {
      name: 'test3',
      id: '37a626e9-5d97-4349-b7a5-8822c62d3bf3',
      creationDate: '2022-11-28T08:15:14.690Z',
      expiryDate: '2022-12-28T08:15:14.695Z',
      emailAddress: '',
      guestType: 'HostGuest',
      ssid: 'guest pass wlan',
      networkId: '3f04e252a9d04180855813131d007aca',
      passDurationHours: 720,
      guestStatus: 'Offline',
      notes: '',
      maxNumberOfClients: 3
    },
    {
      name: 'test4',
      id: '99fbe8f0-bc9c-4f95-ac07-54146cf5c117',
      creationDate: '2022-11-20T08:57:12.338Z',
      mobilePhoneNumber: '+886933222333',
      emailAddress: '',
      guestType: 'GuestPass',
      ssid: 'guest pass wlan',
      networkId: '3f04e252a9d04180855813131d007aca',
      passDurationHours: 168,
      guestStatus: 'Online (1)',
      notes: '',
      maxNumberOfClients: 2,
      clients: [
        {
          osType: 'ios',
          healthCheckStatus: 'good',
          clientMac: 'AA:AA:AA:AA:AA:AA',
          ipAddress: '1.1.1.1',
          username: 'user',
          hostname: 'host',
          venueId: '0004e252a9d04180855813131d007aca',
          venueName: 'testVenue',
          apMac: 'BB:BB:BB:BB:BB:BB',
          apSerialNumber: '422039000038',
          apName: 'testAp',
          switchSerialNumber: '',
          switchName: '',
          networkId: '3f04e252a9d04180855813131d007aca',
          networkName: 'guest pass wlan',
          networkSsid: 'guest pass wlan',
          connectSince: '2022-11-28T14:55:15.924Z'
        }
      ]
    }
  ]
}

export const AllowedNetworkList = {
  fields: ['name', 'id', 'defaultGuestCountry'],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'guest pass wlan1',
      id: '3f04e252a9d04180855813131d007aca',
      defaultGuestCountry: 'United States'
    },
    {
      name: 'guest pass wlan2',
      id: 'dasjk12359552a9d041813131d007aca',
      defaultGuestCountry: 'United States'
    }
  ]
}

export const AllowedNetworkSingleList = {
  fields: ['name', 'id', 'defaultGuestCountry'],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'guest pass wlan1',
      id: '3f04e252a9d04180855813131d007aca',
      defaultGuestCountry: 'United States'
    }
  ]
}

export const UserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://devalto.ruckuswireless.com',
      current: true
    }
  ],
  externalId: '0032h00000LUqUKAA1',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1093',
  firstName: 'FisrtName 1093',
  lastName: 'LastName 1093',
  username: 'dog1093@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: 'debug',
  dateFormat: 'yyyy/mm/dd',
  email: 'dog1093@email.com',
  var: false,
  tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  varTenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  adminId: '2cfff8a9345843f88be768dbf833592f',
  support: false,
  dogfood: false
}

export const AddGuestPassResponse = {
  requestId: '3ba9cec3-38a9-4485-af84-4ff76473e10e',
  response: [
    {
      id: '41272f2e-05e8-45ae-bfea-c6a1111c604a',
      createdDate: 1670312604329,
      lastModified: 1670312604329,
      name: 'wifitest',
      disabled: false,
      networkId: '3f04e252a9d04180855813131d007aca',
      notes: '',
      email: '',
      mobilePhoneNumber: '+12052220123',
      maxDevices: 3,
      ssid: 'guest pass wlan',
      deliveryMethods: ['PRINT'],
      guestUserType: 'GuestPass',
      expiration: {
        activationType: 'Creation',
        duration: 7,
        unit: 'Day'
      },
      locale: 'en',
      password: '796022',
      expirationDate: 1670917404337
    }
  ]
}

export const AddGuestPassErrorResponse = {
  requestId: '30c7aaf4-b884-4b20-996d-49cb046389a0',
  error: {
    rootCauseErrors: [
      {
        code: 'GUEST-422006',
        message: 'Invalid guest name'
      }
    ],
    request: {},
    status: 400
  },
  request: {
    url: '/api/tenant/d1ec841a4ff74436b23bca6477f6a631/wifi/guest-user',
    method: 'POST'
  },
  errorCode: 1002
}

export const wifiNetworkDetail = {
  type: 'guest',
  wlan: {
    wlanSecurity: 'None',
    bypassCPUsingMacAddressAuthentication: true,
    advancedCustomization: {
      clientIsolation: true,
      userUplinkRateLimiting: 0,
      userDownlinkRateLimiting: 0,
      totalUplinkRateLimiting: 0,
      totalDownlinkRateLimiting: 0,
      maxClientsOnWlanPerRadio: 100,
      enableBandBalancing: true,
      clientIsolationOptions: { packetsType: 'UNICAST', autoVrrp: false },
      hideSsid: false,
      forceMobileDeviceDhcp: false,
      clientLoadBalancingEnable: true,
      enableAaaVlanOverride: true,
      directedThreshold: 5,
      enableNeighborReport: true,
      enableFastRoaming: false,
      mobilityDomainId: 1,
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
      singleSessionIdAccounting: false,
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
    macAddressAuthentication: false,
    vlanId: 1,
    ssid: 'guest pass wlan',
    enabled: true,
    bypassCNA: false
  },
  guestPortal: {
    guestNetworkType: 'GuestPass',
    enableSelfService: true,
    enableSmsLogin: false,
    maxDevices: 1,
    endOfDayReauthDelay: false,
    macCredentialsDuration: 240,
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    guestPage: { langCode: 'en', wifi4Eu: false },
    socialEmails: false,
    userSessionTimeout: 1440,
    userSessionGracePeriod: 60
  },
  tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  venues: [
    {
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '3f04e252a9d04180855813131d007aca',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      isAllApGroups: true,
      id: '0f9ed3985547493cbe008b1ac49578ec'
    }
  ],
  enableDhcp: false,
  name: 'guest pass wlan',
  id: '3f04e252a9d04180855813131d007aca'
}
