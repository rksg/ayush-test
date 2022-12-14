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

export function useMenuConfig () {
  const { $t } = useIntl()
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
        {
          path: '/dashboard/varCustomers',
          name: $t({ defaultMessage: 'VAR Customers' })
        }
      ]
    },
    {
      path: '/integrators',
      name: $t({ defaultMessage: 'Integrators' }),
      tenantType: 'v',
      inactiveIcon: IntegratorsOutlined,
      activeIcon: IntegratorsSolid
    },
    {
      path: '/deviceInventory',
      name: $t({ defaultMessage: 'Device Inventory' }),
      tenantType: 'v',
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid
    },
    {
      path: '/mspLicenses',
      name: $t({ defaultMessage: 'MSP Licenses' }),
      tenantType: 'v',
      inactiveIcon: MspSubscriptionOutlined,
      activeIcon: MspSubscriptionSolid
    },
    genPlaceholder(),
    {
      path: '/portalSetting',
      name: $t({ defaultMessage: 'Settings' }),
      tenantType: 'v',
      inactiveIcon: ConfigurationOutlined,
      activeIcon: ConfigurationSolid
    }
  ]
  return config
}
