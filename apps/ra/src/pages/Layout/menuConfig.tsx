import { useIntl } from 'react-intl'

import {
  getUserProfile,
  PERMISSION_VIEW_ANALYTICS,
  PERMISSION_VIEW_DATA_EXPLORER,
  PERMISSION_MANAGE_SERVICE_GUARD,
  PERMISSION_MANAGE_MLISA,
  PERMISSION_MANAGE_CALL_MANAGER,
  PERMISSION_MANAGE_CONFIG_RECOMMENDATION,
  PERMISSION_MANAGE_LABEL
} from '@acx-ui/analytics/utils'
import { LayoutProps } from '@acx-ui/components'
import { Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
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
  RocketOutlined,
  RocketSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid,
  SwitchOutlined,
  SwitchSolid,
  WiFi
} from '@acx-ui/icons'
export function useMenuConfig () {
  const { $t } = useIntl()
  const userProfile = getUserProfile()
  const isZonesPageEnabled = useIsSplitOn(Features.RUCKUS_AI_ZONES_LIST)
  const isUsersPageEnabled = useIsSplitOn(Features.RUCKUS_AI_USERS_TOGGLE)
  const currentAccountPermissions = userProfile.selectedTenant.permissions
  const hasViewAnalyticsPermissions =
    currentAccountPermissions?.[PERMISSION_VIEW_ANALYTICS]
  const hasManageRecommendationPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_CONFIG_RECOMMENDATION]
  const hasManageServiceGuardPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_SERVICE_GUARD]
  const hasManageCallManagerPermissions =
    currentAccountPermissions?.[PERMISSION_MANAGE_CALL_MANAGER]
  const hasManageMlisaPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_MLISA]
  const hasViewDataExplorerPermission =
    currentAccountPermissions?.[PERMISSION_VIEW_DATA_EXPLORER]
  const hasManageLabelPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_LABEL]

  const config: LayoutProps['menuConfig'] = [
    ...(hasViewAnalyticsPermissions ? [
      {
        uri: '/dashboard',
        label: $t({ defaultMessage: 'Dashboard' }),
        inactiveIcon: SpeedIndicatorOutlined,
        activeIcon: SpeedIndicatorSolid
      }
    ] : []),
    ...(hasViewAnalyticsPermissions ? [
      {
        label: $t({ defaultMessage: 'AI Assurance' }),
        inactiveIcon: AIOutlined,
        activeIcon: AISolid,
        children: [
          {
            type: 'group' as const,
            label: $t({ defaultMessage: 'AI Analytics' }),
            children: [
              {
                uri: '/incidents',
                label: $t({ defaultMessage: 'Incidents' })
              },
              ...(hasManageRecommendationPermission ? [
                {
                  uri: '/recommendations/crrm',
                  label: $t({ defaultMessage: 'AI-Driven RRM' })
                },
                {
                  uri: '/recommendations/aiOps',
                  label: $t({ defaultMessage: 'AI Operations' })
                }
              ] : [])
            ]
          },
          {
            type: 'group' as const,
            label: $t({ defaultMessage: 'Network Assurance' }),
            children: [
              {
                uri: '/health',
                label: $t({ defaultMessage: 'Health' })
              },
              ...(hasManageServiceGuardPermission ? [
                {
                  uri: '/serviceValidation',
                  label: $t({ defaultMessage: 'Service Validation' })
                }
              ] : []),
              {
                uri: '/configChange',
                label: $t({ defaultMessage: 'Config Change' })
              }
            ]
          }
        ]
      },
      {
        label: $t({ defaultMessage: 'App Experience' }),
        inactiveIcon: RocketOutlined,
        activeIcon: RocketSolid,
        children: [
          {
            label: $t({ defaultMessage: 'AppInsights (coming soon)' })
          },
          ...(hasManageCallManagerPermissions ? [
            {
              uri: '/videoCallQoe',
              label: $t({ defaultMessage: 'Video Call QoE' })
            }
          ] : [])
        ]
      }
    ] : []),
    ...(hasViewAnalyticsPermissions && isZonesPageEnabled
      ? [
        {
          uri: '/zones',
          label: $t({ defaultMessage: 'Zones' }),
          inactiveIcon: LocationOutlined,
          activeIcon: LocationSolid
        }
      ]
      : []),
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
              uri: '/users/wifi/reports',
              label: $t({ defaultMessage: 'Wireless Clients Report' })
            }
          ]
        }
      ]
    },
    ...(hasViewAnalyticsPermissions ? [
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
      }
    ] : []),
    ...(hasViewAnalyticsPermissions ? [
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
          }
        ]
      }
    ] : []),
    ...(hasViewDataExplorerPermission ? [
      {
        label: $t({ defaultMessage: 'Business Insights' }),
        inactiveIcon: BulbOutlined,
        activeIcon: BulbSolid,
        children: [
          {
            uri: '/dataStudio',
            label: $t({ defaultMessage: 'Data Studio' })
          },
          { uri: '/reports', label: $t({ defaultMessage: 'Reports' }) },
          ...(hasViewAnalyticsPermissions ? [
            {
              uri: '/analytics/occupancy',
              label: $t({ defaultMessage: 'Occupancy' }),
              openNewTab: true
            }
          ] : [])
        ]
      }
    ] : []),
    {
      label: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
      adminItem: true,
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Account Management' }),
          children: [
            ...(hasManageMlisaPermission ? [
              {
                uri: '/analytics/admin/onboarded',
                label: $t({ defaultMessage: 'Onboarded Systems' }),
                openNewTab: true
              },
              {
                uri: '/analytics/admin/users',
                label: $t({ defaultMessage: 'Users' }),
                openNewTab: !isUsersPageEnabled
              }
            ] : []),
            ...(hasManageLabelPermission ? [
              {
                uri: '/analytics/admin/labels',
                label: $t({ defaultMessage: 'Labels' }),
                openNewTab: true
              }
            ] : []),
            ...(hasManageMlisaPermission ? [
              {
                uri: '/analytics/admin/resourceGroups',
                label: $t({ defaultMessage: 'Resource Groups' }),
                openNewTab: true
              },
              {
                uri: '/analytics/admin/support',
                label: $t({ defaultMessage: 'Support' }),
                openNewTab: true
              },
              {
                uri: '/analytics/admin/license',
                label: $t({ defaultMessage: 'Licenses' }),
                openNewTab: true
              }
            ] : []),
            {
              uri: '/analytics/admin/schedules',
              label: $t({ defaultMessage: 'Schedules' }),
              openNewTab: true
            },
            ...(hasViewAnalyticsPermissions && hasManageMlisaPermission ? [
              {
                uri: '/analytics/admin/webhooks',
                label: $t({ defaultMessage: 'Webhooks' }),
                openNewTab: true
              }
            ] : [])
          ]
        }
      ]
    }
  ]
  return config
}
