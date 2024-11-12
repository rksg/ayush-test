import { ConfigTemplateType } from '@acx-ui/rc/utils'

import { OverrideComponentType, OverrideDisplayViewType }        from './types'
import { ConfigTemplateVenueOverride, VenueOverrideDisplayView } from './Venue'

export const overrideComponentMap: Partial<Record<ConfigTemplateType, OverrideComponentType>> = {
  [ConfigTemplateType.VENUE]: ConfigTemplateVenueOverride
}

// eslint-disable-next-line max-len
export const overrideDisplayViewMap: Partial<Record<ConfigTemplateType, OverrideDisplayViewType>> = {
  [ConfigTemplateType.VENUE]: VenueOverrideDisplayView
}
