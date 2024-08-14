import { ApiInfo } from '@acx-ui/utils'

export const ServicesConfigTemplateRbacUrlsInfo: { [key: string]: ApiInfo } = {
  bindPortal: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/portalServiceProfiles/:serviceId',
    newApi: true
  }
}
