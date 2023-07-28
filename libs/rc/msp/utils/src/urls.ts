import { ApiInfo } from '@acx-ui/utils'

export const MspUrlsInfo: { [key: string]: ApiInfo } = {
  // TODO Need Owner to check it
  getMspCustomersList: {
    method: 'post',
    url: '/mspecs/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/mspeclist',
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
  // addMspAssignment: {
  //   method: 'post',
  //   url: '/assignments',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
  //   newApi: true
  // },
  // revokeMspAssignment: {
  //   method: 'post',
  //   url: '/assignments/{mspAssignmentId}',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment/{mspAssignmentId}/revoke',
  //   newApi: false
  // },
  // mspAssignmentBulkOperation: {
  //   method: 'post',
  //   url: '/assignments',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment/bulkOperation',
  //   newApi: false
  // },
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
    url: '/mspCustomers/:tenantId',
    oldUrl: '/api/mspservice/tenant/:tenantId',
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
    method: 'post',
    // method: 'PATCH',
    // url: '/mspCustomers/:mspEcTenantId/delegations'
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
    url: '/msps/:tenantId/ecInventories/query/csvFiles',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ec-inventory/export',
    newApi: true
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
  assignMultiMspEcDelegatedAdmins: {
    method: 'PATCH',
    url: '/mspCustomers/mspAdmins/associations',
    newApi: true
  }
}
