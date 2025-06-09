import { RadioCardCategory } from '@acx-ui/components'

import { ServiceType } from '../../constants'
import { PolicyType }  from '../../types'

export type UnifiedServiceType = ServiceType | PolicyType

export enum UnifiedServiceCategory {
  AUTHENTICATION_IDENTITY,
  SECURITY_ACCESS_CONTROL,
  NETWORK_SERVICES,
  MONITORING_TROUBLESHOOTING,
  USER_EXPERIENCE_PORTALS
}

export enum UnifiedServiceSourceType {
  SERVICE,
  POLICY
}

export interface UnifiedService<ContentType = string> {
  type: UnifiedServiceType
  sourceType: UnifiedServiceSourceType
  label: ContentType
  products: RadioCardCategory[]
  route: string
  category: UnifiedServiceCategory
  disabled?: boolean
  isBetaFeature?: boolean
  description?: ContentType
  readonly?: boolean
  searchKeywords?: ContentType[]
  breadcrumb?: { text: string, link?: string }[] // For search usage
}

export interface ExtendedUnifiedService extends UnifiedService {
  totalCount?: number
}
