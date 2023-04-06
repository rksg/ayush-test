import { useIntl } from 'react-intl'

import { LayoutProps }                              from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  AIOutlined,
  AISolid,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid,
  LocationOutlined,
  LocationSolid,
  LineChartOutline,
  LineChartSolid,
  ServicesOutlined,
  ServicesSolid,
  SmartEdgeOutlined,
  SmartEdgeSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid,
  SwitchOutlined,
  SwitchSolid,
  WiFi
} from '@acx-ui/icons'
import { getServiceCatalogRoutePath, getServiceListRoutePath } from '@acx-ui/rc/utils'
import { RolesEnum }                                           from '@acx-ui/types'
import { hasRoles }                                            from '@acx-ui/user'

export function useMenuConfig () {
  const { $t } = useIntl()
  const showSV = useIsTierAllowed('ANLT-ADV')

  const earlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  const isEdgeEnabled = useIsSplitOn(Features.EDGES) || earlyBetaEnabled
  const isServiceEnabled = useIsSplitOn(Features.SERVICES)
  const isPolicyEnabled = useIsSplitOn(Features.POLICIES)
  const isAdministrationEnabled = useIsSplitOn(Features.UNRELEASED) || earlyBetaEnabled
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)

  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  const config: LayoutProps['menuConfig'] = [
    {
      uri: '/dashboard',
      label: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid,
      isActivePattern: ['/dashboard']
    },
    ...(isAdmin ? [{
      label: $t({ defaultMessage: 'AI Assurance' }),
      inactiveIcon: AIOutlined,
      activeIcon: AISolid,
      isActivePattern: [
        '/analytics',
        '/serviceValidation'
      ],
      children: [
        { uri: '/analytics/incidents', label: $t({ defaultMessage: 'Incidents' }) },
        { uri: '/analytics/health', label: $t({ defaultMessage: 'Health' }) },
        ...(showSV ? [{
          uri: '/serviceValidation/networkHealth', label: $t({ defaultMessage: 'Network Health' })
        }]:[])
      ]
    }]:[]),
    {
      uri: '/venues',
      label: $t({ defaultMessage: 'Venues' }),
      inactiveIcon: LocationOutlined,
      activeIcon: LocationSolid,
      isActivePattern: ['/venues']
    },
    {
      label: $t({ defaultMessage: 'Clients' }),
      inactiveIcon: AccountCircleOutlined,
      activeIcon: AccountCircleSolid,
      isActivePattern: [
        '/users/wifi',
        '/reports/clients',
        '/users/switch'
      ],
      children: [
        {
          type: 'group' as const,
          style: { width: 210 },
          label: $t({ defaultMessage: 'Wireless' }),
          children: [
            { uri: '/users/wifi/clients', label: $t({ defaultMessage: 'Wireless Clients List' }) },
            { uri: '/users/wifi/guests', label: $t({ defaultMessage: 'Guest Pass Credentials' }) },
            { uri: '/reports/clients', label: $t({ defaultMessage: 'Wireless Clients Report' }) }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Wired' }),
          children: [
            { uri: '/users/switch/clients', label: $t({ defaultMessage: 'Wired Clients List' }) }
          ]
        }
      ]
    },
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      inactiveIcon: WiFi,
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
          type: 'group' as const,
          style: { width: 225 },
          label: $t({ defaultMessage: 'Access Points' }),
          children: [
            { uri: '/devices/wifi', label: $t({ defaultMessage: 'Access Point List' }) } ,
            { uri: '/reports/aps', label: $t({ defaultMessage: 'AP Report' }) },
            { uri: '/reports/airtime', label: $t({ defaultMessage: 'Airtime Utilization Report' }) }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Wi-Fi Networks' }),
          children: [
            { uri: '/networks/wireless', label: $t({ defaultMessage: 'Wi-Fi Networks List' }) },
            { uri: '/reports/wlans', label: $t({ defaultMessage: 'WLANs Report' }) },
            { uri: '/reports/applications', label: $t({ defaultMessage: 'Applications Report' }) },
            { uri: '/reports/wireless', label: $t({ defaultMessage: 'Wireless Report' }) }
          ]
        }
      ]
    },
    {
      label: $t({ defaultMessage: 'Wired' }),
      inactiveIcon: SwitchOutlined,
      activeIcon: SwitchSolid,
      isActivePattern: [
        '/devices/switch',
        '/reports/wired',
        '/networks/wired'
      ],
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Switches' }),
          children: [
            { uri: '/devices/switch', label: $t({ defaultMessage: 'Switch List' }) },
            { uri: '/reports/wired', label: $t({ defaultMessage: 'Wired Report' }) }
          ]
        },
        {
          type: 'group' as const,
          style: { width: 260 },
          label: $t({ defaultMessage: 'Wired Network Profiles' }),
          children: [
            {
              uri: '/networks/wired/profiles',
              label: $t({ defaultMessage: 'Configuration Profiles' })
            },
            {
              uri: '/networks/wired/onDemandCli',
              label: $t({ defaultMessage: 'On-Demand CLI Configuration' })
            }
          ]
        }
      ]
    },
    ...(isEdgeEnabled ? [{
      uri: '/devices/edge/list',
      label: $t({ defaultMessage: 'SmartEdge' }),
      inactiveIcon: SmartEdgeOutlined,
      activeIcon: SmartEdgeSolid,
      isActivePattern: ['/devices/edge']
    }] : []),
    {
      label: $t({ defaultMessage: 'Network Control' }),
      inactiveIcon: ServicesOutlined,
      activeIcon: ServicesSolid,
      isActivePattern: [
        '/services',
        '/policies'
      ],
      children: [
        ...(isServiceEnabled ? [
          {
            uri: getServiceListRoutePath(true),
            label: $t({ defaultMessage: 'My Services' })
          },
          {
            uri: getServiceCatalogRoutePath(true),
            label: $t({ defaultMessage: 'Service Catalog' })
          }
        ] :[]),
        ...(isPolicyEnabled
          ? [{ uri: '/policies', label: $t({ defaultMessage: 'Policies & Profiles' }) }]
          : [])
      ]
    },
    {
      label: $t({ defaultMessage: 'Business Insights' }),
      inactiveIcon: LineChartOutline,
      activeIcon: LineChartSolid,
      isActivePattern: [
        '/dataStudio',
        '/reports/overview'
      ],
      children: [
        { uri: '/dataStudio', label: $t({ defaultMessage: 'Data Studio' }) },
        { uri: '/reports/overview', label: $t({ defaultMessage: 'Reports' }) }
      ]
    },
    ...(isAdministrationEnabled ? [{
      label: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
      isActivePattern: [
        '/timeline',
        '/administration'
      ],
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Timeline' }),
          children: [
            {
              uri: '/timeline/activities',
              label: $t({ defaultMessage: 'Activities' })
            },
            {
              uri: '/timeline/events',
              label: $t({ defaultMessage: 'Events' })
            },
            {
              uri: '/timeline/adminLogs',
              label: $t({ defaultMessage: 'Administrative Logs' })
            }
          ]
        },
        {
          type: 'group' as const,
          style: { width: 270 },
          label: 'Account Management',
          children: [
            {
              uri: '/administration/accountSettings',
              label: $t({ defaultMessage: 'Settings' })
            },
            {
              uri: '/administration/administrators',
              label: $t({ defaultMessage: 'Administrators' })
            },
            {
              uri: '/administration/notifications',
              label: $t({ defaultMessage: 'Notifications' })
            },
            {
              uri: '/administration/subscriptions',
              label: $t({ defaultMessage: 'Subscriptions' })
            },
            {
              uri: '/administration/fwVersionMgmt',
              label: $t({ defaultMessage: 'Firmware Version Management' })
            },
            ...(isRadiusClientEnabled ? [{
              uri: '/administration/localRadiusServer',
              label: $t({ defaultMessage: 'Local RADIUS Server' })
            }]:[])
          ]
        }
      ]
    }]:[])
  ]
  if (isGuestManager) { return [] }
  return config
}
