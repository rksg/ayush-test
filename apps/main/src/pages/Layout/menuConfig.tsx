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
  WiFi,
  DevicesOutlined,
  DevicesSolid
} from '@acx-ui/icons'
import {
  getServiceCatalogRoutePath,
  getServiceListRoutePath,
  hasAdministratorTab
} from '@acx-ui/rc/utils'
import { RolesEnum }                       from '@acx-ui/types'
import { hasRoles, useUserProfileContext } from '@acx-ui/user'
import { useTenantId }                     from '@acx-ui/utils'

export function useMenuConfig () {
  const { $t } = useIntl()
  const tenantID = useTenantId()
  const { data: userProfileData } = useUserProfileContext()
  const isAnltAdvTier = useIsTierAllowed('ANLT-ADV')
  const showVideoCallQoe = useIsSplitOn(Features.VIDEO_CALL_QOE)
  const showConfigChange = useIsSplitOn(Features.CONFIG_CHANGE)
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isServiceEnabled = useIsSplitOn(Features.SERVICES)
  const isPolicyEnabled = useIsSplitOn(Features.POLICIES)
  const isCloudMoteEnabled = useIsTierAllowed(Features.CLOUDMOTE_BETA)
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isAdministratorAccessible = hasAdministratorTab(userProfileData, tenantID)
  const recommendationsEnabled = useIsSplitOn(Features.AI_RECOMMENDATIONS)
  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)

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
            },
            ...(recommendationsEnabled ? [{
              uri: '/analytics/recommendations/crrm',
              label: $t({ defaultMessage: 'AI-Driven RRM' })
            }, {
              uri: '/analytics/recommendations/aiOps',
              label: $t({ defaultMessage: 'AI Operations' })
            }] : [])
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
            ...(isAnltAdvTier ? [{
              uri: '/analytics/serviceValidation',
              label: $t({ defaultMessage: 'Service Validation' })
            }] : []),
            ...(isAnltAdvTier && showConfigChange ? [{
              uri: '/analytics/configChange',
              label: $t({ defaultMessage: 'Config Change' })
            }] : []),
            ...(isAnltAdvTier && showVideoCallQoe ? [{
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
              uri: '/users/wifi/reports/clients',
              label: $t({ defaultMessage: 'Wireless Clients Report' })
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
        ...(isCloudpathBetaEnabled ? [{
          type: 'group' as const,
          label: $t({ defaultMessage: 'Identity Management' }),
          children: [
            {
              uri: '/users/identity-management/identity-group',
              label: $t({ defaultMessage: 'Identity Groups' })
            },
            {
              uri: '/users/identity-management/identity',
              isActiveCheck: new RegExp('^/users/identity-management/identity($|/)'),
              label: $t({ defaultMessage: 'Identities List' })
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
              label: $t({ defaultMessage: 'Access Points List' }),
              isActiveCheck: new RegExp('^/devices/wifi(?!(/reports))')
            },
            {
              uri: '/devices/wifi/reports/aps',
              label: $t({ defaultMessage: 'Access Points Report' })
            },
            {
              uri: '/devices/wifi/reports/airtime',
              label: $t({ defaultMessage: 'Airtime Utilization Report' })
            }
          ]
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Wi-Fi Networks' }),
          children: [
            {
              uri: '/networks/wireless',
              label: $t({ defaultMessage: 'Wi-Fi Networks List' }),
              isActiveCheck: new RegExp('^/networks/wireless(?!(/reports))')
            },
            {
              uri: '/networks/wireless/reports/wlans',
              label: $t({ defaultMessage: 'WLANs Report' })
            },
            {
              uri: '/networks/wireless/reports/applications',
              label: $t({ defaultMessage: 'Applications Report' })
            },
            {
              uri: '/networks/wireless/reports/wireless',
              label: $t({ defaultMessage: 'Wireless Report' })
            }
          ]
        }
      ]
    },
    ...(showRwgUI ? [{
      uri: '/ruckus-wan-gateway',
      label: $t({ defaultMessage: 'RWG' }),
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid
    }] : []),
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
              label: $t({ defaultMessage: 'Switch List' }),
              isActiveCheck: new RegExp('^/devices/switch(?!(/reports))')
            },
            {
              uri: '/devices/switch/reports/wired',
              label: $t({ defaultMessage: 'Wired Report' })
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
      uri: '/devices/edge',
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
      adminItem: true,
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
          label: $t({ defaultMessage: 'Account Management' }),
          children: [
            {
              uri: '/administration/accountSettings',
              label: $t({ defaultMessage: 'Settings' })
            },
            ...(isAdministratorAccessible ? [{
              uri: '/administration/administrators',
              label: $t({ defaultMessage: 'Administrators' })
            }] : []),
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
              label: $t({ defaultMessage: 'Version Management' })
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
  if (isGuestManager || isDPSKAdmin) { return [] }
  return config
}
