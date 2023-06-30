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
  }
}
