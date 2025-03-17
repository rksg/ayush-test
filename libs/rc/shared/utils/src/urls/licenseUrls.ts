import { ApiInfo } from '@acx-ui/utils'

export const LicenseUrlsInfo: { [key: string]: ApiInfo } = {
  getEntitlementsBanners: {
    method: 'get',
    url: '/banners',
    oldUrl: '/api/tenant/:tenantId/entitlement/banner',
    newApi: true
  },
  getEntitlements: {
    method: 'get',
    url: '/entitlements',
    oldUrl: '/api/tenant/:tenantId/entitlement',
    newApi: true
  },
  getEntitlementsSummary: {
    method: 'get',
    url: '/entitlements/summaries',
    oldUrl: '/api/tenant/:tenantId/entitlement/summary',
    newApi: true
  },
  // RBAC APIs start from here
  getBanners: {
    method: 'post',
    url: '/entitlements/banners/query',
    newApi: true
  },
  getEntitlementSummary: {
    // method: 'get',
    method: 'post',
    url: '/entitlements/utilizations/query',
    oldUrl: '/entitlements/summaries',
    newApi: true
  },
  getEntitlementsList: {
    // method: 'get',
    method: 'post',
    url: '/entitlements/query',
    oldUrl: '/entitlements',
    newApi: true
  },
  // getEntitlementsActivations: {
  //   method: 'post',
  //   url: '/entitlements/orders/query',
  //   newApi: true
  // },
  // patchEntitlementsActivations: {
  //   method: 'PATCH',
  //   url: '/entitlements/orders/:orderId',
  //   newApi: true
  // },
  // refreshLicensesData: {
  //   method: 'get',
  //   url: '/entitlements/summaries?refresh=true',
  //   oldMethod: 'post',
  //   oldUrl: '/api/tenant/:tenantId/entitlement/internal-refresh',
  //   newApi: true
  // },
  // internalRefreshLicensesData: {
  //   method: 'get',
  //   url: '/entitlements/summaries?refresh=true',
  //   oldMethod: 'post',
  //   oldUrl: '/api/tenant/:tenantId/entitlement/internal-refresh',
  //   newApi: false
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
  getMspEntitlement: {
    // method: 'get',
    method: 'post',
    url: '/entitlements/query',
    oldUrl: '/mspEntitlements',
    opsApi: 'POST:/entitlements/query',
    newApi: true
  },
  getMspEntitlementSummary: {
    // method: 'get',
    method: 'post',
    url: '/entitlements/utilizations/query',
    oldUrl: '/mspEntitlements/summaries?refresh=false',
    newApi: true
  }
  // getMspAssignmentSummary: {
  //   method: 'get',
  //   url: '/assignments/summaries',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment/summary',
  //   newApi: true
  // },
  // getMspAssignmentHistory: {
  //   // method: 'get',
  //   method: 'post',
  //   // url: '/tenants/:tenantId/entitlements/assignments/query',
  //   url: '/tenants/self/entitlements/assignments/query',
  //   oldUrl: '/assignments',
  //   newApi: true
  // },
  // addMspAssignment: {
  //   method: 'post',
  //   url: '/tenants/self/entitlements/assignments',
  //   oldUrl: '/assignments',
  //   newApi: true
  // },
  // updateMspAssignment: {
  //   // method: 'PATCH',
  //   method: 'put',
  //   url: '/tenants/self/entitlements/assignments/:assignmentId',
  //   oldUrl: '/assignments',
  //   newApi: true
  // },
  // deleteMspAssignment: {
  //   method: 'delete',
  //   url: '/assignments',
  //   oldUrl: '/api/entitlement-assign/tenant/:tenantId/assignment',
  //   newApi: true
  // }
}
