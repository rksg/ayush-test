import { uniqueId } from 'lodash'

import * as UI from './styledComponents'

const genPlaceholder = () => ({
  path: `/${uniqueId()}/placeholder`,
  name: ' '
})

const config = [
  {
    path: '/monitoring',
    name: 'Monitoring',
    disableIcon: UI.SpeedIndicatorIcon,
    enableIcon: UI.EnabledSpeedIndicatorIcon
  },
  {
    path: '/reports',
    name: 'Reports',
    disableIcon: UI.ReportsIcon,
    enableIcon: UI.EnabledReportsIcon
  },
  {
    path: '/events',
    name: 'Events',
    disableIcon: UI.CalendarIcon,
    enableIcon: UI.EnabledCalendarIcon
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
    path: '/users',
    name: 'Users',
    disableIcon: UI.AccountIcon,
    enableIcon: UI.EnabledAccountIcon
  },
  genPlaceholder(),
  {
    path: '/melissa',
    name: 'Melissa AI',
    disableIcon: UI.MelissaIcon,
    enableIcon: UI.EnabledMelissaIcon
  },
  {
    path: '/administration',
    name: 'Administration',
    disableIcon: UI.ConfigurationIcon,
    enableIcon: UI.EnabledConfigurationIcon
  }
]

export default config
