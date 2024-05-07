import { useIntl } from 'react-intl'

import {
  getUserProfile,
  permissions
} from '@acx-ui/analytics/utils'
import { LayoutProps } from '@acx-ui/components'
import {
  Features,
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
import { useSearchParams } from '@acx-ui/react-router-dom'

const legacyLink = (uri: string, search: URLSearchParams) => {
  const selectedTenants = search.get('selectedTenants')
  if (!selectedTenants) return uri
  return ''.concat(uri, '?selectedTenants=', decodeURIComponent(selectedTenants))
}

export function useMenuConfig () {
  const { $t } = useIntl()
  const [search] = useSearchParams()
  const userProfile = getUserProfile()
  const isZonesPageEnabled = useIsSplitOn(Features.RUCKUS_AI_ZONES_LIST)
  const isSwitchHealthEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_TOGGLE)
  ].some(Boolean)
  const accountPermissions = userProfile.selectedTenant.permissions
  const config: LayoutProps['menuConfig'] = [
    ...(accountPermissions[permissions.READ_DASHBOARD] ? [
      {
        uri: '/dashboard',
        label: $t({ defaultMessage: 'Dashboard' }),
        inactiveIcon: SpeedIndicatorOutlined,
        activeIcon: SpeedIndicatorSolid
      }
    ] : []),
    ...(accountPermissions[permissions.READ_INCIDENTS] ? [
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
              ...(accountPermissions[permissions.READ_AI_DRIVEN_RRM] ? [
                {
                  uri: '/recommendations/crrm',
                  label: $t({ defaultMessage: 'AI-Driven RRM' })
                }
              ] : []),
              ...(accountPermissions[permissions.READ_AI_OPERATIONS] ? [
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
                uri: isSwitchHealthEnabled ? '/health/overview' : '/health',
                label: $t({ defaultMessage: 'Health' })
              },
              ...(accountPermissions[permissions.READ_SERVICE_VALIDATION] ? [
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
          ...(accountPermissions[permissions.READ_VIDEO_CALL_QOE] ? [
            {
              uri: '/videoCallQoe',
              label: $t({ defaultMessage: 'Video Call QoE' })
            }
          ] : [])
        ]
      }
    ] : []),
    ...(accountPermissions[permissions.READ_ZONES] && isZonesPageEnabled
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
    ...(accountPermissions[permissions.READ_ACCESS_POINTS_LIST] ? [
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
    ...(accountPermissions[permissions.READ_SWITCH_LIST] ? [
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
    ...(accountPermissions[permissions.READ_DATA_STUDIO] ? [
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
          ...(accountPermissions[permissions.READ_OCCUPANCY] ? [
            {
              uri: legacyLink('/analytics/occupancy', search),
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
            ...(accountPermissions[permissions.READ_ONBOARDED_SYSTEMS] ? [
              {
                uri: '/admin/onboarded',
                label: $t({ defaultMessage: 'Onboarded Systems' })
              },
              {
                uri: '/admin/users',
                label: $t({ defaultMessage: 'Users' })
              }
            ] : []),
            ...(accountPermissions[permissions.READ_LABELS] ? [
              {
                uri: legacyLink('/analytics/admin/labels', search),
                label: $t({ defaultMessage: 'Labels' }),
                openNewTab: true
              }
            ] : []),
            ...(accountPermissions[permissions.READ_RESOURCE_GROUPS] ? [
              {
                uri: legacyLink('/analytics/admin/resourceGroups', search),
                label: $t({ defaultMessage: 'Resource Groups' }),
                openNewTab: true
              },
              {
                uri: '/admin/support',
                label: $t({ defaultMessage: 'Support' })
              },
              {
                uri: legacyLink('/analytics/admin/license', search),
                label: $t({ defaultMessage: 'Licenses' }),
                openNewTab: true
              }
            ] : []),
            {
              uri: legacyLink('/analytics/admin/schedules', search),
              label: $t({ defaultMessage: 'Schedules' }),
              openNewTab: true
            },
            ...(accountPermissions[permissions.READ_WEBHOOKS] ? [
              {
                uri: '/admin/webhooks',
                label: $t({ defaultMessage: 'Webhooks' })
              }
            ] : [])
          ]
        }
      ]
    }
  ]
  return config
}
