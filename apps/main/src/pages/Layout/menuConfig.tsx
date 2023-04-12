import { useIntl } from 'react-intl'

import { LayoutProps, IsActiveCheck }               from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
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
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  const isPersonaEnabled = useIsSplitOn(Features.PERSONA)
  const isMacRegistrationEnabled = useIsSplitOn(Features.MAC_REGISTRATION)

  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  const config: LayoutProps['menuConfig'] = [
    {
      uri: '/dashboard',
      label: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid
    },
    ...(isAdmin ? [{
      label: $t({ defaultMessage: 'AI Assurance' }),
      inactiveIcon: AIOutlined,
      activeIcon: AISolid,
      children: [
        {
          uri: '/analytics/incidents',
          label: $t({ defaultMessage: 'Incidents' })
        },
        {
          uri: '/analytics/health',
          label: $t({ defaultMessage: 'Health' })
        },
        ...(showSV ? [{
          uri: '/serviceValidation/networkHealth',
          label: $t({ defaultMessage: 'Service Validation' })
        }] : [])
      ]
    }] : []),
    {
      uri: '/venues',
      label: $t({ defaultMessage: 'Venues' }),
      inactiveIcon: LocationOutlined,
      activeIcon: LocationSolid
    },
    {
      label: $t({ defaultMessage: 'Clients' }),
      inactiveIcon: AccountCircleOutlined,
      activeIcon: AccountCircleSolid,
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Wireless' }),
          children: [
            {
              uri: '/users/wifi/clients',
              label: $t({ defaultMessage: 'Wireless Clients List' })
            },
            {
              uri: '/users/wifi/guests',
              label: $t({ defaultMessage: 'Guest Pass Credentials' })
            },
            {
              uri: '/reports/clients',
              label: $t({ defaultMessage: 'Wireless Clients Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Wired' }),
          children: [
            {
              uri: '/users/switch/clients',
              label: $t({ defaultMessage: 'Wired Clients List' })
            }
          ]
        },
        ...(isPersonaEnabled && isMacRegistrationEnabled ? [{
          type: 'group' as const,
          label: $t({ defaultMessage: 'Persona Management' }),
          children: [
            {
              uri: '/users/persona-management/persona-group',
              label: $t({ defaultMessage: 'Persona Group' })
            },
            {
              uri: '/users/persona-management/persona',
              isActiveCheck: new RegExp('^/users/persona-management/persona($|/)'),
              label: $t({ defaultMessage: 'Persona' })
            }
          ]
        }] : [])
      ]
    },
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      inactiveIcon: WiFi,
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Access Points' }),
          children: [
            {
              uri: '/devices/wifi',
              label: $t({ defaultMessage: 'Access Point List' })
            },
            {
              uri: '/reports/aps',
              label: $t({ defaultMessage: 'AP Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            },
            {
              uri: '/reports/airtime',
              label: $t({ defaultMessage: 'Airtime Utilization Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Wi-Fi Networks' }),
          children: [
            {
              uri: '/networks/wireless',
              label: $t({ defaultMessage: 'Wi-Fi Networks List' })
            },
            {
              uri: '/reports/wlans',
              label: $t({ defaultMessage: 'WLANs Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            },
            {
              uri: '/reports/applications',
              label: $t({ defaultMessage: 'Applications Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            },
            {
              uri: '/reports/wireless',
              label: $t({ defaultMessage: 'Wireless Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            }
          ]
        }
      ]
    },
    {
      label: $t({ defaultMessage: 'Wired' }),
      inactiveIcon: SwitchOutlined,
      activeIcon: SwitchSolid,
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Switches' }),
          children: [
            {
              uri: '/devices/switch',
              label: $t({ defaultMessage: 'Switch List' })
            },
            {
              uri: '/reports/wired',
              label: $t({ defaultMessage: 'Wired Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            }
          ]
        },
        {
          type: 'group' as const,
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
      isActiveCheck: new RegExp('^/devices/edge'),
      label: $t({ defaultMessage: 'SmartEdge' }),
      inactiveIcon: SmartEdgeOutlined,
      activeIcon: SmartEdgeSolid
    }] : []),
    {
      label: $t({ defaultMessage: 'Network Control' }),
      inactiveIcon: ServicesOutlined,
      activeIcon: ServicesSolid,
      children: [
        ...(isServiceEnabled ? [
          {
            uri: getServiceListRoutePath(true),
            isActiveCheck: new RegExp('^(?=/services/)((?!catalog).)*$'),
            label: $t({ defaultMessage: 'My Services' })
          },
          {
            uri: getServiceCatalogRoutePath(true),
            label: $t({ defaultMessage: 'Service Catalog' })
          }
        ] : []),
        ...(isPolicyEnabled
          ? [{ uri: '/policies', label: $t({ defaultMessage: 'Policies & Profiles' }) }]
          : [])
      ]
    },
    {
      label: $t({ defaultMessage: 'Business Insights' }),
      inactiveIcon: BulbOutlined,
      activeIcon: BulbSolid,
      children: [
        { uri: '/dataStudio', label: $t({ defaultMessage: 'Data Studio' }) },
        { uri: '/reports', label: $t({ defaultMessage: 'Reports' }) }
      ]
    },
    {
      label: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
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
            }] : [])
          ]
        }
      ]
    }
  ]
  if (isGuestManager) { return [] }
  return config
}
