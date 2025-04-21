/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { UnifiedServiceCategory } from './constants'


export const unifiedServiceCategoryLabel: Record<UnifiedServiceCategory, MessageDescriptor> = {
  [UnifiedServiceCategory.AUTHENTICATION_IDENTITY]: defineMessage({ defaultMessage: 'Authentication & Identity Management' }),
  [UnifiedServiceCategory.SECURITY_ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Security & Access Control' }),
  [UnifiedServiceCategory.NETWORK_SERVICES]: defineMessage({ defaultMessage: 'Network Configuration & Services' }),
  [UnifiedServiceCategory.MONITORING_TROUBLESHOOTING]: defineMessage({ defaultMessage: 'Monitoring & Troubleshooting' }),
  [UnifiedServiceCategory.USER_EXPERIENCE_PORTALS]: defineMessage({ defaultMessage: 'User Experience & Portals' })
}
