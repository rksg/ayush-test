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
    opsApi: 'DELETE:/tenants/{id}',
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
  refreshMspEntitlement: {
    method: 'PATCH',
    url: '/entitlements',
    oldUrl: '/mspEntitlements/summaries?refresh=true',
    newApi: true
  },
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
  getMspEcAssignmentHistory: {
    method: 'post',
    url: '/tenants/:tenantId/entitlements/assignments/query',
    oldUrl: '/assignments',
    newApi: true
  },
  getMspAssignmentHistory: {
    method: 'post',
    url: '/tenants/self/entitlements/assignments/query',
    oldUrl: '/assignments',
    newApi: true
  },
  addMspAssignment: {
    method: 'post',
    url: '/tenants/self/entitlements/assignments',
    oldUrl: '/assignments',
    opsApi: 'POST:/tenants/self/entitlements/assignments',
    newApi: true
  },
  updateMspAssignment: {
    method: 'PATCH',
    url: '/tenants/self/entitlements/assignments/:assignmentId',
    oldUrl: '/assignments',
    opsApi: 'PATCH:/tenants/self/entitlements/assignments/{id}',
    newApi: true
  },
  deleteMspAssignment: {
    method: 'delete',
    url: '/tenants/self/entitlements/assignments/:assignmentId',
    oldUrl: '/assignments',
    opsApi: 'DELETE:/tenants/self/entitlements/assignments/{id}',
    newApi: true
  },
  resendEcInvitation: {
    // method: 'post',
    method: 'get',
    url: '/tenants/:mspEcTenantId/invitations',
    oldUrl: '/mspCustomers/:mspEcTenantId/invitations',
    opsApi: 'GET:/tenants/{id}/invitations',
    newApi: true
  },
  // getMspCustomersListDropdown: {
  //   method: 'post',
  //   url: '/api/viewmodel/tenant/:mspTenantId/mspeclist'
  // },
  getMspProfile: {
    method: 'get',
    url: '/brandings',
    oldUrl: '/mspLabels',
    newApi: true
  },
  // getMspEcProfile: {
  //   method: 'get',
  //   url: '/tenants/:tenantId',
  //   oldUrl: '/mspCustomers/:tenantId',
  //   newApi: true
  // },
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
    opsApi: 'POST:/tenants',
    newApi: true
  },
  updateMspEcAccount: {
    method: 'put',
    url: '/tenants/:mspEcTenantId',
    oldUrl: '/mspCustomers/:mspEcTenantId',
    opsApi: 'PUT:/tenants/{id}',
    newApi: true
  },
  getMspEcDelegatedAdmins: {
    method: 'get',
    url: '/tenants/:mspEcTenantId/adminDelegations',
    oldUrl: '/mspCustomers/:mspEcTenantId/mspadmins',
    newApi: true
  },
  updateMspEcDelegatedAdmins: {
    method: 'put',
    url: '/tenants/:mspEcTenantId/adminDelegations',
    oldUrl: '/mspCustomers/:mspEcTenantId/mspadmins',
    opsApi: 'PUT:/tenants/{id}/adminDelegations',
    newApi: true
  },
  getMspEcSupport: {
    method: 'get',
    url: '/tenantActivations/supportStatus/:mspEcTenantId',
    oldUrl: '/mspCustomers/:mspEcTenantId/delegations',
    newApi: true
  },
  enableMspEcSupport: {
    method: 'put',
    url: '/tenantActivations/supportStatus/:mspEcTenantId',
    oldUrl: '/mspCustomers/:mspEcTenantId/delegations',
    opsApi: 'PUT:/tenantActivations/supportStatus/{id}',
    newApi: true
  },
  disableMspEcSupport: {
    method: 'delete',
    url: '/tenantActivations/supportStatus/:mspEcTenantId',
    oldUrl: '/mspCustomers/:mspEcTenantId/delegations',
    opsApi: 'DELETE:/tenantActivations/supportStatus/{id}',
    newApi: true
  },
  assignMspEcToIntegrator: {
    method: 'put',
    url: '/tenants/:mspIntegratorId/tenantDelegations',
    oldUrl: '/mspIntegrators/:mspIntegratorId',
    opsApi: 'PUT:/tenants/{id}/tenantDelegations',
    newApi: true
  },
  assignMspEcToMultiIntegrators: {
    method: 'PATCH',
    url: '/tenantDelegations',
    oldUrl: '/mspCustomers/delegations',
    opsApi: 'PATCH:/tenantDelegations',
    newApi: true
  },
  getAssignedMspEcToIntegrator: {
    method: 'get',
    url: '/tenants/:mspIntegratorId/tenantDelegations?delegationType=:mspIntegratorType',
    oldUrl: '/mspIntegrators/:mspIntegratorId?delegationType=:mspIntegratorType',
    newApi: true
  },
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
  getMspBaseURL: {
    method: 'get',
    url: '/brandings/suffix',
    oldUrl: '/mspLabels/baseUrls',
    newApi: true
  },
  getMspLabel: {
    method: 'get',
    url: '/brandings',
    oldUrl: '/mspLabels',
    newApi: true
  },
  addMspLabel: {
    method: 'post',
    url: '/brandings',
    oldUrl: '/mspLabels',
    opsApi: 'POST:/brandings',
    newApi: true
  },
  updateMspLabel: {
    method: 'put',
    url: '/brandings',
    oldUrl: '/mspLabels',
    opsApi: 'PUT:/brandings',
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
  getParentLogoUrl: {
    method: 'get',
    url: '/tenants/:tenantId',
    oldUrl: '/mspCustomers/:tenantId/logoUrls',
    newApi: true
  },
  getBrandingData: {
    method: 'get',
    url: '/brandings',
    oldUrl: '/brandingsData',
    newApi: true
  },
  assignMultiMspEcDelegatedAdmins: {
    method: 'PATCH',
    // url: '/tenants/:tenantId/adminDelegations',
    url: '/mspCustomers/mspAdmins/associations',
    newApi: true
  },
  getMspAggregations: {
    method: 'get',
    url: '/tenants/settings/query',
    oldUrl: '/tenants/notificationAggregations',
    newApi: true
  },
  // // addMspAggregations: {
  // //   method: 'post',
  // //   url: '/tenants/notificationAggregations',
  // //   newApi: true
  // // },
  updateMspAggregations: {
    method: 'PATCH',
    url: '/tenants/settings',
    oldUrl: '/tenants/notificationAggregations',
    newApi: true
  },
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
  getFirmwareUpgradeByApModel: {
    method: 'get',
    url: '/apModelFirmwares?status=greenfieldFirmware',
    newApi: true
  },
  mspEcFirmwareUpgradeSchedules: {
    method: 'post',
    url: '/tenants/firmwareUpgradeSchedules',
    oldUrl: '/mspCustomers/firmwareUpgradeSchedules',
    opsApi: 'POST:/tenants/firmwareUpgradeSchedules',
    newApi: true
  },
  getAvailableMspRecCustomers: {
    method: 'get',
    url: '/brandAccounts',
    oldUrl: '/mspCustomers/recs',
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
    opsApi: 'POST:/tenants',
    newApi: true
  },
  getUploadURL: {
    method: 'post',
    url: '/tenants/uploadurls',
    oldUrl: '/files/uploadurls',
    newApi: true
  },
  getEntitlementsCompliances: {
    method: 'post',
    url: '/entitlements/compliances/query',
    opsApi: 'POST:/entitlements/compliances/query',
    newApi: true
  },
  getSolutionTokenSettings: {
    method: 'get',
    url: '/entitlements/settings',
    newApi: true
  },
  updateSolutionTokenSettings: {
    method: 'PATCH',
    url: '/entitlements/settings',
    newApi: true
  },
  getEntitlementsAttentionNotes: {
    method: 'post',
    url: '/entitlements/attentionNotes/query',
    newApi: true
  },
  getCalculatedLicences: {
    method: 'post',
    url: '/entitlements/availabilityReports/query',
    newApi: true
  },
  updateMspEcDelegations: {
    method: 'put',
    url: '/tenants/:mspEcTenantId/adminDelegations',
    opsApi: 'PUT:/tenants/{id}/adminDelegations',
    newApi: true
  },
  updateMspMultipleEcDelegations: {
    method: 'PATCH',
    url: '/adminDelegations',
    opsApi: 'PATCH:/adminDelegations',
    newApi: true
  },
  getLicenseMileageReports: {
    method: 'post',
    url: '/entitlements/mileageReports/query',
    newApi: true
  }

}
