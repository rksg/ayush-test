import { ConfigTemplate } from '@acx-ui/rc/utils'

export const mockedConfigTemplateList = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '1',
      name: 'Template 1',
      createdOn: 1690598400000,
      createdBy: 'Author 1',
      appliedOnTenants: ['t1', 't2'],
      type: 'NETWORK',
      lastModified: 1690598400000,
      lastApplied: 1690598405000
    },
    {
      id: '2',
      name: 'Template 2',
      createdOn: 1690598500000,
      createdBy: 'Author 2',
      appliedOnTenants: [],
      type: 'NETWORK',
      lastModified: 1690598500000,
      lastApplied: 1690598505000
    },
    {
      id: '3',
      name: 'Template 3',
      createdOn: 1690598500000,
      createdBy: 'Author 3',
      appliedOnTenants: ['t1'],
      templateType: 'RADIUS',
      lastModified: 1690598500000,
      lastApplied: 1690598510000
    }
  ] as ConfigTemplate[]
}

export const mockedMSPCustomerList = {
  fields: [
    'tenantType',
    'streetAddress',
    'name',
    'id',
    'check-all',
    'status'
  ],
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
    }
  ]
}

export const layer2PolicyListResponse = [
  {
    id: '36ec4826b5da48cc8118eda83aa4080f',
    name: 'layer2policy1',
    macAddressesCount: 1,
    networksCount: 0
  }
]

export const layer3PolicyListResponse = [
  {
    id: '233d3182a1aa49ee9f50aeb039347021',
    name: 'layer3policy1',
    rulesCount: 1,
    networksCount: 0
  }
]

export const avcCat = [
  {
    catName: 'Web',
    catId: 30
  },
  {
    catName: 'Printer',
    catId: 21
  },
  {
    catName: 'Audio/Video',
    catId: 3
  }
]

export const avcApp = [{
  appName: 'BBC',
  avcAppAndCatId: {
    catId: 30,
    appId: 1754
  }
}, {
  appName: 'AppsFlyer',
  avcAppAndCatId: {
    catId: 30,
    appId: 2334
  }
}, {
  appName: 'BJNP',
  avcAppAndCatId: {
    catId: 21,
    appId: 2481
  }
}, {
  appName: '050 plus',
  avcAppAndCatId: {
    catId: 3,
    appId: 1123
  }
}]
