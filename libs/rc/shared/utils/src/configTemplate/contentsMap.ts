import { ConfigTemplateType, PolicyType } from '../types'

export const configTemplatePolicyTypeMap: Partial<Record<ConfigTemplateType, PolicyType>> = {
  [ConfigTemplateType.RADIUS]: PolicyType.AAA,
  [ConfigTemplateType.ACCESS_CONTROL_SET]: PolicyType.ACCESS_CONTROL,
  [ConfigTemplateType.LAYER_2_POLICY]: PolicyType.LAYER_2_POLICY,
  [ConfigTemplateType.LAYER_3_POLICY]: PolicyType.LAYER_3_POLICY,
  [ConfigTemplateType.DEVICE_POLICY]: PolicyType.DEVICE_POLICY,
  [ConfigTemplateType.APPLICATION_POLICY]: PolicyType.APPLICATION_POLICY
}
