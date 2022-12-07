import { defineMessage, MessageDescriptor } from 'react-intl'

import { ExpirationMode } from '@acx-ui/rc/utils'

export const ExpirationModeLabel: Record<ExpirationMode, MessageDescriptor> = {
  [ExpirationMode.NEVER]: defineMessage({ defaultMessage: 'Never expires' }),
  [ExpirationMode.BY_DATE]: defineMessage({ defaultMessage: 'By date' }),
  [ExpirationMode.AFTER_TIME]: defineMessage({ defaultMessage: 'After...' })
}
