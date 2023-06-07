import { useIntl } from 'react-intl'

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
  // const permissions = {}
  const config: LayoutProps['menuConfig'] = [
    {
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
    },
    {
      label: $t({ defaultMessage: 'AI Assurance' }),
      inactiveIcon: ServiceGuardOutlined,
      activeIcon: ServiceGuardSolid,
      children: [
        {
          uri: '/serviceValidation',
          label: $t({ defaultMessage: 'Service Validation' })
        },
        {
          uri: '/videoCallQoe',
          label: $t({ defaultMessage: 'Video Call QoE' })
        }
      ]
    },
    {
      label: $t({ defaultMessage: 'Reports' }),
      inactiveIcon: ReportsOutlined,
      activeIcon: ReportsSolid,
      uri: '/reports'
    },
    {
      label: $t({ defaultMessage: 'Data Studio' }),
      inactiveIcon: DataStudioOutlined,
      activeIcon: DataStudioSolid,
      uri: '/dataStudio'
    },
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
