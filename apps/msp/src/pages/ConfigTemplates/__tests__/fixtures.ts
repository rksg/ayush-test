export const mockedConfigTemplateList = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '1',
      name: 'Template 1',
      createdOn: '2021-01-01',
      createdBy: 'Author 1',
      appliedTo: '5',
      category: 'Category 1',
      type: 'NETWORK',
      lastModified: '2021-02-01',
      lastApplied: '2021-03-01'
    },
    {
      id: '2',
      name: 'Template 2',
      createdOn: '2021-02-01',
      createdBy: 'Author 2',
      appliedTo: '2',
      category: 'Category 2',
      type: 'NETWORK',
      lastModified: '2021-03-01',
      lastApplied: '2021-04-01'
    },
    {
      id: '3',
      name: 'Template 3',
      createdOn: '2021-03-01',
      createdBy: 'Author 3',
      appliedTo: '7',
      category: 'Category 3',
      type: 'RADIUS',
      lastModified: '2021-04-01',
      lastApplied: '2021-05-01'
    }
  ]
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
