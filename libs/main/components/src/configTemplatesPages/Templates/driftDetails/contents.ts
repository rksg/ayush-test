import { defineMessage, MessageDescriptor } from 'react-intl'

import { ConfigTemplateDriftType } from '@acx-ui/rc/utils'

export const configTemplateDriftTypeLabelMap: Record<ConfigTemplateDriftType, MessageDescriptor> = {
  [ConfigTemplateDriftType.DRIFT_DETECTED]: defineMessage({ defaultMessage: 'Drift Detected' }),
  [ConfigTemplateDriftType.IN_SYNC]: defineMessage({ defaultMessage: 'In Sync' })
}
