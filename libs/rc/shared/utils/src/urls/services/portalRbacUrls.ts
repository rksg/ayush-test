import { ApiInfo } from '@acx-ui/utils'

export const PortalRbacUrlsInfo: { [key: string]: ApiInfo } = {
  bindPortal: {
    method: 'post',
    url: '/wifiNetworks/:networkId/portalServiceProfiles/:serviceId',
    newApi: true
  },
  getEnhancedPortalProfileList: {
    method: 'post',
    url: '/portalServiceProfiles/query',
    newApi: true
  }
}
