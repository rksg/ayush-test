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
  LineChartOutline,
  LineChartSolid,
  NetworksOutlined,
  NetworksSolid,
  ServicesOutlined,
  ServicesSolid as ServicesSolidBase,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'

import { LayoutProps } from '..'
import { LayoutUI }    from '../styledComponents'

const AIOutlined = styled(AIOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const AISolid = styled(AISolidBase)`${LayoutUI.iconOutlinedOverride}`
const ServicesSolid = styled(ServicesSolidBase)`${LayoutUI.iconSolidOverride}`

const config: LayoutProps['menuConfig']= [
  {
    uri: '/dashboard',
    label: 'Dashboard',
    inactiveIcon: SpeedIndicatorOutlined,
    activeIcon: SpeedIndicatorSolid,
    isActivePattern: ['/dashboard']
  },
  {
    label: 'Analytics & Reports',
    inactiveIcon: AIOutlined,
    activeIcon: AISolid,
    isActivePattern: [
      '/analytics',
      '/serviceValidation'
    ],
    children: [
      { uri: '/analytics/incidents', label: 'Incidents' },
      { uri: '/analytics/health', label: 'Health' },
      { uri: '/serviceValidation/networkHealth', label: 'Netowrk Health' }
    ]
  },
  {
    uri: '/venues',
    label: 'Venues',
    inactiveIcon: LocationOutlined,
    activeIcon: LocationSolid,
    isActivePattern: ['/venues']
  },
  {
    label: 'Clients',
    inactiveIcon: AccountCircleOutlined,
    activeIcon: AccountCircleSolid,
    isActivePattern: [
      '/users/wifi',
      '/reports/clients',
      '/users/switch'
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
          { uri: '/users/switch/clients', label: 'Switch Clients List' }
        ]
      }
    ]
  },
  {
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
      }
    ]
  },
  {
    label: 'Wired',
    inactiveIcon: NetworksOutlined,
    activeIcon: NetworksSolid,
    isActivePattern: [
      '/devices/switch',
      '/reports/wired',
      '/networks/wired'
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
    ]
  },
  {
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
    ]
  },
  {
    label: 'Business Insights',
    inactiveIcon: LineChartOutline,
    activeIcon: LineChartSolid,
    isActivePattern: [
      '/dataStudio',
      '/reports/overview'
    ],
    children: [
      { uri: '/dataStudio', label: 'Data Studio' },
      { uri: '/reports/overview', label: 'Reports' }
    ]
  },
  {
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
          { uri: '/administration/localRadiusServer', label: 'Local RADIUS Server' }
        ]
      }
    ]
  }
]

export default config
