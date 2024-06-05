import { ApiInfo } from '@acx-ui/utils'

export const PortalUrlsInfo: { [key: string]: ApiInfo } = {
  deletePortal: {
    method: 'delete',
    url: '/portalServiceProfiles/:serviceId',
    newApi: true
  },
  updatePortal: {
    method: 'put',
    url: '/portalServiceProfiles/:serviceId',
    newApi: true
  },
  getPortal: {
    method: 'get',
    url: '/portalServiceProfiles/:serviceId',
    newApi: true
  },
  createPortal: {
    method: 'post',
    url: '/portalServiceProfiles',
    newApi: true
  },
  getPortalLang: {
    // [New API] no mapping found
    method: 'get',
    url: '/g/ui/tenant/:tenantId/locales/:messageName'
  },
  uploadPhoto: {
    method: 'put',
    url: '/portalServiceProfiles/:serviceId/photos',
    newApi: true
  },
  uploadLogo: {
    method: 'put',
    url: '/portalServiceProfiles/:serviceId/logos',
    newApi: true
  },
  uploadBgImage: {
    method: 'put',
    url: '/portalServiceProfiles/:serviceId/backgroundImages',
    newApi: true
  },
  uploadPoweredImg: {
    method: 'put',
    url: '/portalServiceProfiles/:serviceId/poweredImages',
    newApi: true
  },
  deletePhoto: {
    method: 'delete',
    url: '/portalServiceProfiles/:serviceId/photos',
    newApi: true
  },
  deleteLogo: {
    method: 'delete',
    url: '/portalServiceProfiles/:serviceId/logos',
    newApi: true
  },
  deleteBgImage: {
    method: 'delete',
    url: '/portalServiceProfiles/:serviceId/backgroundImages',
    newApi: true
  },
  deletePoweredImg: {
    method: 'delete',
    url: '/portalServiceProfiles/:serviceId/poweredImages',
    newApi: true
  },
  getEnhancedPortalProfileList: {
    method: 'post',
    url: '/portalServiceProfiles/query',
    newApi: true
  }
}
