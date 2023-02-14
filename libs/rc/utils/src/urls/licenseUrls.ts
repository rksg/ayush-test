import { ApiInfo } from '../apiService'

export const LicenseUrlsInfo: { [key: string]: ApiInfo } = {
  getEntitlementsBanners: {
    method: 'get',
    url: '/api/tenant/:tenantId/entitlement/banner'
  },
  getEntitlements: {
    method: 'get',
    url: '/api/tenant/:tenantId/entitlement'
  },
  getEntitlementsSummary: {
    method: 'get',
    url: '/api/tenant/:tenantId/entitlement/summary'
  }
}
