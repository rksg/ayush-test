import { useIntl } from 'react-intl'

import { LayoutProps, ItemType }                                  from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
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
  DevicesSolid,
  DataStudioOutlined,
  DataStudioSolid
} from '@acx-ui/icons'
import { useIsEdgeReady } from '@acx-ui/rc/components'
import {
  getPolicyListRoutePath,
  getServiceCatalogRoutePath,
  getServiceListRoutePath,
  hasAdministratorTab
} from '@acx-ui/rc/utils'
import { RolesEnum }                                      from '@acx-ui/types'
import { hasRoles, useUserProfileContext, RaiPermission } from '@acx-ui/user'
import { useTenantId }                                    from '@acx-ui/utils'

export function useMenuConfig () {
  const { $t } = useIntl()
  const tenantID = useTenantId()
  const { data: userProfileData, isCustomRole } = useUserProfileContext()
  const isAnltAdvTier = useIsTierAllowed('ANLT-ADV')
  const showConfigChange = useIsSplitOn(Features.CONFIG_CHANGE)
  const isEdgeEnabled = useIsEdgeReady()
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isReportsAdmin = hasRoles([RolesEnum.REPORTS_ADMIN])
  const isAdministratorAccessible = hasAdministratorTab(userProfileData, tenantID)
  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const showApGroupTable = useIsSplitOn(Features.AP_GROUP_TOGGLE)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const showGatewaysMenu = useIsSplitOn(Features.ACX_UI_GATEWAYS_MENU_OPTION_TOGGLE)
  const isEdgeOltMgmtEnabled = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)
  const isSwitchHealthEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_TOGGLE)
  ].some(Boolean)
  const isIntentAIEnabled = useIsSplitOn(Features.INTENT_AI_TOGGLE)
  const isCanvasEnabled = useIsTierAllowed(Features.CANVAS)
  const isMspAppMonitoringEnabled = useIsSplitOn(Features.MSP_APP_MONITORING)
  const isDataSubscriptionsEnabled = useIsSplitOn(Features.ACX_UI_DATA_SUBSCRIPTIONS_TOGGLE)
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  type Item = ItemType & {
    permission?: RaiPermission
    hidden?: boolean
    children?: Item[]
  }
  const aiAnalyticsMenu = [{
    permission: 'READ_INCIDENTS',
    uri: '/analytics/incidents',
    label: $t({ defaultMessage: 'Incidents' })
  }] as Item[]
  if (isIntentAIEnabled) {
    aiAnalyticsMenu.push({
      permission: 'READ_INTENT_AI',
      uri: '/analytics/intentAI',
      label: $t({ defaultMessage: 'IntentAI' })
    })
  } else {
    aiAnalyticsMenu
      .push({
        permission: 'READ_AI_DRIVEN_RRM',
        uri: '/analytics/recommendations/crrm',
        label: $t({ defaultMessage: 'AI-Driven RRM' })
      }, {
        permission: 'READ_AI_OPERATIONS',
        uri: '/analytics/recommendations/aiOps',
        label: $t({ defaultMessage: 'AI Operations' })
      })
  }

  const config: LayoutProps['menuConfig'] = [
    {
      uri: '/dashboard',
      label: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid
    },
    {
      label: $t({ defaultMessage: 'AI Assurance' }),
      inactiveIcon: AIOutlined,
      activeIcon: AISolid,
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'AI Analytics' }),
          children: aiAnalyticsMenu
        },
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Network Assurance' }),
          children: [
            {
              uri: `/analytics/health${isSwitchHealthEnabled ? '/overview' : ''}`,
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
            ...(isAnltAdvTier ? [{
              uri: '/analytics/videoCallQoe',
              label: $t({ defaultMessage: 'Video Call QoE' })
            }] : [])
          ]
        }
      ]
    },
    ...(!showGatewaysMenu ? [{
      uri: '/venues',
      label: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      inactiveIcon: LocationOutlined,
      activeIcon: LocationSolid
    }] : []),
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
    ...(showGatewaysMenu ? [{
      uri: '/venues',
      label: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      inactiveIcon: LocationOutlined,
      activeIcon: LocationSolid
    }] : []),
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
              label: $t({ defaultMessage: 'AP List' }),
              isActiveCheck: new RegExp('^/devices/wifi(?!(/[reports|apgroup]))')
            },
            ...(showApGroupTable? [{
              uri: '/devices/wifi/apgroups',
              label: $t({ defaultMessage: 'AP Group List' })
            }] : []),
            {
              uri: '/devices/wifi/reports/aps',
              label: $t({ defaultMessage: 'AP Report' })
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
    ...(!showGatewaysMenu && showRwgUI ? [{
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
            ...(isEdgeOltMgmtEnabled ? [{
              uri: '/devices/optical',
              isActiveCheck: new RegExp('^/devices/optical'),
              label: $t({ defaultMessage: 'Optical' })
            }] : []),
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
    ...(!showGatewaysMenu && isEdgeEnabled ? [{
      uri: '/devices/edge',
      isActiveCheck: new RegExp('^/devices/edge'),
      label: $t({ defaultMessage: 'RUCKUS Edge' }),
      inactiveIcon: SmartEdgeOutlined,
      activeIcon: SmartEdgeSolid
    }] : []),
    ...(showGatewaysMenu && (isEdgeEnabled || showRwgUI) ? [{
      label: $t({ defaultMessage: 'Gateway' }),
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid,
      children: [
        ...(isEdgeEnabled ? [{
          uri: '/devices/edge',
          isActiveCheck: new RegExp('^/devices/edge'),
          label: $t({ defaultMessage: 'RUCKUS Edge' })
        }] : []),
        ...(showRwgUI ? [{
          uri: '/ruckus-wan-gateway',
          label: $t({ defaultMessage: 'RUCKUS WAN Gateway' })
        }] : [])
      ]
    }] : []
    ),
    {
      label: $t({ defaultMessage: 'Network Control' }),
      inactiveIcon: ServicesOutlined,
      activeIcon: ServicesSolid,
      children: [
        {
          uri: getServiceListRoutePath(true),
          isActiveCheck: new RegExp('^(?=/services/)((?!catalog).)*$'),
          label: $t({ defaultMessage: 'My Services' })
        },
        {
          uri: getServiceCatalogRoutePath(true),
          label: $t({ defaultMessage: 'Service Catalog' })
        },
        { uri: getPolicyListRoutePath(true),
          label: $t({ defaultMessage: 'Policies & Profiles' })
        }
      ]
    },
    {
      label: $t({ defaultMessage: 'Business Insights' }),
      inactiveIcon: BulbOutlined,
      activeIcon: BulbSolid,
      children: [
        { uri: '/dataStudio', label: $t({ defaultMessage: 'Data Studio' }) },
        // TODO: rename this later
        ...(isDataSubscriptionsEnabled && isAdmin ? [{
          uri: '/dataSubscriptions',
          label: $t({ defaultMessage: 'Data Subscriptions' })
        }] : []),
        { uri: '/reports', label: $t({ defaultMessage: 'Reports' }) }
      ]
    },
    ...(isCanvasEnabled ? [ {
      label: $t({ defaultMessage: 'AI Canvas' }),
      uri: '/canvas',
      inactiveIcon: BulbOutlined,
      activeIcon: BulbSolid
    }] : [])
    ,
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
            ...(
              !isCustomRole ? [
                {
                  uri: '/administration/accountSettings',
                  label: $t({ defaultMessage: 'Settings' })
                }
              ] : []
            ),
            ...(isAdministratorAccessible && !isCustomRole ? [
              isAbacToggleEnabled ? {
                uri: '/administration/userPrivileges',
                label: $t({ defaultMessage: 'Users & Privileges' })
              } : {
                uri: '/administration/administrators',
                label: $t({ defaultMessage: 'Administrators' })
              }
            ] : []),
            ...(isMspAppMonitoringEnabled ? [
              {
                uri: '/administration/privacy',
                label: $t({ defaultMessage: 'Privacy' })
              }
            ] : []),
            ...(
              !isCustomRole ? [
                {
                  uri: '/administration/notifications',
                  label: $t({ defaultMessage: 'Notifications' })
                },
                {
                  uri: '/administration/subscriptions',
                  label: $t({ defaultMessage: 'Subscriptions' })
                }
              ] : []
            ),
            {
              uri: '/administration/fwVersionMgmt',
              label: $t({ defaultMessage: 'Version Management' })
            },
            ...(
              !isCustomRole ? [
                {
                  uri: '/administration/webhooks',
                  label: $t({ defaultMessage: 'Webhooks' })
                },
                {
                  uri: '/administration/onpremMigration',
                  label: $t({ defaultMessage: 'ZD Migration' })
                }
              ] : []
            ),
            ...(isRadiusClientEnabled && !isCustomRole ? [{
              uri: '/administration/localRadiusServer',
              label: $t({ defaultMessage: 'Local RADIUS Server' })
            }] : [])
          ]
        }
      ]
    }
  ]
  if (isGuestManager) {
    return [
      {
        label: $t({
          defaultMessage: 'Guest Pass Credentials'
        }),
        inactiveIcon: AccountCircleOutlined,
        activeIcon: AccountCircleSolid,
        uri: '/users/guestsManager'
      }
    ]}
  if (isDPSKAdmin) { return [] }
  if (isReportsAdmin) {
    return [
      {
        label: $t({ defaultMessage: 'Data Studio' }),
        inactiveIcon: DataStudioOutlined,
        activeIcon: DataStudioSolid,
        uri: '/dataStudio',
        isActiveCheck: new RegExp('^/dataStudio')
      },
      {
        label: $t({ defaultMessage: 'Reports' }),
        inactiveIcon: DataStudioOutlined,
        activeIcon: DataStudioSolid,
        uri: '/reports',
        isActiveCheck: new RegExp('^/reports')
      }
    ]
  }
  return config
}
