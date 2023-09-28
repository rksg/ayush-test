import { useIntl } from 'react-intl'

import {
  useUserProfileContext,
  Tenant,
  PERMISSION_VIEW_ANALYTICS,
  PERMISSION_VIEW_DATA_EXPLORER,
  PERMISSION_MANAGE_SERVICE_GUARD,
  PERMISSION_MANAGE_MLISA,
  PERMISSION_MANAGE_CALL_MANAGER,
  PERMISSION_MANAGE_CONFIG_RECOMMENDATION,
  PERMISSION_MANAGE_LABEL,
  PERMISSION_FRANCHISOR
} from '@acx-ui/analytics/utils'
import { LayoutProps } from '@acx-ui/components'
import {
  AIOutlined,
  AISolid,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid,
  BulbOutlined,
  BulbSolid,
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
  const { data: userProfile } = useUserProfileContext()
  const tenant = userProfile?.tenants?.filter(
    // Hardcoded to current account for now
    (tenant : Tenant) => tenant.id === userProfile?.accountId
  )[0]
  const currentAccountPermissions = tenant?.permissions
  const currentAccountSetting = tenant?.settings

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

  const hasFranchisorSetting = currentAccountSetting?.[PERMISSION_FRANCHISOR]

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
        label: $t({ defaultMessage: 'Wi-Fi' }),
        inactiveIcon: WiFi,
        children: [
          {
            type: 'group' as const,
            label: $t({ defaultMessage: 'Access Points' }),
            children: [
              {
                uri: '/wifi',
                label: $t({ defaultMessage: 'Access Points List' }),
                isActiveCheck: new RegExp('^/wifi(?!(/reports))')
              },
              {
                uri: '/wifi/reports/aps',
                label: $t({ defaultMessage: 'Access Points Report' })
              },
              {
                uri: '/wifi/reports/airtime',
                label: $t({ defaultMessage: 'Airtime Utilization Report' })
              }
            ]
          }
        ]
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
            label: $t({ defaultMessage: 'App Insights (coming soon)' })
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
              uri: '/switch',
              label: $t({ defaultMessage: 'Switch List' }),
              isActiveCheck: new RegExp('^/switch(?!(/reports))')
            },
            {
              uri: '/switch/reports/wired',
              label: $t({ defaultMessage: 'Wired Report' })
            }
          ]
        }
      ]
    },
    ...(hasViewAnalyticsPermissions
      ? [{
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
      }] : []),
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
          {
            uri: '/analytics/occupancy',
            label: $t({ defaultMessage: 'Occupancy' }),
            openNewTab: true
          }
        ]
      }
    ] : []),
    ...(hasManageMlisaPermission
      || hasManageLabelPermission
      || hasFranchisorSetting
      || (hasViewAnalyticsPermissions && hasManageMlisaPermission) ? [
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
                    openNewTab: true
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
                ...(hasFranchisorSetting ? [
                  {
                    uri: '/analytics/admin/schedules',
                    label: $t({ defaultMessage: 'Schedules' }),
                    openNewTab: true
                  }
                ] : []),
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
      : [])
  ]
  return config
}
