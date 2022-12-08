import { ApiInfo } from '../../apiService'

export const PortalUrlsInfo: { [key: string]: ApiInfo } = {
  getPortals: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles'
  },
  deletePortals: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles'
  },
  deletePortal: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles/:portalServiceProfileId'
  },
  updatePortal: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles/:portalServiceProfileId'
  },
  getPortal: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles/:portalServiceProfileId'
  },
  savePortal: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/portal/portalServiceProfiles'
  },
  getPortalNetworkInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/portal-service-profile/instances/:serviceId'
  },
  getPortalProfileDetail: {
    method: 'get',
    url: '/api/tenant/:tenantId/portal-service-profile/:serviceId'
  },
  getPortalProfileList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/portalServiceProfiles'
  }
}
