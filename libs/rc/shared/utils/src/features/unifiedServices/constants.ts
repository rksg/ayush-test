import { TotalCount } from './../../../../components/src/MapWidget/VenuesMap/styledComponents';
import { RadioCardCategory } from '@acx-ui/components'

import { ServiceType } from '../../constants'
import { PolicyType }  from '../../types'
import { RequestPayload, UseQuery, UseQueryOptions } from '@acx-ui/types';

export type UnifiedServiceType = ServiceType | PolicyType

export enum UnifiedServiceCategory {
  AUTHENTICATION_IDENTITY = 'Authentication & Identity Management',
  SECURITY_ACCESS_CONTROL = 'Security & Access Control',
  NETWORK_SERVICES = 'Network Configuration & Services',
  MONITORING_TROUBLESHOOTING = 'Monitoring & Troubleshooting',
  USER_EXPERIENCE_PORTALS = 'User Experience & Portals'
}

export enum UnifiedServiceSourceType {
  SERVICE,
  POLICY
}

export interface UnifiedService {
  type: UnifiedServiceType
  sourceType: UnifiedServiceSourceType
  label: string
  products: RadioCardCategory[]
  route: string
  category?: UnifiedServiceCategory
  disabled?: boolean
  isBetaFeature?: boolean
  description?: string
  readonly?: boolean
  aliases?: string[] // For search usage
  breadcrumb?: { text: string, link?: string }[]
}

export interface ExtendedUnifiedService extends UnifiedService {
  totalCount?: number
}
