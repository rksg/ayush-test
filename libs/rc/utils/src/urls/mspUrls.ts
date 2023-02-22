import { ApiInfo } from '../apiService'

export const MspUrlsInfo: { [key: string]: ApiInfo } = {
  getMspCustomersList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/mspeclist'
  },
  getMspDeviceInventory: {
    method: 'post',
    url: '/msps/:mspTenantId/ecInventories/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory',
    newApi: false //Need Owner to check it
  },
  getIntegratorDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/:mspTenantId/ec-inventory'
  },
  getVarDelegations: {
    method: 'post',
    url: '/delegations',
    oldUrl: '/api/viewmodel/tenant/:tenantId/delegations',
    newApi: true
  },
  deleteMspEcAccount: {
    method: 'delete',
    url: '/api/mspservice/tenant/:mspEcTenantId'
  },
  getAdministrators: {
    method: 'get',
    url: '/api/tenant/:tenantId/admin'
  },
  getMspAdminList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/admin'
  },
  getMspEntitlementBanner: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/:tenantId/mspEntitlementBanner'
  },
  refreshMspEntitlement: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/:tenantId/mspEntitlement/refresh'
  },
  getMspEntitlement: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/:tenantId/mspEntitlement'
  },
  getMspEntitlementSummary: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/:tenantId/mspEntitlementSummary'
  },
  getMspAssignmentSummary: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/:tenantId/assignment/summary'
  },
  getMspAssignmentHistory: {
    method: 'get',
    url: '/api/entitlement-assign/tenant/:tenantId/assignment'
  },
  addMspAssignment: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/:tenantId/assignment'
  },
  revokeMspAssignment: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/:tenantId/assignment/{mspAssignmentId}/revoke'
  },
  mspAssignmentBulkOperation: {
    method: 'post',
    url: '/api/entitlement-assign/tenant/:tenantId/assignment/bulkOperation'
  },
  resendEcInvitation: {
    method: 'post',
    url: '/mspCustomers/:customerId/invitations',
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
    url: '/api/mspservice/tenant/:tenantId'
  },
  getMspEcAdmin: {
    method: 'get',
    url: '/api/mspservice/tenant/:mspEcTenantId/admin/:mspEcAdminId'
  },
  updateMspEcAdmin: {
    method: 'put',
    url: '/api/mspservice/tenant/:mspEcTenantId/admin/:mspEcAdminId'
  },
  getTenantDetail: {
    method: 'get',
    url: '/api/tenant/:tenantId'
  },
  getSupportMspCustomersList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/msp-ec?delegation=support'
  },
  getMspEcAdminList: {
    method: 'get',
    url: '/api/mspservice/tenant/:mspEcTenantId/admins'
  },
  getMspEcAccount: {
    method: 'get',
    url: '/api/mspservice/tenant/:mspEcTenantId'
  },
  addMspEcAccount: {
    method: 'post',
    url: '/mspCustomers',
    oldUrl: '/api/mspservice/tenant/:tenantId/mspecaccounts',
    newApi: true
  },
  updateMspEcAccount: {
    method: 'put',
    url: '/api/mspservice/tenant/:mspEcTenantId'
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
  }
}
