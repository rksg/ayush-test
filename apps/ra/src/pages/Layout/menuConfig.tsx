import { useIntl } from 'react-intl'

import {
  useUserProfileContext,
  Tenant,
  PERMISSION_VIEW_ANALYTICS,
  PERMISSION_VIEW_DATA_EXPLORER,
  PERMISSION_MANAGE_SERVICE_GUARD,
  PERMISSION_MANAGE_MLISA,
  PERMISSION_MANAGE_CALL_MANAGER,
  PERMISSION_MANAGE_CONFIG_RECOMMENDATION
} from '@acx-ui/analytics/utils'
import { LayoutProps }  from '@acx-ui/components'
import {
  AIOutlined,
  AISolid,
  AdminOutlined,
  AdminSolid,
  BulbOutlined,
  BulbSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'
export function useMenuConfig () {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const currentAccountPermissions = userProfile?.tenants?.filter(
    // Hardcoded to current account for now
    (tenent : Tenant) => tenent.id === userProfile?.accountId
  )[0].permissions
  const hasAnalyticsPermissions = currentAccountPermissions?.[PERMISSION_VIEW_ANALYTICS]
  const hasManageRecommendationPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_CONFIG_RECOMMENDATION]
  const hasManageServiceGuardPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_SERVICE_GUARD]
  const hasManageCallManagerPermissions =
    currentAccountPermissions?.[PERMISSION_MANAGE_CALL_MANAGER]

  const config: LayoutProps['menuConfig'] = [
    ...(hasAnalyticsPermissions
      ? [
        {
          uri: '/dashboard',
          label: $t({ defaultMessage: 'Dashboard' }),
          inactiveIcon: SpeedIndicatorOutlined,
          activeIcon: SpeedIndicatorSolid
        }
      ]
      : []),
    ...(hasAnalyticsPermissions
      ? [
        {
          label: $t({ defaultMessage: 'AI Assurance' }),
          inactiveIcon: AIOutlined,
          activeIcon: AISolid,
          children: [
            {
              type: 'group' as const,
              label: $t({ defaultMessage: 'AI Analytics' }),
              children: [
                ...(hasAnalyticsPermissions
                  ? [
                    {
                      uri: '/incidents',
                      label: $t({ defaultMessage: 'Incidents' })
                    }
                  ]
                  : []),
                ...(hasManageRecommendationPermission
                  ? [
                    {
                      uri: '/recommendations',
                      label: $t({ defaultMessage: 'Recommendations' })
                    }
                  ]
                  : []),
                ...(hasAnalyticsPermissions
                  ? [
                    {
                      uri: '/configChange',
                      label: $t({ defaultMessage: 'Config Change' })
                    }
                  ]
                  : [])
              ]
            },
            {
              type: 'group' as const,
              label: $t({ defaultMessage: 'Network Assurance' }),
              children: [
                ...(hasAnalyticsPermissions
                  ? [
                    {
                      uri: '/health',
                      label: $t({ defaultMessage: 'Health' })
                    }
                  ]
                  : []),
                ...(hasManageServiceGuardPermission
                  ? [
                    {
                      uri: '/serviceValidation',
                      label: $t({ defaultMessage: 'Service Validation' })
                    }
                  ]
                  : []),
                ...(hasManageCallManagerPermissions
                  ? [
                    {
                      uri: '/videoCallQoe',
                      label: $t({ defaultMessage: 'Video Call QoE' })
                    }
                  ]
                  : []),
                ...(hasAnalyticsPermissions
                  ? [
                    {
                      uri: '/occupancy',
                      label: $t({ defaultMessage: 'Occupancy' })
                    }
                  ]
                  : [])
              ]
            }
          ]
        }
      ]
      : []),
    ...(currentAccountPermissions?.[PERMISSION_VIEW_DATA_EXPLORER]
      ? [
        {
          label: $t({ defaultMessage: 'Business Insights' }),
          inactiveIcon: BulbOutlined,
          activeIcon: BulbSolid,
          children: [
            {
              uri: '/dataStudio',
              label: $t({ defaultMessage: 'Data Studio' })
            },
            { uri: '/reports', label: $t({ defaultMessage: 'Reports' }) }
          ]
        }
      ]
      : []),
    ...(currentAccountPermissions?.[PERMISSION_MANAGE_MLISA]
      ? [
        {
          label: $t({ defaultMessage: 'Administration' }),
          inactiveIcon: AdminOutlined,
          activeIcon: AdminSolid,
          children: [
            {
              type: 'group' as const,
              label: $t({ defaultMessage: 'Account Management' }),
              children: [
                ...(currentAccountPermissions?.[PERMISSION_MANAGE_MLISA] &&
                  hasAnalyticsPermissions
                  ? [
                    {
                      uri: '/admin/onboardedSystems',
                      label: $t({ defaultMessage: 'Onboarded Systems' })
                    },
                    {
                      uri: '/admin/users',
                      label: $t({ defaultMessage: 'Users' })
                    },
                    {
                      uri: '/admin/resourceGroups',
                      label: $t({ defaultMessage: 'Resource Groups' })
                    },
                    {
                      uri: '/admin/support',
                      label: $t({ defaultMessage: 'Support' })
                    },
                    {
                      uri: '/admin/license',
                      label: $t({ defaultMessage: 'License' })
                    }
                  ]
                  : []),
                {
                  uri: '/admin/schedules',
                  label: $t({ defaultMessage: 'Schedules' })
                },
                ...(currentAccountPermissions?.[PERMISSION_MANAGE_MLISA]
                  ? [
                    {
                      uri: '/admin/webhooks',
                      label: $t({ defaultMessage: 'Webhooks' })
                    }
                  ]
                  : [])
              ]
            }
          ]
        }
      ]
      : [])
  ]
  return config
}
