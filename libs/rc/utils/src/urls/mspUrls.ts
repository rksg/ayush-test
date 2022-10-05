import { ApiInfo } from '../apiService'

export const MspUrlsInfo: { [key: string]: ApiInfo } = {
  getMspCustomersList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/msp-ec'
  },
  getMspDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/ec-inventory'
  },
  getIntegratorDeviceInventory: {
    method: 'post',
    url: '/api/viewmodel/tenant/:mspTenantId/ec-inventory'
  },
  getVarDelegations: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/delegations'
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
  }
}
