import { ConfigTemplateType, DpskDetailsTabKey } from '@acx-ui/rc/utils'

export const configTemplateDefaultDetailsTab: Partial<Record<ConfigTemplateType, string>> = {
  [ConfigTemplateType.NETWORK]: 'venues',
  [ConfigTemplateType.VENUE]: 'networks',
  [ConfigTemplateType.DPSK]: DpskDetailsTabKey.OVERVIEW
}
