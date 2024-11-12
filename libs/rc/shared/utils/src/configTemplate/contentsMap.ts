import { ServiceType }                    from '../constants'
import { ConfigTemplateType, PolicyType } from '../types'

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
