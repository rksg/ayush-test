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

const MspSubscriptionOutlined =
  styled(MspSubscriptionOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const MspSubscriptionSolid = styled(MspSubscriptionSolidBase)`${LayoutUI.iconSolidOverride}`

export function useMenuConfig (tenantType: string) {
  const { $t } = useIntl()
  const isVar = tenantType === 'VAR'
  // const isMsp = tenantType === 'MSP'
  const isNonVarMSP = tenantType === 'MSP_NON_VAR'
  const isSupport = tenantType === 'SUPPORT'
  const isIntegrator = tenantType === 'MSP_INTEGRATOR' || tenantType === 'MSP_INSTALLER'

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
          name: $t({ defaultMessage: 'MSP Customers' }),
          disabled: isVar
        },
        {
          path: '/dashboard/varCustomers',
          name: isSupport ? $t({ defaultMessage: 'RUCKUS Customers' })
            : $t({ defaultMessage: 'VAR Customers' }),
          disabled: isNonVarMSP || isIntegrator
        }
      ]
    },
    {
      path: '/integrators',
      name: $t({ defaultMessage: 'Integrators' }),
      tenantType: 'v',
      inactiveIcon: IntegratorsOutlined,
      activeIcon: IntegratorsSolid,
      disabled: isVar || isIntegrator || isSupport
    },
    {
      path: '/deviceInventory',
      name: $t({ defaultMessage: 'Device Inventory' }),
      tenantType: 'v',
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid,
      disabled: isSupport
    },
    {
      path: '/mspLicenses',
      name: $t({ defaultMessage: 'Subscriptions' }),
      tenantType: 'v',
      inactiveIcon: MspSubscriptionOutlined,
      activeIcon: MspSubscriptionSolid,
      disabled: isIntegrator || isSupport
    },
    genPlaceholder(),
    {
      path: '/portalSetting',
      name: $t({ defaultMessage: 'Settings' }),
      tenantType: 'v',
      inactiveIcon: ConfigurationOutlined,
      activeIcon: ConfigurationSolid,
      disabled: isVar || isIntegrator || isSupport
    }
  ]
  // const config: LayoutProps['menuConfig'] = [
  //   {
  //     path: '/dashboard',
  //     name: $t({ defaultMessage: 'My Customers' }),
  //     tenantType: 'v',
  //     inactiveIcon: UsersThreeOutlined,
  //     activeIcon: UsersThreeSolid,
  //     routes: [
  //       {
  //         path: '/dashboard/mspCustomers',
  //         name: $t({ defaultMessage: 'MSP Customers' }),
  //         disabled: isVar
  //       },
  //       {
  //         path: '/dashboard/varCustomers',
  //         name: isSupport ? $t({ defaultMessage: 'RUCKUS Customers' })
  //           : $t({ defaultMessage: 'VAR Customers' }),
  //         disabled: isNonVarMSP || isIntegrator
  //       }
  //     ]
  //   }]
  // if (isMsp || isNonVarMSP) {
  //   config.push({
  //     path: '/integrators',
  //     name: $t({ defaultMessage: 'Integrators' }),
  //     tenantType: 'v',
  //     inactiveIcon: IntegratorsOutlined,
  //     activeIcon: IntegratorsSolid
  //   })
  // }
  // if (!isSupport) {
  //   config.push({
  //     path: '/deviceInventory',
  //     name: $t({ defaultMessage: 'Device Inventory' }),
  //     tenantType: 'v',
  //     inactiveIcon: DevicesOutlined,
  //     activeIcon: DevicesSolid
  //   })
  // }
  // if (isMsp || isVar || isNonVarMSP) {
  //   config.push({
  //     path: '/mspLicenses',
  //     name: $t({ defaultMessage: 'MSP Licenses' }),
  //     tenantType: 'v',
  //     inactiveIcon: MspSubscriptionOutlined,
  //     activeIcon: MspSubscriptionSolid
  //   })
  // }
  // if (isMsp || isNonVarMSP) {
  //   config.push(genPlaceholder())
  //   config.push({
  //     path: '/portalSetting',
  //     name: $t({ defaultMessage: 'Settings' }),
  //     tenantType: 'v',
  //     inactiveIcon: ConfigurationOutlined,
  //     activeIcon: ConfigurationSolid
  //   })
  // }

  return config
}
