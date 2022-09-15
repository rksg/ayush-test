import { uniqueId } from 'lodash'
import { useIntl }  from 'react-intl'

import * as UI from './styledComponents'

const genPlaceholder = () => ({
  path: `/${uniqueId()}/placeholder`,
  name: ' '
})

export function useMenuConfig () {
  const { $t } = useIntl()
  const config = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'Dashboard' }),
      disableIcon: UI.SpeedIndicatorIcon,
      enableIcon: UI.EnabledSpeedIndicatorIcon
    },
    {
      path: '/analytics',
      name: $t({ defaultMessage: 'AI Analytics' }),
      disableIcon: UI.AIAnalyticsIcon,
      enableIcon: UI.AIAnalyticsIcon,
      routes: [
        {
          path: '/analytics/incidents',
          name: $t({ defaultMessage: 'Incidents' })
        },
        // TODO: add back when needed, comment for now
        // {
        //   path: '/analytics/recommendations',
        //   name: $t({ defaultMessage: 'Recommendations' })
        // },
        {
          path: '/analytics/health',
          name: $t({ defaultMessage: 'Health' })
        }
        // TODO: add back when needed, comment for now
        // {
        //   path: '/analytics/configChange',
        //   name: $t({ defaultMessage: 'Config Change' })
        // }
      ]
    },
    {
      path: '/timeline',
      name: $t({ defaultMessage: 'Timeline' }),
      disableIcon: UI.CalendarIcon,
      enableIcon: UI.EnabledCalendarIcon
    },
    {
      path: '/reports',
      name: $t({ defaultMessage: 'Reports' }),
      disableIcon: UI.ReportsIcon,
      enableIcon: UI.EnabledReportsIcon
    },
    genPlaceholder(),
    {
      path: '/venues',
      name: $t({ defaultMessage: 'Venues' }),
      disableIcon: UI.LocationIcon,
      enableIcon: UI.EnabledLocationIcon
    },
    {
      path: '/devices',
      name: $t({ defaultMessage: 'Devices' }),
      disableIcon: UI.DevicesIcon,
      enableIcon: UI.EnabledDevicesIcon
    },
    {
      path: '/networks',
      name: $t({ defaultMessage: 'Networks' }),
      disableIcon: UI.NetworksIcon,
      enableIcon: UI.EnabledNetworksIcon
    },
    {
      path: '/services',
      name: $t({ defaultMessage: 'Services' }),
      disableIcon: UI.ServicesIcon,
      enableIcon: UI.EnabledServicesIcon
    },
    {
      path: '/policies',
      name: $t({ defaultMessage: 'Policies' }),
      disableIcon: UI.ServicesIcon,
      enableIcon: UI.EnabledServicesIcon
    },
    {
      path: '/users',
      name: $t({ defaultMessage: 'Users' }),
      disableIcon: UI.AccountIcon,
      enableIcon: UI.EnabledAccountIcon
    },
    genPlaceholder(),
    {
      path: '/administration',
      name: $t({ defaultMessage: 'Administration' }),
      disableIcon: UI.ConfigurationIcon,
      enableIcon: UI.EnabledConfigurationIcon
    }
  ]
  return config
}
