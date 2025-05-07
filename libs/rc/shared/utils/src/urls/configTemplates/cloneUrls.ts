import { ApiInfo } from '@acx-ui/utils'

import { AllowedCloneTemplateTypes, ConfigTemplateType } from '../../types'

export const ConfigTemplateCloneUrlsInfo: Record<AllowedCloneTemplateTypes, ApiInfo> = {
  [ConfigTemplateType.NETWORK]: {
    method: 'post',
    url: '/templates/wifiNetworks/:templateId/cloneSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/wifiNetworks/{id}/cloneSettings'
  },
  [ConfigTemplateType.VENUE]: {
    method: 'post',
    url: '/templates/venues/:templateId/cloneSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/venues/{id}/cloneSettings'
  },
  [ConfigTemplateType.DPSK]: {
    method: 'post',
    url: '/templates/dpskServices/:templateId/cloneSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/dpskServices/{id}/cloneSettings'
  },
  [ConfigTemplateType.WIFI_CALLING]: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles/:templateId/cloneSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/wifiCallingServiceProfiles/{id}/cloneSettings'
  }
}
