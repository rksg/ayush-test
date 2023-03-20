import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { LayoutProps, LayoutUI, genPlaceholder } from '@acx-ui/components'
import {
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
  MspSubscriptionOutlined as MspSubscriptionOutlinedBase,
  MspSubscriptionSolid as MspSubscriptionSolidBase,
  IntegratorsOutlined,
  IntegratorsSolid,
  UsersThreeOutlined,
  UsersThreeSolid
} from '@acx-ui/icons'
import { TenantType }  from '@acx-ui/react-router-dom'
import { RolesEnum }   from '@acx-ui/types'
import { hasRoles }    from '@acx-ui/user'
import { AccountType } from '@acx-ui/utils'

const MspSubscriptionOutlined =
  styled(MspSubscriptionOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const MspSubscriptionSolid = styled(MspSubscriptionSolidBase)`${LayoutUI.iconSolidOverride}`

export function useMenuConfig (tenantType: string) {
  const { $t } = useIntl()

  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isVar = tenantType === AccountType.VAR
  const isNonVarMSP = tenantType === AccountType.MSP_NON_VAR
  const isSupport = tenantType === 'SUPPORT'
  const isIntegrator =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER

  const config: LayoutProps['menuConfig'] = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'My Customers' }),
      tenantType: 'v',
      inactiveIcon: UsersThreeOutlined,
      activeIcon: UsersThreeSolid,
      routes: [
        {
          path: '/dashboard/mspCustomers',
          name: $t({ defaultMessage: 'MSP Customers' })
        },
        ...((isNonVarMSP || isIntegrator) ? [] : [{
          path: '/dashboard/varCustomers',
          name: isSupport ? $t({ defaultMessage: 'RUCKUS Customers' })
            : $t({ defaultMessage: 'VAR Customers' })
        }])
      ]
    },
    ...((isVar || isIntegrator || isSupport) ? [] : [{
      path: '/integrators',
      name: $t({ defaultMessage: 'Tech Partners' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: IntegratorsOutlined,
      activeIcon: IntegratorsSolid
    }]),
    ...(isSupport ? [] : [{
      path: '/deviceInventory',
      name: $t({ defaultMessage: 'Device Inventory' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid
    }]),
    ...((isIntegrator || isSupport) ? [] : [{
      path: '/mspLicenses',
      name: $t({ defaultMessage: 'Subscriptions' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: MspSubscriptionOutlined,
      activeIcon: MspSubscriptionSolid
    }]),
    genPlaceholder(),
    ...((!isPrimeAdmin || isIntegrator || isSupport) ? [] : [{
      path: '/portalSetting',
      name: $t({ defaultMessage: 'Settings' }),
      tenantType: 'v' as TenantType,
      inactiveIcon: ConfigurationOutlined,
      activeIcon: ConfigurationSolid
    }])
  ]

  return config
}
