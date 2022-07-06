import { uniqueId } from 'lodash'

import * as UI from './styledComponents'

const genPlaceholder = () => ({
  path: `/${uniqueId()}/placeholder`,
  name: ' '
})

const config = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    disableIcon: UI.SpeedIndicatorIcon,
    enableIcon: UI.EnabledSpeedIndicatorIcon
  },
  {
    path: '/analytics',
    name: 'AI Analytics',
    disableIcon: UI.AIAnalyticsIcon,
    enableIcon: UI.AIAnalyticsIcon,
    routes: [
      {
        path: '/analytics/incidents',
        name: 'Incidents'
      },
      {
        path: '/analytics/recommendations',
        name: 'Recommendations'
      },
      {
        path: '/analytics/health',
        name: 'Health'
      },
      {
        path: '/analytics/configChange',
        name: 'Config Change'
      },
      {
        path: '/analytics/occupancy',
        name: 'Occupancy'
      }
    ]
  },
  {
    path: '/timeline',
    name: 'Timeline',
    disableIcon: UI.CalendarIcon,
    enableIcon: UI.EnabledCalendarIcon
  },
  {
    path: '/reports',
    name: 'Reports',
    disableIcon: UI.ReportsIcon,
    enableIcon: UI.EnabledReportsIcon
  },
  genPlaceholder(),
  {
    path: '/venues',
    name: 'Venues',
    disableIcon: UI.LocationIcon,
    enableIcon: UI.EnabledLocationIcon
  },
  {
    path: '/devices',
    name: 'Devices',
    disableIcon: UI.DevicesIcon,
    enableIcon: UI.EnabledDevicesIcon
  },
  {
    path: '/networks',
    name: 'Networks',
    disableIcon: UI.NetworksIcon,
    enableIcon: UI.EnabledNetworksIcon
  },
  {
    path: '/services',
    name: 'Services',
    disableIcon: UI.ServicesIcon,
    enableIcon: UI.EnabledServicesIcon
  },
  {
    path: '/policies',
    name: 'Policies',
    disableIcon: UI.ServicesIcon,
    enableIcon: UI.EnabledServicesIcon
  },
  {
    path: '/users',
    name: 'Users',
    disableIcon: UI.AccountIcon,
    enableIcon: UI.EnabledAccountIcon
  },
  genPlaceholder(),
  {
    path: '/administration',
    name: 'Administration',
    disableIcon: UI.ConfigurationIcon,
    enableIcon: UI.EnabledConfigurationIcon
  }
]

export default config
