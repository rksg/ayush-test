import { CommonUrlsInfo, ConfigTemplateType } from '@acx-ui/rc/utils'
import { ApiInfo }                            from '@acx-ui/utils'

// eslint-disable-next-line max-len
export type AllowedEnforcedConfigTemplateTypes = ConfigTemplateType.NETWORK | ConfigTemplateType.VENUE

// eslint-disable-next-line max-len
export const configTemplateInstanceEnforcedApiMap: Record<AllowedEnforcedConfigTemplateTypes, ApiInfo> = {
  [ConfigTemplateType.NETWORK]: CommonUrlsInfo.getWifiNetworksList,
  [ConfigTemplateType.VENUE]: CommonUrlsInfo.getVenuesList
}
