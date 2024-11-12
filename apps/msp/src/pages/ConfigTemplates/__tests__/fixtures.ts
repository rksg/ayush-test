import { ConfigTemplate, ConfigTemplateDriftType, ConfigTemplateType } from '@acx-ui/rc/utils'

export const mockedConfigTemplateList = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '1',
      name: 'Template 1',
      createdOn: 1690598400000,
      createdBy: 'Author 1',
      appliedOnTenants: ['t1', '1969e24ce9af4348833968096ff6cb47'],
      type: ConfigTemplateType.NETWORK,
      lastModified: 1690598400000,
      lastApplied: 1690598405000,
      driftStatus: ConfigTemplateDriftType.DRIFT_DETECTED
    },
    {
      id: '2',
      name: 'Template 2',
      createdOn: 1690598500000,
      createdBy: 'Author 2',
      appliedOnTenants: [],
      type: ConfigTemplateType.NETWORK,
      lastModified: 1690598500000,
      lastApplied: 1690598505000
    },
    {
      id: '3',
      name: 'Template 3',
      createdOn: 1690598500000,
      createdBy: 'Author 3',
      appliedOnTenants: ['t1'],
      type: ConfigTemplateType.RADIUS,
      lastModified: 1690598500000,
      lastApplied: 1690598510000
    },
    {
      id: '4',
      name: 'Template 4',
      createdOn: 1690598500000,
      createdBy: 'Author 4',
      type: ConfigTemplateType.LAYER_2_POLICY,
      lastModified: 1690598500000
    },
    {
      id: '974eea0ed9da41fa95608e8c34d74f35',
      name: 'Venue Template',
      type: ConfigTemplateType.VENUE,
      tenantId: 'dc2146381a874d04a824bdd8c7bb991d',
      appliedOnTenants: [
        'a48e45a0331b4c7cac85965e3a72021e',
        'f5dab8103d974152af1dfc805008953f'
      ],
      createdBy: 'msp.cfgtemp.9@rwbigdog.com',
      createdOn: 1716466685000,
      lastModified: 1717472163000,
      lastApplied: 1717581994984
    }
  ] as ConfigTemplate[]
}

export const mockedMSPCustomerList = {
  fields: ['tenantType', 'streetAddress', 'name', 'id', 'check-all', 'status'],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'a80624a0549440868a846626084f57c9',
      name: 'ec-1',
      streetAddress: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      entitlements: [
        {
          expirationDateTs: '1703037906000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: 'a80624a0549440868a846626084f57c9',
          type: 'entitlement',
          expirationDate: '2023-12-20T02:05:06Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1703037906000'
        }
      ],
      status: 'Active',
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      tenantType: 'MSP_EC',
      installerCount: 0,
      integratorCount: 0
    },
    {
      id: 'a48e45a0331b4c7cac85965e3a72021e',
      name: 'Tal-Tel',
      streetAddress: '337, Taiwan, Taoyuan City, Dayuan District, Hangzhan S Rd, No. 15',
      mspAdminCount: 1,
      mspEcAdminCount: 1,
      entitlements: [],
      status: 'Active',
      creationDate: '1715654961625',
      tenantType: 'MSP_EC',
      installerCount: 0,
      integratorCount: 0,
      accountTier: 'Gold'
    },
    {
      id: '20bbe08b90124a26983e6ef811127e6f',
      name: 'Camel-Tel',
      streetAddress: 'San Francisco, CA',
      mspAdminCount: 1,
      mspEcAdminCount: 0,
      entitlements: [],
      status: 'Active',
      accountType: 'PAID',
      creationDate: '1711531105649',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 1,
      tenantType: 'MSP_EC',
      installerCount: 0,
      integratorCount: 0,
      accountTier: 'Gold'
    },
    {
      id: '1969e24ce9af4348833968096ff6cb47',
      name: 'Chill-Tel',
      streetAddress: 'No. 7, Section 5, Xinyi Rd, Xinyi District, Taipei City, Taiwan 110',
      mspAdminCount: 1,
      mspEcAdminCount: 0,
      entitlements: [],
      status: 'Active',
      accountType: 'TRIAL',
      creationDate: '1713755484585',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      tenantType: 'MSP_EC',
      installerCount: 0,
      integratorCount: 0,
      accountTier: 'Platinum'
    }
  ]
}

export const mockPortalList = {
  fields: [
    'id',
    'network',
    'venues',
    'health',
    'abandonmentRate',
    'clients',
    'clientsPortal'
  ],
  totalCount: 4,
  page: 1,
  data: [
    {
      id: '1',
      name: 'NetA',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 88
    },
    {
      id: '7',
      name: 'NetB',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8d',
        name: 'Network B',
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 64
    },
    {
      id: '8',
      name: 'NetC',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8f',
        name: 'Network C',
        captiveType: 'Self Sign In'
      },
      venues: { count: 1, names: [] },
      clients: 86
    },
    {
      id: '4',
      name: 'NetD',
      nwSubType: 'guest',
      captiveType: 'SelfSignIn',
      network: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8g',
        name: 'Network E',
        captiveType: 'Self Sign In'
      },
      venues: { count: 2, names: [] },
      clients: 70
    }
  ]
}
export const mockPortalDetailResult = {
  id: 1,
  name: 'test',
  content: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: '#333333',
    bgImage: '',
    bgColor: '#FFFFFF',
    welcomeSize: 14,

    photoRatio: 170,

    logoRatio: 105,
    secondaryText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing' +
      ' elit. Aenean euismod bibendum laoreet.',
    secondaryColor: '#333333',
    secondarySize: 14,
    buttonColor: '#EC7100',
    poweredBgColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: 14,
    poweredImgRatio: 50,
    wifi4EUNetworkId: '',
    termsCondition: '',
    componentDisplay: {
      logo: true,
      welcome: true,
      photo: true,
      secondaryText: true,
      termsConditions: false,
      poweredBy: true,
      wifi4eu: false
    },
    displayLangCode: 'en',

    alternativeLang: {
      cs: true,
      zh_TW: false,
      fi: true,
      fr: true,
      de: true,
      el: true,
      hu: true,
      it: false
    }
  }
}

export const mockedNetworkTemplates = {
  fields: [
    'id',
    'name',
    'nwSubType',
    'captiveType',
    'network',
    'venues',
    'clients'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '1',
      name: 'NetT',
      nwSubType: 'guest',
      captiveType: 'GuestPass',
      network: {
        id: '6',
        name: 'Network A',
        captiveType: 'Guest Pass'
      },
      venues: { count: 0, names: [] },
      clients: 88
    }
  ]
}

export const mockedEnhancedPortalList = {
  data: [{ id: 'test', name: 'test', displayLangCode: 'en', wifiNetworkIds: ['networkId'] }],
  paging: { page: 1, pageSize: 10, totalCount: 1 }
}


export const mockedVenueTemplate = {
  address: {
    addressLine: '1093 Main St, New York, NY, 10044, United States',
    city: 'New York',
    country: 'United States',
    latitude: 40.7690084,
    longitude: -73.9431541,
    timezone: 'America/New_York'
  },
  createdDate: '2022-07-08T04:59:22.351+00:00',
  description: '',
  floorPlans: [],
  id: '4c778ed630394b76b17bce7fe230cf9f',
  name: 'My Template Venue',
  updatedDate: '2022-07-08T04:59:22.351+00:00'
}

export const mockVenueTemplateList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '069c06765c9841fcaf35bb5dbd2319eb',
      name: 'My1stVenueTemplate1'
    },
    {
      id: 'eb9555414ea444aa984d5399f0c1c892',
      name: 'My1stVenueTemplate2'
    }
  ]
}
