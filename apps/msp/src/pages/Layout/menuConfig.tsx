import { useIntl } from 'react-intl'

import { LayoutProps } from '@acx-ui/components'
import {
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
  MspSubscriptionOutlined,
  MspSubscriptionSolid,
  IntegratorsOutlined,
  IntegratorsSolid,
  UsersThreeOutlined,
  UsersThreeSolid
} from '@acx-ui/icons'
import { TenantType }  from '@acx-ui/react-router-dom'
import { RolesEnum }   from '@acx-ui/types'
import { hasRoles }    from '@acx-ui/user'
import { AccountType } from '@acx-ui/utils'

export function useMenuConfig (tenantType: string, hasLicense: boolean, isDogfood?: boolean) {
  const { $t } = useIntl()

  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isVar = tenantType === AccountType.VAR
  const isNonVarMSP = tenantType === AccountType.MSP_NON_VAR
  const isSupport = tenantType === 'SUPPORT'
  const isIntegrator =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER

  const config: LayoutProps['menuConfig'] = [
    {
      label: $t({ defaultMessage: 'My Customers' }),
      inactiveIcon: UsersThreeOutlined,
      activeIcon: UsersThreeSolid,
      children: [
        ...(isVar || isDogfood ? [] : [{
          uri: '/dashboard/mspCustomers',
          tenantType: 'v' as TenantType,
          label: $t({ defaultMessage: 'MSP Customers' })
        }]),
        ...((isNonVarMSP || isIntegrator) ? [] : [{
          uri: '/dashboard/varCustomers',
          tenantType: 'v' as TenantType,
          label: isSupport
            ? $t({ defaultMessage: 'RUCKUS Customers' })
            : $t({ defaultMessage: 'VAR Customers' })
        }])
      ]
    },
    ...((isVar || isIntegrator || isSupport) ? [] : [{
      uri: '/integrators',
      label: $t({ defaultMessage: 'Tech Partners' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: IntegratorsOutlined,
      activeIcon: IntegratorsSolid
    }]),
    ...(isSupport ? [] : [{
      uri: '/deviceInventory',
      label: $t({ defaultMessage: 'Device Inventory' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid
    }]),
    ...((isIntegrator || isSupport)? [] : [{
      uri: '/mspLicenses',
      label: $t({ defaultMessage: 'Subscriptions' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: MspSubscriptionOutlined,
      activeIcon: MspSubscriptionSolid
    }]),
    ...((!isPrimeAdmin || isIntegrator || isSupport || !hasLicense)
      ? [{ label: '' }]
      : [{
        uri: '/portalSetting',
        label: $t({ defaultMessage: 'Settings' }),
        tenantType: 'v' as TenantType,
        inactiveIcon: ConfigurationOutlined,
        activeIcon: ConfigurationSolid
      }])
  ]
  return config
}
