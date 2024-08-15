import { ApiInfo } from '@acx-ui/utils'

export const PortalRbacUrlsInfo: { [key: string]: ApiInfo } = {
  bindPortal: {
    method: 'put',
    url: '/wifiNetworks/:networkId/portalServiceProfiles/:serviceId',
    newApi: true
  }
}
