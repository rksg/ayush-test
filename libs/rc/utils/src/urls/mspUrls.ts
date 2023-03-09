import { ApiInfo } from '../apiService'

export const MspUrlsInfo: { [key: string]: ApiInfo } = {
  // TODO Need Owner to check it
  getMspCustomersList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/mspeclist'
  },
  getMspDeviceInventory: {
    method: 'post',
    url: '/msps/:tenantId/ecInventories/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory',
    newApi: false
  },
  getIntegratorDeviceInventory: {
    method: 'post',
    url: '/msps/:mspTenantId/ecInventories/query',
    oldUrl: '/api/viewmodel/tenant/:mspTenantId/ec-inventory',
    newApi: false
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
    newApi: false
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
    method: 'post',
    url: '/mspEntitlements/summaries?referesh=true',
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
  revokeMspAssignment: {
    method: 'post',
    url: '/assignments/{mspAssignmentId}',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment/{mspAssignmentId}/revoke',
    newApi: false
  },
  mspAssignmentBulkOperation: {
    method: 'post',
    url: '/assignments',
    oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment/bulkOperation',
    newApi: false
  },
  resendEcInvitation: {
    method: 'post',
    url: '/mspCustomers/:mspEcTenantId/invitations',
    oldUrl: '/api/mspservice/tenant/:mspEcTenantId/emailinvitation',
    newApi: true
  },
  getMspProfile: {
    method: 'get',
    url: '/mspLabels',
    oldUrl: '/api/mspservice/tenant/:tenantId/msplabel',
    newApi: true
  },
  getMspEcProfile: {
    method: 'get',
    url: '/api/mspservice/tenant/:tenantId'
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
    url: '/api/tenant/:tenantId'
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
    url: '/api/mspservice/tenant/:mspEcTenantId/delegatedmspadmins'
  },
  updateMspEcDelegatedAdmins: {
    method: 'put',
    url: '/api/mspservice/tenant/:mspEcTenantId/delegatedmspadmins'
  },
  getMspEcSupport: {
    method: 'get',
    url: '/api/mspservice/tenant/:mspEcTenantId/delegation/support'
  },
  enableMspEcSupport: {
    method: 'post',
    url: '/api/mspservice/tenant/:mspEcTenantId/delegation/support'
  },
  disableMspEcSupport: {
    method: 'delete',
    url: '/api/mspservice/tenant/:mspEcTenantId/delegation/support'
  },
  assignMspEcToIntegrator: {
    method: 'post',
    url: '/api/mspservice/tenant/assign/:mspIntegratorId'
  },
  getAssignedMspEcToIntegrator: {
    method: 'get',
    url: '/api/mspservice/tenant/assign/:mspIntegratorId?delegationType=:mspIntegratorType'
  },
  updateAssignedMspEcDelegatedAdmins: {
    method: 'put',
    url: '/api/mspservice/tenant/:mspEcTenantId/delegation/assignedmspadmins'
  },
  exportMspEcDeviceInventory: {
    method: 'post',
    url: '/msps/:mspTenantId/ecInventories/query/csvFiles',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory/export',
    newApi: true
  },
  deactivateMspEcAccount: {
    method: 'post',
    url: '/api/mspservice/tenant/:mspEcTenantId/deactivation'
  },
  reactivateMspEcAccount: {
    method: 'post',
    url: '/api/mspservice/tenant/:mspEcTenantId/reactivation'
  },
  getMspBaseURL: {
    method: 'get',
    url: '/api/mspservice/baseurl'
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
    url: '/api/tenant/:tenantId/delegation/:delegationId'
  },
  getGenerateLicenseUsageRpt: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/:tenantId'
  }
}
