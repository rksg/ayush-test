import { ApiInfo } from '../../apiService'

export const PortalUrlsInfo: { [key: string]: ApiInfo } = {
  deletePortals: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles'
  },
  deletePortal: {
    method: 'delete',
    url: '/api/portalServiceProfiles/:serviceId'
  },
  updatePortal: {
    method: 'put',
    url: '/api/portalServiceProfiles/:serviceId'
  },
  getPortal: {
    method: 'get',
    url: '/api/portalServiceProfiles/:serviceId'
  },
  savePortal: {
    method: 'post',
    url: '/api/portalServiceProfiles'
  },
  getPortalNetworkInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/portal-service-profile/instances/:serviceId'
  },
  getPortalProfileDetail: {
    method: 'get',
    url: '/api/portalServiceProfiles/:serviceId'
  },
  getPortalProfileList: {
    method: 'get',
    url: '/api/portalServiceProfiles?pageSize=:pageSize&page=:page&sort=:sort'
  },
  getPortalLang: {
    method: 'get',
    url: '/g/ui/tenant/:tenantId/locales/:messageName'
  }
}
