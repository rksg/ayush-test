import styled from 'styled-components/macro'

import {
  AIOutlined as AIOutlinedBase,
  AISolid as AISolidBase,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  NetworksOutlined,
  NetworksSolid,
  ServicesOutlined,
  ServicesSolid as ServicesSolidBase,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'

import { LayoutProps, MenuItem } from '..'
import { LayoutUI }              from '../styledComponents'

const AIOutlined = styled(AIOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const AISolid = styled(AISolidBase)`${LayoutUI.iconOutlinedOverride}`
const ServicesSolid = styled(ServicesSolidBase)`${LayoutUI.iconSolidOverride}`

const config: LayoutProps['menuConfig'] = [
  {
    key: '/dashboard',
    uri: '/dashboard',
    label: 'Dashboard',
    inactiveIcon: SpeedIndicatorOutlined,
    activeIcon: SpeedIndicatorSolid,
    isActivePattern: ['/dashboard']
  },
  {
    key: '/venues',
    uri: '/venues',
    label: 'Venues',
    inactiveIcon: LocationOutlined,
    activeIcon: LocationSolid,
    isActivePattern: ['/venues']
  },
  {
    key: '/clients',
    label: 'Clients',
    inactiveIcon: AccountCircleOutlined,
    activeIcon: AccountCircleSolid,
    isActivePattern: [
      '/users/wifi/clients',
      '/users/wifi/guests',
      '/reports/clients',
      '/users/switch/clients'
    ],
    children: [
      {
        type: 'group',
        label: 'Wireless',
        children: [
          { uri: '/users/wifi/clients', label: 'Wireless Clients List' } ,
          { uri: '/users/wifi/guests', label: 'Guest Pass Credentials' },
          { uri: '/reports/clients', label: 'Wireless Clients Report' }
        ]
      },
      {
        type: 'group',
        label: 'Wired',
        children: [
          { uri: '/users/switch/clients', label: 'Wired Clients List' }
        ]
      }
    ] as MenuItem[]
  },
  {
    key: '/wifi',
    label: 'Wi-Fi',
    inactiveIcon: DevicesOutlined,
    activeIcon: DevicesSolid,
    isActivePattern: [
      '/devices/wifi',
      '/reports/aps',
      '/reports/airtime',
      '/networks/wireless',
      '/reports/wlans',
      '/reports/applications',
      '/reports/wireless'
    ],
    children: [
      {
        type: 'group',
        label: 'Access Points',
        children: [
          { uri: '/devices/wifi', label: 'Access Point List' } ,
          { uri: '/reports/aps', label: 'AP Report' },
          { uri: '/reports/airtime', label: 'Airtime Utilization Report' }
        ]
      },
      {
        type: 'group',
        label: 'Wi-Fi Networks',
        children: [
          { uri: '/networks/wireless', label: 'Wi-Fi Networks List' },
          { uri: '/reports/wlans', label: 'WLANs Report' },
          { uri: '/reports/applications', label: 'Applications Report' },
          { uri: '/reports/wireless', label: 'Wireless Report' }
        ]
      },
      {
        type: 'group',
        label: 'Assurance',
        children: [
          { uri: '/analytics/incidents', label: 'Incidents' },
          { uri: '/analytics/health', label: 'Health' },
          { uri: '/serviceValidation/networkHealth', label: 'Network Health' }
        ]
      }
    ] as MenuItem[]
  },
  {
    key: '/wired',
    label: 'Wired',
    inactiveIcon: NetworksOutlined,
    activeIcon: NetworksSolid,
    isActivePattern: [
      '/devices/switch',
      '/reports/wired',
      '/networks/wired/profiles',
      '/networks/wired/onDemandCli'
    ],
    children: [
      {
        type: 'group',
        label: 'Switches',
        children: [
          { uri: '/devices/switch', label: 'Switch List' } ,
          { uri: '/reports/wired', label: 'Wired Report' }
        ]
      },
      {
        type: 'group',
        label: 'Wired Network Profiles',
        children: [
          { uri: '/networks/wired/profiles', label: 'Configuration Profiles' },
          { uri: '/networks/wired/onDemandCli', label: 'On-Demand CLI Configuration' }
        ]
      }
    ] as MenuItem[]
  },
  {
    key: '/networkControl',
    label: 'Network Control',
    inactiveIcon: ServicesOutlined,
    activeIcon: ServicesSolid,
    isActivePattern: [
      '/services',
      '/policies'
    ],
    children: [
      { uri: '/services/list', label: 'My Services' },
      { uri: '/services/catalog', label: 'Service Catalog' },
      { uri: '/policies', label: 'Policies & Profiles' }
    ] as MenuItem[]
  },
  {
    key: '/analytics',
    label: 'Analytics & Reports',
    inactiveIcon: AIOutlined,
    activeIcon: AISolid,
    isActivePattern: [
      '/analytics',
      '/serviceValidation',
      '/dataStudio',
      '/reports/overview'
    ],
    children: [
      {
        type: 'group',
        label: 'Analytics',
        children: [
          { uri: '/analytics/incidents', label: 'Incidents' },
          { uri: '/analytics/health', label: 'Health' },
          { uri: '/serviceValidation/networkHealth', label: 'Netowrk Health' }
        ]
      },
      {
        type: 'group',
        label: 'Data Studio BI',
        children: [
          { uri: '/dataStudio', label: 'Home' }
        ]
      },
      {
        type: 'group',
        label: 'Reports',
        children: [
          { uri: '/reports/overview', label: 'Reports List' }
        ]
      }
    ] as MenuItem[]
  },
  {
    key: '/administration',
    label: 'Administration',
    inactiveIcon: AdminOutlined,
    activeIcon: AdminSolid,
    isActivePattern: [
      '/timeline',
      '/administration'
    ],
    children: [
      {
        type: 'group',
        label: 'Timeline',
        children: [
          { uri: '/timeline/activities', label: 'Activities' },
          { uri: '/timeline/events', label: 'Events' },
          { uri: '/timeline/adminlog', label: 'Administrative Logs' }
        ]
      },
      {
        type: 'group',
        label: 'Account Management',
        children: [
          { uri: '/administration/accountSettings', label: 'Settings' },
          { uri: '/administration/administrators', label: 'Administrators' },
          { uri: '/administration/notifications', label: 'Notifications' },
          { uri: '/administration/subscriptions', label: 'Subscriptions' },
          { uri: '/administration/fwVersionMgmt', label: 'Firmware Version Management' },
          { uri: '', label: 'Local RADIUS Server' }
        ]
      }
    ] as MenuItem[]
  }
]

export default config
