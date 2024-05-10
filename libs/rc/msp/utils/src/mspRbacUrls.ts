import { ApiInfo } from '@acx-ui/utils'

export const MspRbacUrlsInfo: { [key: string]: ApiInfo } = {
  // getMspCustomersList: {
  //   method: 'post',
  //   url: '/mspecs/query',
  //   oldUrl: '/api/viewmodel/tenant/:tenantId/mspeclist',
  //   newApi: true
  // },
  // getMspECList: {
  //   method: 'post',
  //   url: '/ecs/query?delegations=true',
  //   oldUrl: '/mspecs/query',
  //   newApi: true
  // },
  // getIntegratorCustomersList: {
  //   method: 'post',
  //   url: '/techpartners/mspecs/query',
  //   oldUrl: '/techpartners/mspecs/query',
  //   newApi: true
  // },
  // getMspDeviceInventory: {
  //   method: 'post',
  //   url: '/msps/:tenantId/ecInventories/query',
  //   oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory',
  //   newApi: true
  // },
  // getIntegratorDeviceInventory: {
  //   method: 'post',
  //   url: '/msps/:mspTenantId/ecInventories/query',
  //   oldUrl: '/api/viewmodel/tenant/:mspTenantId/ec-inventory',
  //   newApi: true
  // },
  getVarDelegations: {
    method: 'post',
    url: '/delegations',
    oldUrl: '/api/viewmodel/tenant/:tenantId/delegations',
    newApi: true
  },
  deleteMspEcAccount: {
    method: 'delete',
    url: '/tenants/:mspEcTenantId',
    oldUrl: '/mspCustomers/:mspEcTenantId',
    newApi: true
  },
  // getMspAdminList: {
  //   method: 'post',
  //   url: '/api/viewmodel/tenant/:tenantId/admin'
  // },
  // getAdministrators: {
  //   method: 'get',
  //   url: '/admins',
  //   oldUrl: '/api/tenant/:tenantId/admin',
  //   newApi: true
  // },
  // getMspEntitlementBanner: {
  //   method: 'get',
  //   url: '/mspBanners',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlementBanner',
  //   newApi: true
  // },
  // refreshMspEntitlement: {
  //   method: 'get',
  //   oldMethod: 'post',
  //   url: '/mspEntitlements/summaries?refresh=true',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlement/refresh',
  //   newApi: true
  // },
  // getMspEntitlement: {
  //   method: 'get',
  //   url: '/mspEntitlements',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlement',
  //   newApi: true
  // },
  // getMspEntitlementSummary: {
  //   method: 'get',
  //   url: '/mspEntitlements/summaries?refresh=false',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlementSummary',
  //   newApi: true
  // },
  // getMspAssignmentSummary: {
  //   method: 'get',
  //   url: '/assignments/summaries',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment/summary',
  //   newApi: true
  // },
  // getMspAssignmentHistory: {
  //   method: 'get',
  //   url: '/assignments',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
  //   newApi: true
  // },
  // addMspAssignment: {
  //   method: 'post',
  //   url: '/assignments',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
  //   newApi: true
  // },
  // updateMspAssignment: {
  //   method: 'PATCH',
  //   url: '/assignments',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
  //   newApi: true
  // },
  // deleteMspAssignment: {
  //   method: 'delete',
  //   url: '/assignments',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
  //   newApi: true
  // },
  resendEcInvitation: {
    // method: 'post',
    method: 'get',
    url: '/tenants/:mspEcTenantId/invitations',
    oldUrl: '/mspCustomers/:mspEcTenantId/invitations',
    newApi: true
  },
  // getMspCustomersListDropdown: {
  //   method: 'post',
  //   url: '/api/viewmodel/tenant/:mspTenantId/mspeclist'
  // },
  getMspProfile: {
    method: 'get',
    url: '/brandings',
    oldUrl: '/msplabel',
    newApi: true
  },
  getMspEcProfile: {
    method: 'get',
    url: '/tenants/:tenantId',
    oldUrl: '/mspCustomers/:tenantId',
    newApi: true
  },
  getMspEcAdmin: {
    method: 'get',
    url: '/tenants/:mspEcTenantId/admins/:mspEcAdminId',
    oldUrl: '/mspCustomers/:mspEcTenantId/admins/:mspEcAdminId',
    newApi: true
  },
  updateMspEcAdmin: {
    method: 'put',
    url: '/tenants/:mspEcTenantId/admins/:mspEcAdminId',
    oldUrl: '/mspCustomers/:mspEcTenantId/admins/:mspEcAdminId',
    newApi: true
  },
  // getTenantDetail: {
  //   method: 'get',
  //   url: '/tenants/self',
  //   oldUrl: '/api/tenant/:tenantId',
  //   newApi: true
  // },
  // getSupportMspCustomersList: {
  //   method: 'post',
  //   url: '/mspecs/query?delegation=support',
  //   oldUrl: '/api/viewmodel/tenant/:tenantId/msp-ec?delegation=support',
  //   newApi: true
  // },
  getMspEcAdminList: {
    method: 'get',
    url: '/tenants/:mspEcTenantId/admins',
    oldUrl: '/mspCustomers/:mspEcTenantId/admins',
    newApi: true
  },
  getMspEcAccount: {
    method: 'get',
    url: '/tenants/:mspEcTenantId',
    oldUrl: '/mspCustomers/:mspEcTenantId',
    newApi: true
  },
  addMspEcAccount: {
    method: 'post',
    url: '/tenants',
    oldUrl: '/mspCustomers',
    newApi: true
  },
  updateMspEcAccount: {
    method: 'put',
    url: '/tenants/:mspEcTenantId',
    oldUrl: '/mspCustomers/:mspEcTenantId',
    newApi: true
  },
  // getMspEcDelegatedAdmins: {
  //   method: 'get',
  //   url: '/tenants/:mspEcTenantId/mspadmins',
  //   oldUrl: '/mspCustomers/:mspEcTenantId/mspadmins',
  //   newApi: true
  // },
  // updateMspEcDelegatedAdmins: {
  //   method: 'put',
  //   url: '/tenants/:mspEcTenantId/mspadmins',
  //   oldUrl: '/mspCustomers/:mspEcTenantId/mspadmins',
  //   newApi: true
  // },
  getMspEcSupport: {
    method: 'get',
    url: '/tenants/:mspEcTenantId/tenantDelegations',
    oldUrl: '/mspCustomers/:mspEcTenantId/delegations',
    newApi: true
  },
  enableMspEcSupport: {
    method: 'post',
    url: '/tenants/:mspEcTenantId/tenantDelegations',
    oldUrl: '/mspCustomers/:mspEcTenantId/delegations',
    newApi: true
  },
  disableMspEcSupport: {
    method: 'delete',
    url: '/tenants/:mspEcTenantId/tenantDelegations',
    oldUrl: '/mspCustomers/:mspEcTenantId/delegations',
    newApi: true
  },
  // assignMspEcToIntegrator: {
  //   method: 'PATCH',
  //   url: '/mspIntegrators/:mspIntegratorId',
  //   oldUrl: '/api/mspservice/tenant/assign/:mspIntegratorId',
  //   newApi: true
  // },
  assignMspEcToMultiIntegrators: {
    method: 'PATCH',
    url: '/mspCustomers/delegations',
    newApi: true
  },
  // getAssignedMspEcToIntegrator: {
  //   method: 'get',
  //   url: '/mspIntegrators/:mspIntegratorId?delegationType=:mspIntegratorType',
  //   oldUrl: '/api/mspservice/tenant/assign/:mspIntegratorId?delegationType=:mspIntegratorType',
  //   newApi: true
  // },
  // updateAssignedMspEcDelegatedAdmins: {
  //   method: 'put',
  //   url: '/api/mspservice/tenant/:mspEcTenantId/delegation/assignedmspadmins'
  // },
  // exportMspEcDeviceInventory: {
  //   method: 'post',
  //   url: '/msps/:tenantId/ecInventories/query/csvFiles',
  //   oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory/export',
  //   newApi: true
  // },
  // deactivateMspEcAccount: {
  //   // method: 'PATCH',
  //   // url: /mspCustomers/:mspEcTenantId
  //   method: 'post',
  //   url: '/api/mspservice/tenant/:mspEcTenantId/deactivation'
  // },
  // reactivateMspEcAccount: {
  //   // method: 'PATCH',
  //   // url: /mspCustomers/:mspEcTenantId
  //   method: 'post',
  //   url: '/api/mspservice/tenant/:mspEcTenantId/reactivation'
  // },

  // getMspBaseURL: {
  //   method: 'get',
  //   url: '/mspLabels/baseUrls',
  //   oldUrl: '/api/mspservice/baseurl',
  //   newApi: true
  // },

  getMspLabel: {
    method: 'get',
    url: '/brandings',
    oldUrl: '/msplabel',
    newApi: true
  },
  addMspLabel: {
    method: 'post',
    url: '/brandings',
    oldUrl: '/msplabel',
    newApi: true
  },
  updateMspLabel: {
    method: 'put',
    url: '/brandings',
    oldUrl: '/msplabel',
    newApi: true
  },
  acceptRejectInvitation: {
    method: 'put',
    url: '/tenants/delegations/:delegationId',
    oldUrl: '/api/tenant/:tenantId/delegation/:delegationId',
    newApi: true
  },
  getGenerateLicenseUsageRpt: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/:tenantId'
  },

  // getParentLogoUrl: {
  //   method: 'get',
  //   url: '/mspCustomers/:tenantId/logoUrls',
  //   oldUrl: '/api/mspservice/tenant/:tenantId/logourl',
  //   newApi: true
  // },
  // getBrandingData: {
  //   method: 'get',
  //   url: '/brandingsData',
  //   oldUrl: '/api/mspservice/tenant/:tenantId/brandingdata',
  //   newApi: true
  // },

  assignMultiMspEcDelegatedAdmins: {
    method: 'PATCH',
    url: '/tenants/mspAdmins/associations',
    oldUrl: '/mspCustomers/mspAdmins/associations',
    newApi: true
  },
  // // getMspAggregations: {
  // //   method: 'get',
  // //   url: '/tenants/notificationAggregations',
  // //   newApi: true
  // // },
  // // addMspAggregations: {
  // //   method: 'post',
  // //   url: '/tenants/notificationAggregations',
  // //   newApi: true
  // // },
  // // updateMspAggregations: {
  // //   method: 'put',
  // //   url: '/tenants/notificationAggregations',
  // //   newApi: true
  // // },
  // deleteMspAggregations: {
  //   method: 'delete',
  //   url: '/tenants/notificationAggregations',
  //   newApi: true
  // },
  // getMspEcAlarmList: {
  //   method: 'post',
  //   url: '/api/eventalarmapi/msp/:tenantId/alarm/alarmlist'
  // },
  // getRecommandFirmwareUpgrade: {
  //   method: 'get',
  //   url: '/apFirmwares?status=default',
  //   newApi: true
  // },
  mspEcFirmwareUpgradeSchedules: {
    method: 'post',
    url: '/tenants/firmwareUpgradeSchedules',
    oldUrl: '/mspCustomers/firmwareUpgradeSchedules',
    newApi: true
  },
  getAvailableMspRecCustomers: {
    method: 'get',
    url: '/mspCustomers/recs',
    newApi: true
  },
  addMspRecCustomer: {
    method: 'post',
    url: '/tenants',
    oldUrl: '/mspCustomers/mspRecs',
    newApi: true
  },
  patchCustomer: {
    method: 'PATCH',
    url: '/tenants/:tenantId',
    newApi: true
  },
  addBrandCustomers: {
    method: 'post',
    url: '/tenants',
    newApi: true
  }
}
