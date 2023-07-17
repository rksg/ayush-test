import {
  AIOutlined,
  AISolid,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid,
  BulbOutlined,
  BulbSolid,
  LocationOutlined,
  LocationSolid,
  ServicesOutlined,
  ServicesSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid,
  SwitchOutlined,
  SwitchSolid,
  WiFi
} from '@acx-ui/icons'

import { LayoutProps, IsActiveCheck } from '..'

const config: LayoutProps['menuConfig'] = [
  null,
  {
    uri: '/dashboard',
    label: 'Dashboard',
    inactiveIcon: SpeedIndicatorOutlined,
    activeIcon: SpeedIndicatorSolid
  },
  {
    label: 'AI Assurance',
    inactiveIcon: AIOutlined,
    activeIcon: AISolid,
    children: [
      {
        uri: '/analytics/incidents',
        label: 'Incidents'
      },
      {
        uri: '/analytics/health',
        label: 'Health'
      },
      {
        uri: '/analytics/serviceValidation',
        label: 'Service Validation'
      }
    ]
  },
  {
    uri: '/venues',
    label: 'Venues',
    inactiveIcon: LocationOutlined,
    activeIcon: LocationSolid
  },
  {
    label: 'Clients',
    inactiveIcon: AccountCircleOutlined,
    activeIcon: AccountCircleSolid,
    children: [
      {
        type: 'group',
        label: 'Wireless',
        children: [
          {
            uri: '/users/wifi/clients',
            label: 'Wireless Clients List'
          } ,
          {
            uri: '/users/wifi/guests',
            label: 'Guest Pass Credentials'
          },
          {
            uri: '/reports/clients',
            label: 'Wireless Clients Report',
            isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
          }
        ]
      },
      {
        type: 'group',
        label: 'Wired',
        children: [
          {
            uri: '/users/switch/clients',
            label: 'Switch Clients List'
          }
        ]
      }
    ]
  },
  {
    label: 'Wi-Fi',
    inactiveIcon: WiFi,
    children: [
      {
        type: 'group',
        label: 'Access Points',
        children: [
          {
            uri: '/devices/wifi',
            label: 'Access Point List'
          } ,
          {
            uri: '/reports/aps',
            label: 'AP Report',
            isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
          },
          {
            uri: '/reports/airtime',
            label: 'Airtime Utilization Report',
            isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
          }
        ]
      },
      {
        type: 'group',
        label: 'Wi-Fi Networks',
        children: [
          {
            uri: '/networks/wireless',
            label: 'Wi-Fi Networks List'
          },
          {
            uri: '/reports/wlans',
            label: 'WLANs Report',
            isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
          },
          {
            uri: '/reports/applications',
            label: 'Applications Report',
            isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
          },
          {
            uri: '/reports/wireless',
            label: 'Wireless Report',
            isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
          }
        ]
      }
    ]
  },
  {
    label: 'Wired',
    inactiveIcon: SwitchOutlined,
    activeIcon: SwitchSolid,
    children: [
      {
        type: 'group',
        label: 'Switches',
        children: [
          {
            uri: '/devices/switch',
            label: 'Switch List'
          } ,
          {
            uri: '/reports/wired',
            label: 'Wired Report',
            isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
          }
        ]
      },
      {
        type: 'group',
        label: 'Wired Network Profiles',
        children: [
          {
            uri: '/networks/wired/profiles',
            label: 'Configuration Profiles'
          },
          {
            uri: '/networks/wired/onDemandCli',
            label: 'On-Demand CLI Configuration'
          }
        ]
      }
    ]
  },
  {
    label: 'Network Control',
    inactiveIcon: ServicesOutlined,
    activeIcon: ServicesSolid,
    children: [
      {
        uri: '/services/list',
        isActiveCheck: new RegExp('^(?=/services/)((?!catalog).)*$'),
        label: 'My Services'
      },
      {
        uri: '/services/catalog',
        label: 'Service Catalog'
      },
      {
        uri: '/policies',
        label: 'Policies & Profiles'
      }
    ]
  },
  {
    label: 'Business Insights',
    inactiveIcon: BulbOutlined,
    activeIcon: BulbSolid,
    children: [
      {
        uri: '/dataStudio',
        label: 'Data Studio'
      },
      {
        uri: '/reports/overview',
        label: 'Reports'
      }
    ]
  },
  {
    label: 'Administration',
    inactiveIcon: AdminOutlined,
    activeIcon: AdminSolid,
    children: [
      {
        type: 'group',
        label: 'Timeline',
        children: [
          {
            uri: '/timeline/activities',
            label: 'Activities'
          },
          {
            uri: '/timeline/events',
            label: 'Events'
          },
          {
            uri: '/timeline/adminlog',
            label: 'Administrative Logs'
          }
        ]
      },
      {
        type: 'group',
        label: 'Account Management',
        children: [
          {
            uri: '/administration/accountSettings',
            label: 'Settings'
          },
          {
            uri: '/administration/administrators',
            label: 'Administrators'
          },
          {
            uri: '/administration/notifications',
            label: 'Notifications'
          },
          {
            uri: '/administration/subscriptions',
            label: 'Subscriptions'
          },
          {
            uri: '/administration/fwVersionMgmt',
            label: 'Version Management'
          },
          {
            uri: '/administration/onpremMigration',
            label: 'ZD Migration'
          },
          {
            uri: '/administration/localRadiusServer',
            label: 'Local RADIUS Server'
          }
        ]
      }
    ]
  }
]

export default config
