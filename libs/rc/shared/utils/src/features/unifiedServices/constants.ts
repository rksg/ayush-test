import { RadioCardCategory } from '@acx-ui/components'

import { ServiceType } from '../../constants'
import { PolicyType }  from '../../types'

export type UnifiedServiceType = ServiceType | PolicyType

export enum UnifiedServiceCategory {
  AUTHENTICATION_IDENTITY = 'Authentication & Identity Management',
  SECURITY_ACCESS_CONTROL = 'Security & Access Control',
  NETWORK_SERVICES = 'Network Configuration & Services',
  MONITORING_TROUBLESHOOTING = 'Monitoring & Troubleshooting',
  USER_EXPERIENCE_PORTALS = 'User Experience & Portals'
}

export enum UnifiedServiceStatus {
  ENABLED,
  DISABLED,
  PREVIEW_ONLY
}

export interface UnifiedServicesMetaDataType {
  type: UnifiedServiceType
  label: string
  description: string
  products: RadioCardCategory[]
  category: UnifiedServiceCategory
  status: UnifiedServiceStatus
  // TODO : Following properties are for new global search functionality
  // path: string
  // route: string
  // alias?: string[]
}
