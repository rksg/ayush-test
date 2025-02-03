import { ApiInfo } from '@acx-ui/utils'

import { ConfigTemplateType } from '../../types'

export type AllowedCloneTemplateTypes = ConfigTemplateType.NETWORK | ConfigTemplateType.VENUE

export const allowedCloneTemplateTypesSet = new Set<ConfigTemplateType>([
  ConfigTemplateType.NETWORK,
  ConfigTemplateType.VENUE
])

export const ConfigTemplateCloneUrlsInfo: Record<AllowedCloneTemplateTypes, ApiInfo> = {
  [ConfigTemplateType.NETWORK]: {
    method: 'post',
    url: '/templates/wifiNetworks/cloneSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/wifiNetworks/cloneSettings'
  },
  [ConfigTemplateType.VENUE]: {
    method: 'post',
    url: '/templates/venues/cloneSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/venues/cloneSettings'
  }
}
