import { ApiInfo } from '../../apiService'

export const PortalUrlsInfo: { [key: string]: ApiInfo } = {
  getPortals: {
    method: 'get',
    url: '/portalServiceProfiles/:serviceId'
  },
  deletePortals: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles'
  },
  deletePortal: {
    method: 'delete',
    url: '/portalServiceProfiles/:serviceId'
  },
  updatePortal: {
    method: 'put',
    url: '/portalServiceProfiles/:serviceId'
  },
  getPortal: {
    method: 'get',
    url: '/portalServiceProfiles/:serviceId'
  },
  savePortal: {
    method: 'post',
    url: '/portalServiceProfiles'
  },
  getPortalNetworkInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/portal-service-profile/instances/:serviceId'
  },
  getPortalProfileDetail: {
    method: 'get',
    url: '/portalServiceProfiles/:serviceId'
  },
  getPortalProfileList: {
    method: 'get',
    url: '/portalServiceProfiles'
  },
  getPortalLang: {
    method: 'get',
    url: '/g/ui/tenant/:tenantId/locales/:messageName'
  }
}
