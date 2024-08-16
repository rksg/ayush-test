import { ApiInfo } from '@acx-ui/utils'

export const PortalRbacUrlsInfo: { [key: string]: ApiInfo } = {
  activatePortal: {
    method: 'put',
    url: '/wifiNetworks/:networkId/portalServiceProfiles/:serviceId',
    newApi: true
  }
}
