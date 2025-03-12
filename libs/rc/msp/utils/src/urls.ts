import { ApiInfo } from '@acx-ui/utils'

export const MspUrlsInfo: { [key: string]: ApiInfo } = {
  // TODO Need Owner to check it
  getMspCustomersList: {
    method: 'post',
    url: '/mspecs/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/mspeclist',
    newApi: true,
    opsApi: 'POST:/mspecs/query'
  },
  getMspECList: {
    method: 'post',
    url: '/ecs/query?delegations=true',
    oldUrl: '/mspecs/query',
    newApi: true
  },
  getIntegratorCustomersList: {
    method: 'post',
    url: '/techpartners/mspecs/query',
    oldUrl: '/techpartners/mspecs/query',
    newApi: true
  },
  getMspDeviceInventory: {
    method: 'post',
    url: '/msps/:tenantId/ecInventories/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory',
    newApi: true
  },
  getIntegratorDeviceInventory: {
    method: 'post',
    url: '/msps/:mspTenantId/ecInventories/query',
    oldUrl: '/api/viewmodel/tenant/:mspTenantId/ec-inventory',
    newApi: true
  },
  getVarDelegations: {
    method: 'post',
    url: '/delegations',
    oldUrl: '/api/viewmodel/tenant/:tenantId/delegations',
    newApi: true
  },
  deleteMspEcAccount: {
    method: 'delete',
    url: '/mspCustomers/:mspEcTenantId',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId',
    newApi: true
  },
  getMspAdminList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/admin'
  },
  getAdministrators: {
    method: 'get',
    url: '/admins',
    oldUrl: '/api/tenant/:tenantId/admin',
    newApi: true
  },
  getMspEntitlementBanner: {
    method: 'get',
    url: '/mspBanners',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlementBanner',
    newApi: true
  },
  refreshMspEntitlement: {
    method: 'get',
    oldMethod: 'post',
    url: '/mspEntitlements/summaries?refresh=true',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlement/refresh',
    newApi: true
  },
  getMspEntitlement: {
    method: 'get',
    url: '/mspEntitlements',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlement',
    newApi: true
  },
  getMspEntitlementSummary: {
    method: 'get',
    url: '/mspEntitlements/summaries?refresh=false',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/mspEntitlementSummary',
    newApi: true
  },
  getMspAssignmentSummary: {
    method: 'get',
    url: '/assignments/summaries',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment/summary',
    newApi: true
  },
  getMspAssignmentHistory: {
    method: 'get',
    url: '/assignments',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
    newApi: true
  },
  addMspAssignment: {
    method: 'post',
    url: '/assignments',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
    newApi: true
  },
  updateMspAssignment: {
    method: 'PATCH',
    url: '/assignments',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
    newApi: true
  },
  deleteMspAssignment: {
    method: 'delete',
    url: '/assignments',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
    newApi: true
  },
  resendEcInvitation: {
    method: 'post',
    url: '/mspCustomers/:mspEcTenantId/invitations',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/emailinvitation',
    newApi: true
  },
  getMspCustomersListDropdown: {
    method: 'post',
    url: '/api/viewmodel/tenant/:mspTenantId/mspeclist'
  },
  getMspProfile: {
    method: 'get',
    url: '/mspLabels',
    oldUrl: '/api/mspservice/tenant/:tenantId/msplabel',
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
    url: '/mspCustomers/:mspEcTenantId/admins/:mspEcAdminId',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/admin/:mspEcAdminId',
    newApi: true
  },
  updateMspEcAdmin: {
    method: 'put',
    url: '/mspCustomers/:mspEcTenantId/admins/:mspEcAdminId',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/admin/:mspEcAdminId',
    newApi: true
  },
  getTenantDetail: {
    method: 'get',
    url: '/tenants/self',
    oldUrl: '/api/tenant/:tenantId',
    newApi: true
  },
  getSupportMspCustomersList: {
    method: 'post',
    url: '/mspecs/query?delegation=support',
    oldUrl: '/api/viewmodel/tenant/:tenantId/msp-ec?delegation=support',
    newApi: true
  },
  getMspEcAdminList: {
    method: 'get',
    url: '/mspCustomers/:mspEcTenantId/admins',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/admins',
    newApi: true
  },
  getMspEcAccount: {
    method: 'get',
    url: '/mspCustomers/:mspEcTenantId',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId',
    newApi: true
  },
  addMspEcAccount: {
    method: 'post',
    url: '/mspCustomers',
    oldUrl: '/api/mspservice/tenant/:tenantId/mspecaccounts',
    newApi: true
  },
  updateMspEcAccount: {
    method: 'put',
    url: '/mspCustomers/:mspEcTenantId',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId',
    newApi: true
  },
  getMspEcDelegatedAdmins: {
    method: 'get',
    url: '/mspCustomers/:mspEcTenantId/mspadmins',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/delegatedmspadmins',
    newApi: true
  },
  updateMspEcDelegatedAdmins: {
    method: 'put',
    url: '/mspCustomers/:mspEcTenantId/mspadmins',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/delegatedmspadmins',
    newApi: true
  },
  getMspEcSupport: {
    method: 'get',
    url: '/mspCustomers/:mspEcTenantId/delegations',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/delegation/support',
    newApi: true
  },
  enableMspEcSupport: {
    method: 'post',
    url: '/mspCustomers/:mspEcTenantId/delegations',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/delegation/support',
    newApi: true
  },
  disableMspEcSupport: {
    method: 'delete',
    url: '/mspCustomers/:mspEcTenantId/delegations',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/delegation/support',
    newApi: true
  },
  assignMspEcToIntegrator: {
    method: 'PATCH',
    url: '/mspIntegrators/:mspIntegratorId',
    oldUrl: '/api/mspservice/tenant/assign/:mspIntegratorId',
    newApi: true
  },
  assignMspEcToMultiIntegrators: {
    method: 'PATCH',
    url: '/mspCustomers/delegations',
    newApi: true
  },
  getAssignedMspEcToIntegrator: {
    method: 'get',
    url: '/mspIntegrators/:mspIntegratorId?delegationType=:mspIntegratorType',
    oldUrl: '/api/mspservice/tenant/assign/:mspIntegratorId?delegationType=:mspIntegratorType',
    newApi: true
  },
  updateAssignedMspEcDelegatedAdmins: {
    method: 'put',
    url: '/api/mspservice/tenant/:mspEcTenantId/delegation/assignedmspadmins'
  },
  exportMspEcDeviceInventory: {
    method: 'post',
    url: '/msps/:tenantId/ecInventories/query/csvFiles',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory/export',
    newApi: true,
    opsApi: 'POST:/msps/:tenantId/ecInventories/query/csvFiles'
  },
  deactivateMspEcAccount: {
    // method: 'PATCH',
    // url: /mspCustomers/:mspEcTenantId
    method: 'post',
    url: '/api/mspservice/tenant/:mspEcTenantId/deactivation'
  },
  reactivateMspEcAccount: {
    // method: 'PATCH',
    // url: /mspCustomers/:mspEcTenantId
    method: 'post',
    url: '/api/mspservice/tenant/:mspEcTenantId/reactivation'
  },
  getMspBaseURL: {
    method: 'get',
    url: '/mspLabels/baseUrls',
    oldUrl: '/api/mspservice/baseurl',
    newApi: true
  },
  getMspLabel: {
    method: 'get',
    url: '/mspLabels',
    oldUrl: '/api/mspservice/tenant/:tenantId/msplabel',
    newApi: true
  },
  addMspLabel: {
    method: 'post',
    url: '/mspLabels',
    oldUrl: '/api/mspservice/tenant/:tenantId/msplabel',
    newApi: true
  },
  updateMspLabel: {
    method: 'put',
    url: '/mspLabels',
    oldUrl: '/api/mspservice/tenant/:tenantId/msplabel',
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
    // url: '/licenseUsageReports'
    url: '/api/entitlement-assign/tenant/:tenantId'
  },
  getParentLogoUrl: {
    method: 'get',
    url: '/mspCustomers/:tenantId/logoUrls',
    oldUrl: '/api/mspservice/tenant/:tenantId/logourl',
    newApi: true
  },
  getBrandingData: {
    method: 'get',
    url: '/brandingsData',
    oldUrl: '/api/mspservice/tenant/:tenantId/brandingdata',
    newApi: true
  },
  assignMultiMspEcDelegatedAdmins: {
    method: 'PATCH',
    url: '/mspCustomers/mspAdmins/associations',
    newApi: true
  },
  getMspAggregations: {
    method: 'get',
    url: '/tenants/notificationAggregations',
    newApi: true
  },
  addMspAggregations: {
    method: 'post',
    url: '/tenants/notificationAggregations',
    newApi: true
  },
  updateMspAggregations: {
    method: 'put',
    url: '/tenants/notificationAggregations',
    newApi: true
  },
  deleteMspAggregations: {
    method: 'delete',
    url: '/tenants/notificationAggregations',
    newApi: true
  },
  getMspEcAlarmList: {
    method: 'post',
    url: '/api/eventalarmapi/msp/:tenantId/alarm/alarmlist'
  },
  getRecommandFirmwareUpgrade: {
    method: 'get',
    url: '/apFirmwares?status=default',
    newApi: true
  },
  mspEcFirmwareUpgradeSchedules: {
    method: 'post',
    url: '/mspCustomers/firmwareUpgradeSchedules',
    newApi: true
  },
  getAvailableMspRecCustomers: {
    method: 'get',
    url: '/mspCustomers/recs',
    newApi: true
  },
  addMspRecCustomer: {
    method: 'post',
    url: '/mspCustomers/mspRecs',
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
  },
  getUploadURL: {
    method: 'post',
    url: '/files/uploadurls',
    oldUrl: '/api/file/tenant/:tenantId/upload-url',
    newApi: true
  },
  getCustomerNamesFilter: {
    method: 'post',
    url: '/msps/:tenantId/ecInventories/customers/filters/query',
    newApi: true
  },
  getVenuesFilter: {
    method: 'post',
    url: '/msps/:tenantId/ecInventories/venues/filters/query',
    newApi: true
  },
  getdeviceModelsFilter: {
    method: 'post',
    url: '/msps/:tenantId/ecInventories/deviceModels/filters/query',
    newApi: true
  }
}
