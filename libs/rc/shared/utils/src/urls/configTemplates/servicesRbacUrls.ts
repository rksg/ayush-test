import { ApiInfo } from '@acx-ui/utils'

export const ServicesConfigTemplateRbacUrlsInfo: { [key: string]: ApiInfo } = {
  activatePortal: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/portalServiceProfiles/:serviceId',
    newApi: true
  }
}
