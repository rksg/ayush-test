import { uniqueId } from 'lodash'
import { useIntl }  from 'react-intl'

import { LayoutProps } from '@acx-ui/components'

import * as UI from './styledComponents'
const genPlaceholder = () => ({
  path: `/${uniqueId()}/placeholder`,
  name: ' '
})

export function useMenuConfig () {
  const { $t } = useIntl()
  const config: LayoutProps['menuConfig'] = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'My Customers' }),
      tenantType: 'v',
      disableIcon: UI.CustomerIcon,
      enableIcon: UI.EnabledCustomerIcon,
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
      disableIcon: UI.IntegratorIcon,
      enableIcon: UI.EnabledIntegratorIcon
    },
    {
      path: '/deviceInventory',
      name: $t({ defaultMessage: 'Device Inventory' }),
      tenantType: 'v',
      disableIcon: UI.InventoryIcon,
      enableIcon: UI.EnableInventoryIcon
    },
    {
      path: '/mspLicenses',
      name: $t({ defaultMessage: 'MSP Licenses' }),
      tenantType: 'v',
      disableIcon: UI.MspLicenseIcon,
      enableIcon: UI.EnableMspLicenseIcon
    },
    genPlaceholder(),
    {
      path: '/portalSetting',
      name: $t({ defaultMessage: 'Settings' }),
      tenantType: 'v',
      disableIcon: UI.ConfigurationIcon,
      enableIcon: UI.EnabledConfigurationIcon
    }
  ]
  return config
}
