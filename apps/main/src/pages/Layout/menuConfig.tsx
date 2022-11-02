import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { LayoutProps, LayoutUI, genPlaceholder } from '@acx-ui/components'
import {
  AIOutlined as AIOutlinedBase,
  AISolid as AISolidBase,
  AccountCircleOutlined,
  AccountCircleSolid,
  AdminOutlined,
  AdminSolid as AdminSolidBase,
  CalendarDateOutlined,
  CalendarDateSolid,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  NetworksOutlined,
  NetworksSolid,
  PoliciesOutlined,
  PoliciesSolid as PoliciesSolidBase,
  ReportsOutlined,
  ReportsSolid,
  ServicesOutlined,
  ServicesSolid as ServicesSolidBase,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'

const AIOutlined = styled(AIOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const AISolid = styled(AISolidBase)`${LayoutUI.iconOutlinedOverride}`
const AdminSolid = styled(AdminSolidBase)`${LayoutUI.iconSolidOverride}`
const ServicesSolid = styled(ServicesSolidBase)`${LayoutUI.iconSolidOverride}`
const PoliciesSolid = styled(PoliciesSolidBase)`${LayoutUI.iconSolidOverride}`

export function useMenuConfig () {
  const { $t } = useIntl()
  const config: LayoutProps['menuConfig'] = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid
    },
    {
      path: '/analytics',
      name: $t({ defaultMessage: 'AI Analytics' }),
      inactiveIcon: AIOutlined,
      activeIcon: AISolid,
      routes: [
        {
          path: '/analytics/incidents',
          name: $t({ defaultMessage: 'Incidents' })
        },
        // TODO: add back when needed, comment for now
        // {
        //   path: '/analytics/recommendations',
        //   name: $t({ defaultMessage: 'Recommendations' })
        // },
        {
          path: '/analytics/health',
          name: $t({ defaultMessage: 'Health' })
        }
        // TODO: add back when needed, comment for now
        // {
        //   path: '/analytics/configChange',
        //   name: $t({ defaultMessage: 'Config Change' })
        // }
      ]
    },
    {
      path: '/timeline',
      name: $t({ defaultMessage: 'Timeline' }),
      inactiveIcon: CalendarDateOutlined,
      activeIcon: CalendarDateSolid,
      disabled: true
    },
    {
      path: '/reports',
      name: $t({ defaultMessage: 'Reports' }),
      inactiveIcon: ReportsOutlined,
      activeIcon: ReportsSolid,
      disabled: true
    },
    genPlaceholder(),
    {
      path: '/venues',
      name: $t({ defaultMessage: 'Venues' }),
      inactiveIcon: LocationOutlined,
      activeIcon: LocationSolid
    },
    {
      path: '/devices',
      name: $t({ defaultMessage: 'Devices' }),
      inactiveIcon: DevicesOutlined,
      activeIcon: DevicesSolid,
      // TODO: add back when needed, comment for now
      routes: [
        {
          path: '/devices/aps',
          name: $t({ defaultMessage: 'WiFi' })
        },
        {
          path: '/devices/switches',
          name: $t({ defaultMessage: 'Switch' })
        }
      ],
      // disabled: true
    },
    {
      path: '/networks',
      name: $t({ defaultMessage: 'Networks' }),
      inactiveIcon: NetworksOutlined,
      activeIcon: NetworksSolid
    },
    {
      path: '/services',
      name: $t({ defaultMessage: 'Services' }),
      inactiveIcon: ServicesOutlined,
      activeIcon: ServicesSolid,
      disabled: true
    },
    {
      path: '/policies',
      name: $t({ defaultMessage: 'Policies' }),
      inactiveIcon: PoliciesOutlined,
      activeIcon: PoliciesSolid,
      disabled: true
    },
    {
      path: '/users',
      name: $t({ defaultMessage: 'Users' }),
      inactiveIcon: AccountCircleOutlined,
      activeIcon: AccountCircleSolid,
      disabled: true
    },
    genPlaceholder(),
    {
      path: '/administration',
      name: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: AdminOutlined,
      activeIcon: AdminSolid,
      disabled: true
    }
  ]
  return config
}
