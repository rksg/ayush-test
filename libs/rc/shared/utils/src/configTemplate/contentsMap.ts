import { ApiInfo } from '@acx-ui/utils'

import { ServiceType }                                                                         from '../constants'
import { PolicyOperation, ServiceOperation }                                                   from '../features'
import { ConfigTemplateType, PolicyType }                                                      from '../types'
import { ApGroupConfigTemplateUrlsInfo, ConfigTemplateUrlsInfo, SwitchConfigTemplateUrlsInfo } from '../urls'

export const configTemplatePolicyTypeMap: Partial<Record<ConfigTemplateType, PolicyType>> = {
  [ConfigTemplateType.RADIUS]: PolicyType.AAA,
  [ConfigTemplateType.ACCESS_CONTROL]: PolicyType.ACCESS_CONTROL,
  [ConfigTemplateType.VLAN_POOL]: PolicyType.VLAN_POOL,
  [ConfigTemplateType.CLIENT_ISOLATION]: PolicyType.CLIENT_ISOLATION,
  [ConfigTemplateType.LAYER_2_POLICY]: PolicyType.LAYER_2_POLICY,
  [ConfigTemplateType.LAYER_3_POLICY]: PolicyType.LAYER_3_POLICY,
  [ConfigTemplateType.DEVICE_POLICY]: PolicyType.DEVICE_POLICY,
  [ConfigTemplateType.APPLICATION_POLICY]: PolicyType.APPLICATION_POLICY,
  [ConfigTemplateType.SYSLOG]: PolicyType.SYSLOG,
  [ConfigTemplateType.ROGUE_AP_DETECTION]: PolicyType.ROGUE_AP_DETECTION
}

export const configTemplateServiceTypeMap: Partial<Record<ConfigTemplateType, ServiceType>> = {
  [ConfigTemplateType.DPSK]: ServiceType.DPSK,
  [ConfigTemplateType.DHCP]: ServiceType.DHCP,
  [ConfigTemplateType.PORTAL]: ServiceType.PORTAL,
  [ConfigTemplateType.WIFI_CALLING]: ServiceType.WIFI_CALLING
}

export type ConfigTemplateOperation = 'Create' | 'Edit' | 'Delete'

export const configTemplatePolicyOperationMap: Record<ConfigTemplateOperation, PolicyOperation> = {
  Create: PolicyOperation.CREATE,
  Edit: PolicyOperation.EDIT,
  Delete: PolicyOperation.DELETE
}

// eslint-disable-next-line max-len
export const configTemplateServiceOperationMap: Record<ConfigTemplateOperation, ServiceOperation> = {
  Create: ServiceOperation.CREATE,
  Edit: ServiceOperation.EDIT,
  Delete: ServiceOperation.DELETE
}

export const configTemplateNetworkOperationMap: Record<ConfigTemplateOperation, ApiInfo> = {
  Create: ConfigTemplateUrlsInfo.addNetworkTemplateRbac,
  Edit: ConfigTemplateUrlsInfo.updateNetworkTemplateRbac,
  Delete: ConfigTemplateUrlsInfo.deleteNetworkTemplateRbac
}

export const configTemplateVenueOperationMap: Record<ConfigTemplateOperation, ApiInfo> = {
  Create: ConfigTemplateUrlsInfo.addVenueTemplate,
  Edit: ConfigTemplateUrlsInfo.updateVenueTemplate,
  Delete: ConfigTemplateUrlsInfo.deleteVenueTemplate
}

export const configTemplateSwitchProfileOperationMap: Record<ConfigTemplateOperation, ApiInfo> = {
  Create: SwitchConfigTemplateUrlsInfo.addSwitchConfigProfileRbac,
  Edit: SwitchConfigTemplateUrlsInfo.updateSwitchConfigProfileRbac,
  Delete: SwitchConfigTemplateUrlsInfo.deleteSwitchConfigProfileRbac
}

export const configTemplateApGroupOperationMap: Record<ConfigTemplateOperation, ApiInfo> = {
  Create: ApGroupConfigTemplateUrlsInfo.addApGroup,
  Edit: ApGroupConfigTemplateUrlsInfo.updateApGroup,
  Delete: ApGroupConfigTemplateUrlsInfo.deleteApGroup
}
