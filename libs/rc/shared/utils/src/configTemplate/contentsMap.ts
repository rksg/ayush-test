import { ServiceType }                    from '../constants'
import { PolicyType, ConfigTemplateType } from '../types'

export const configTemplatePolicyTypeMap: Partial<Record<ConfigTemplateType, PolicyType>> = {
  [ConfigTemplateType.RADIUS]: PolicyType.AAA,
  [ConfigTemplateType.ACCESS_CONTROL]: PolicyType.ACCESS_CONTROL
}

export const configTemplateServiceTypeMap: Partial<Record<ConfigTemplateType, ServiceType>> = {
  [ConfigTemplateType.DPSK]: ServiceType.DPSK,
  [ConfigTemplateType.DHCP]: ServiceType.DHCP
}
