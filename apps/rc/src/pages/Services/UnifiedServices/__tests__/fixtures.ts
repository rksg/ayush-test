import { RadioCardCategory }                                                                         from '@acx-ui/components'
import { PolicyType, ServiceType, UnifiedService, UnifiedServiceCategory, UnifiedServiceSourceType } from '@acx-ui/rc/utils'

export const mockedAvailableUnifiedServicesList: Array<UnifiedService> = [
  {
    type: PolicyType.AAA,
    sourceType: UnifiedServiceSourceType.POLICY,
    label: 'AAA',
    description: 'AAA Description',
    route: '/policies/aaa',
    products: [RadioCardCategory.WIFI],
    category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY
  },
  {
    type: PolicyType.ACCESS_CONTROL,
    sourceType: UnifiedServiceSourceType.POLICY,
    label: 'Access Control',
    description: 'Access Control Description',
    products: [RadioCardCategory.WIFI],
    category: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
    route: '/policies/accessControl'
  },
  {
    type: ServiceType.DHCP,
    label: 'DHCP',
    description: 'DHCP Description',
    route: '/services/dhcp',
    sourceType: UnifiedServiceSourceType.SERVICE,
    products: [RadioCardCategory.WIFI],
    category: UnifiedServiceCategory.NETWORK_SERVICES
  },
  {
    type: ServiceType.DPSK,
    sourceType: UnifiedServiceSourceType.SERVICE,
    label: 'DPSK',
    description: 'DPSK Description',
    route: '/services/dpsk',
    products: [RadioCardCategory.WIFI],
    category: UnifiedServiceCategory.AUTHENTICATION_IDENTITY
  }
]
