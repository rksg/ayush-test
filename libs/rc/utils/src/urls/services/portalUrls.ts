import { ApiInfo } from '../../apiService'

export const PortalUrlsInfo: { [key: string]: ApiInfo } = {
  deletePortal: {
    method: 'delete',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    url: '/portalServiceProfiles/:serviceId',
    newApi: true
  },
  updatePortal: {
    method: 'put',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    url: '/portalServiceProfiles/:serviceId',
    newApi: true
  },
  getPortal: {
    method: 'get',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    url: '/portalServiceProfiles/:serviceId',
    newApi: true
  },
  savePortal: {
    method: 'post',
    oldUrl: '/api/portalServiceProfiles',
    url: '/portalServiceProfiles',
    newApi: true
  },
  getPortalNetworkInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/portal-service-profile/instances/:serviceId'
  },
  getPortalProfileDetail: {
    method: 'get',
    oldUrl: '/api/portalServiceProfiles/:serviceId',
    url: '/portalServiceProfiles/:serviceId',
    newApi: true
  },
  getPortalProfileList: {
    method: 'get',
    oldUrl: '/api/portalServiceProfiles?pageSize=:pageSize&page=:page&sort=:sort',
    url: '/portalServiceProfiles?pageSize=:pageSize&page=:page&sort=:sort',
    newApi: true
  },
  getPortalLang: {
    method: 'get',
    url: '/g/ui/tenant/:tenantId/locales/:messageName'
  }
}
