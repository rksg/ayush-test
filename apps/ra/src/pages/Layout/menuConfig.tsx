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
  const tenant = userProfile?.tenants?.filter(
    // Hardcoded to current account for now
    (tenant : Tenant) => tenant.id === userProfile?.accountId
  )[0]
  const currentAccountPermissions = tenant?.permissions
  const currentAccountSetting = tenant?.settings

  const hasViewAnalyticsPermissions = currentAccountPermissions?.[PERMISSION_VIEW_ANALYTICS]
  const hasManageRecommendationPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_CONFIG_RECOMMENDATION]
  const hasManageServiceGuardPermission =
    currentAccountPermissions?.[PERMISSION_MANAGE_SERVICE_GUARD]
  const hasManageCallManagerPermissions =
    currentAccountPermissions?.[PERMISSION_MANAGE_CALL_MANAGER]
  const hasManageMlisaPermission = currentAccountPermissions?.[PERMISSION_MANAGE_MLISA]
  const hasViewDataExplorerPermission = currentAccountPermissions?.[PERMISSION_VIEW_DATA_EXPLORER]
  const hasManageLabelPermission = currentAccountPermissions?.[PERMISSION_MANAGE_LABEL]

  const hasFranchisorSetting = currentAccountSetting?.[PERMISSION_FRANCHISOR]

  const config: LayoutProps['menuConfig'] = [
    ...(hasViewAnalyticsPermissions
      ? [
        {
          uri: '/dashboard',
          label: $t({ defaultMessage: 'Dashboard' }),
          inactiveIcon: SpeedIndicatorOutlined,
          activeIcon: SpeedIndicatorSolid
        }
      ]
      : []),
    ...(hasViewAnalyticsPermissions
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
                {
                  uri: '/incidents',
                  label: $t({ defaultMessage: 'Incidents' })
                },
                ...(hasManageRecommendationPermission
                  ? [
                    {
                      uri: '/recommendations/crrm',
                      label: $t({ defaultMessage: 'AI-Driven RRM' })
                    },
                    {
                      uri: '/recommendations/aiOps',
                      label: $t({ defaultMessage: 'AI Operations' })
                    }
                  ]
                  : [])
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
                ...(hasManageServiceGuardPermission
                  ? [
                    {
                      uri: '/serviceValidation',
                      label: $t({ defaultMessage: 'Service Validation' })
                    }
                  ]
                  : []),
                {
                  uri: '/configChange',
                  label: $t({ defaultMessage: 'Config Change' })
                },
                ...(hasManageCallManagerPermissions
                  ? [
                    {
                      uri: '/videoCallQoe',
                      label: $t({ defaultMessage: 'Video Call QoE' })
                    }
                  ]
                  : []),
                {
                  uri: '/occupancy',
                  label: $t({ defaultMessage: 'Occupancy' }),
                  isOpenInTab: true
                }
              ]
            }
          ]
        }
      ]
      : []),
    ...(hasViewDataExplorerPermission
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
    {
      label: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
      children: [
        {
          type: 'group' as const,
          label: $t({ defaultMessage: 'Account Management' }),
          children: [
            ...(hasManageMlisaPermission
              ? [{
                uri: '/admin/onboarded',
                label: $t({ defaultMessage: 'Onboarded Systems' }),
                isOpenInTab: true
              },
              {
                uri: '/admin/users',
                label: $t({ defaultMessage: 'Users' }),
                isOpenInTab: true
              }] : []),
            ...(hasManageLabelPermission
              ? [{
                uri: '/admin/labels',
                label: $t({ defaultMessage: 'Labels' }),
                isOpenInTab: true
              }] : []),
            ...(hasManageMlisaPermission
              ? [
                {
                  uri: '/admin/resourceGroups',
                  label: $t({ defaultMessage: 'Resource Groups' }),
                  isOpenInTab: true
                },
                {
                  uri: '/admin/support',
                  label: $t({ defaultMessage: 'Support' }),
                  isOpenInTab: true
                },
                {
                  uri: '/admin/license',
                  label: $t({ defaultMessage: 'Licenses' }),
                  isOpenInTab: true
                }] : []),
            ...(hasFranchisorSetting
              ? [{
                uri: '/admin/schedules',
                label: $t({ defaultMessage: 'Schedules' }),
                isOpenInTab: true
              }] : []),
            ...(hasViewAnalyticsPermissions && hasManageMlisaPermission
              ? [{
                uri: '/admin/webhooks',
                label: $t({ defaultMessage: 'Webhooks' }),
                isOpenInTab: true
              }] : [])
          ]
        }
      ]
    }
  ]
  return config
}
