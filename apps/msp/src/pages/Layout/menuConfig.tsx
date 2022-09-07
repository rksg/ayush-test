import { useIntl } from 'react-intl'

import { LayoutProps } from '@acx-ui/components'
import { uniqueId } from 'lodash'

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
      disableIcon: UI.SpeedIndicatorIcon,
      enableIcon: UI.EnabledSpeedIndicatorIcon,
      routes: [
        {
          path: '/mspCustomers',
          name: $t({ defaultMessage: 'MSP Customers' })
        },
        {
          path: '/varCustomers',
          name: $t({ defaultMessage: 'VAR Customers' })
        }
      ]
    },
    {
      path: '/integrators',
      name: 'Integrators',
      tenantType: 'v',
      disableIcon: UI.LocationIcon,
      enableIcon: UI.EnabledLocationIcon
    },
    {
      path: '/deviceInventory',
      name: 'Device Inventory',
      tenantType: 'v',
      disableIcon: UI.ReportsIcon,
      enableIcon: UI.EnabledReportsIcon
    },
    {
      path: '/mspLicenses',
      name: 'MSP Licenses',
      tenantType: 'v',
      disableIcon: UI.CalendarIcon,
      enableIcon: UI.EnabledCalendarIcon
    },
    genPlaceholder(),
    {
      path: '/portalSetting',
      name: 'Settings',
      tenantType: 'v',
      disableIcon: UI.ConfigurationIcon,
      enableIcon: UI.EnabledConfigurationIcon
    }
  ]
  return config
}
