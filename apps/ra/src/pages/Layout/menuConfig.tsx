import { useIntl } from 'react-intl'

import {
  useUserProfileContext,
  Tenant,
  PERMISSION_VIEW_ANALYTICS,
  PERMISSION_VIEW_REPORT_CONTROLLER_INVENTORY,
  PERMISSION_VIEW_DATA_EXPLORER,
  PERMISSION_MANAGE_SERVICE_GUARD,
  PERMISSION_MANAGE_MLISA,
  PERMISSION_MANAGE_CALL_MANAGER,
  PERMISSION_MANAGE_OCCUPANCY,
  PERMISSION_MANAGE_CONFIG_RECOMMENDATION,
  PERMISSION_MANAGE_LABEL,
  PERMISSION_MANAGE_TENANT_SETTINGS
} from '@acx-ui/analytics/utils'
import { LayoutProps } from '@acx-ui/components'
import {
  AIOutlined,
  AISolid,
  AdminOutlined,
  AdminSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid,
  ServiceGuardSolid,
  ServiceGuardOutlined,
  DataStudioOutlined,
  DataStudioSolid,
  ReportsOutlined,
  ReportsSolid
} from '@acx-ui/icons'

export function useMenuConfig () {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const currentAccountPermissions = userProfile?.tenants?.filter(
    // Hardcoded to current account for now
    (tenent : Tenant) => tenent.id === userProfile?.accountId
  )[0].permissions
  const config: LayoutProps['menuConfig'] = [
    ...(currentAccountPermissions?.[PERMISSION_VIEW_ANALYTICS] ? [{
      uri: '/dashboard',
      label: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid
    },
    {
      label: $t({ defaultMessage: 'AI Analytics' }),
      inactiveIcon: AIOutlined,
      activeIcon: AISolid,
      children: [
        {
          uri: '/incidents',
          label: $t({ defaultMessage: 'Incidents' })
        },
        {
          uri: '/health',
          label: $t({ defaultMessage: 'Health' })
        }
      ]
    }]: []),
    {
      //PERMISSION_MANAGE_SERVICE_GUARD
      label: $t({ defaultMessage: 'AI Assurance' }),
      inactiveIcon: ServiceGuardOutlined,
      activeIcon: ServiceGuardSolid,
      children: [
        {
          uri: '/serviceValidation',
          label: $t({ defaultMessage: 'Service Validation' })
        },
        // PERMISSION_MANAGE_CALL_MANAGER
        {
          uri: '/videoCallQoe',
          label: $t({ defaultMessage: 'Video Call QoE' })
        }
      ]
    },
    //PERMISSION_FRANCHISOR
    //PERMISSION_VIEW_REPORT_CONTROLLER_INVENTORY
    //PERMISSION_VIEW_DATA_EXPLORER
    {
      label: $t({ defaultMessage: 'Reports' }),
      inactiveIcon: ReportsOutlined,
      activeIcon: ReportsSolid,
      uri: '/reports'
    },
    //PERMISSION_VIEW_DATA_EXPLORER
    {
      label: $t({ defaultMessage: 'Data Studio' }),
      inactiveIcon: DataStudioOutlined,
      activeIcon: DataStudioSolid,
      uri: '/dataStudio'
    },
    //PERMISSION_MANAGE_MLISA
    {
      label: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
      children: [
        { uri: '/admin/', label: $t({ defaultMessage: 'Admin' }) }
      ]
    }
  ]
  return config
}
