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
  const showVideoCallQoe = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isServiceEnabled = useIsSplitOn(Features.SERVICES)
  const isPolicyEnabled = useIsSplitOn(Features.POLICIES)
  const isCloudMoteEnabled = useIsSplitOn(Features.CLOUDMOTE_SERVICE)
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  const isPersonaEnabled = useIsSplitOn(Features.PERSONA)
  const isMacRegistrationEnabled = useIsSplitOn(Features.MAC_REGISTRATION)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
          type: 'group' as const,
          label: $t({ defaultMessage: 'AI Analytics' }),
          children: [
            {
              uri: '/analytics/incidents',
              label: $t({ defaultMessage: 'Incidents' })
            }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Network Assurance' }),
          children: [
            {
              uri: '/analytics/health',
              label: $t({ defaultMessage: 'Health' })
            },
            ...(showSV ? [{
              uri: '/analytics/serviceValidation',
              label: $t({ defaultMessage: 'Service Validation' })
            }] : []),
            ...(showSV && showVideoCallQoe ? [{
              uri: '/analytics/videoCallQoe',
              label: $t({ defaultMessage: 'Video Call QoE' })
            }] : [])
          ]
        }
      ]
    }]: []),
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
              uri: isNavbarEnhanced ? '/users/wifi/reports/clients' : '/reports/clients',
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
              label: $t({ defaultMessage: 'Persona Groups' })
            },
            {
              uri: '/users/persona-management/persona',
              isActiveCheck: new RegExp('^/users/persona-management/persona($|/)'),
              label: $t({ defaultMessage: 'Personas List' })
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
              label: $t({ defaultMessage: 'Access Points List' })
            },
            {
              uri: isNavbarEnhanced ? '/devices/wifi/reports/aps' : '/reports/aps',
              label: $t({ defaultMessage: 'Access Points Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            },
            {
              uri: isNavbarEnhanced ? '/devices/wifi/reports/airtime' : '/reports/airtime',
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
              uri: isNavbarEnhanced ? '/networks/wireless/reports/wlans' : '/reports/wlans',
              label: $t({ defaultMessage: 'WLAN Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            },
            {
              uri: isNavbarEnhanced
                ? '/networks/wireless/reports/applications'
                : '/reports/applications',
              label: $t({ defaultMessage: 'Applications Report' }),
              isActiveCheck: IsActiveCheck.IGNORE_ACTIVE_CHECK
            },
            {
              uri: isNavbarEnhanced ? '/networks/wireless/reports/wireless' : '/reports/wireless',
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
              uri: isNavbarEnhanced ? '/devices/switch/reports/wired' : '/reports/wired',
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
    ...(isServiceEnabled || isPolicyEnabled ? [{
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
    }] : []),
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
              label: $t({ defaultMessage: 'Admin Logs' })
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
            ...(isCloudMoteEnabled ? [{
              uri: '/administration/onpremMigration',
              label: $t({ defaultMessage: 'ZD Migration' })
            }] : []),
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
