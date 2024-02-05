import { ApiInfo } from '@acx-ui/utils'

export const PortalUrlsInfo: { [key: string]: ApiInfo } = {
  deletePortal: {
    method: 'delete',
    url: '/portalServiceProfiles/:serviceId',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    newApi: true
  },
  updatePortal: {
    method: 'put',
    url: '/portalServiceProfiles/:serviceId',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    newApi: true
  },
  getPortal: {
    method: 'get',
    url: '/portalServiceProfiles/:serviceId',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    newApi: true
  },
  savePortal: {
    method: 'post',
    url: '/portalServiceProfiles',
    oldUrl: '/api/portalServiceProfiles',
    newApi: true
  },
  getPortalProfileDetail: {
    method: 'get',
    url: '/portalServiceProfiles/:serviceId',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    newApi: true
  },
  getPortalProfileList: {
    method: 'get',
    // eslint-disable-next-line max-len
    url: '/portalServiceProfiles?pageSize=:pageSize&page=:page&sort=:sort',
    // eslint-disable-next-line max-len
    oldUrl: '/api/portalServiceProfiles?pageSize=:pageSize&page=:page&sort=:sort',
    newApi: true
  },
  getPortalLang: {
    // [New API] no mapping found
    method: 'get',
    url: '/g/ui/tenant/:tenantId/locales/:messageName'
  },
  getEnhancedPortalProfileList: {
    method: 'post',
    url: '/portalServiceProfiles/query',
    newApi: true
  }
}
