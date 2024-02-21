import { ServiceType }                    from '../constants'
import { PolicyType, ConfigTemplateType } from '../types'

export const configTemplatePolicyTypeMap: Partial<Record<ConfigTemplateType, PolicyType>> = {
  [ConfigTemplateType.RADIUS]: PolicyType.AAA
}

export const configTemplateServiceTypeMap: Partial<Record<ConfigTemplateType, ServiceType>> = {
  [ConfigTemplateType.DPSK]: ServiceType.DPSK
}
