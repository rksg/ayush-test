import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { LayoutProps, LayoutUI, genPlaceholder } from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
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
      disabled: !useIsSplitOn(Features.TIMELINE)
    },
    {
      path: '/reports',
      name: $t({ defaultMessage: 'Reports' }),
      inactiveIcon: ReportsOutlined,
      activeIcon: ReportsSolid,
      disabled: false,
      routes: [
        {
          path: '/reports/overview',
          name: $t({ defaultMessage: 'Overview' })
        },
        {
          path: '/reports/network/wireless',
          name: $t({ defaultMessage: 'Network' })
        },
        {
          path: '/reports/aps',
          name: $t({ defaultMessage: 'APs' })
        },
        {
          path: '/reports/switches',
          name: $t({ defaultMessage: 'Switches' })
        },
        {
          path: '/reports/wlans',
          name: $t({ defaultMessage: 'WLANs' })
        },
        {
          path: '/reports/clients',
          name: $t({ defaultMessage: 'Wireless Clients' })
        },
        {
          path: '/reports/applications',
          name: $t({ defaultMessage: 'Applications' })
        },
        {
          path: '/reports/airtime',
          name: $t({ defaultMessage: 'Airtime Utilization' })
        }
      ]
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
      routes:
        [
          {
            path: '/devices/wifi',
            name: $t({ defaultMessage: 'WiFi' })
          },
          {
            path: '/devices/switch',
            name: $t({ defaultMessage: 'Switch' }),
            disabled: !useIsSplitOn(Features.DEVICES)
          },
          {
            path: '/devices/edge/list',
            name: $t({ defaultMessage: 'Edge' }),
            disabled: !useIsSplitOn(Features.EDGES)
          }
        ]
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
      disabled: !useIsSplitOn(Features.SERVICES)
    },
    {
      path: '/policies',
      name: $t({ defaultMessage: 'Policies' }),
      inactiveIcon: PoliciesOutlined,
      activeIcon: PoliciesSolid,
      disabled: !useIsSplitOn(Features.POLICIES)
    },
    {
      path: '/users',
      name: $t({ defaultMessage: 'Users' }),
      inactiveIcon: AccountCircleOutlined,
      activeIcon: AccountCircleSolid,
      routes: [
        {
          path: '/users/wifi',
          name: $t({ defaultMessage: 'WiFi' })
        },
        {
          path: '/users/switch',
          name: $t({ defaultMessage: 'Switch' }),
          disabled: !useIsSplitOn(Features.USERS)
        }
      ]
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
