import styled from 'styled-components/macro'

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

import { genPlaceholder, LayoutProps } from '..'
import { LayoutUI }                    from '../styledComponents'

const AIOutlined = styled(AIOutlinedBase)`${LayoutUI.iconOutlinedOverride}`
const AISolid = styled(AISolidBase)`${LayoutUI.iconOutlinedOverride}`
const AdminSolid = styled(AdminSolidBase)`${LayoutUI.iconSolidOverride}`
const ServicesSolid = styled(ServicesSolidBase)`${LayoutUI.iconSolidOverride}`
const PoliciesSolid = styled(PoliciesSolidBase)`${LayoutUI.iconSolidOverride}`

const config: LayoutProps['menuConfig'] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    inactiveIcon: SpeedIndicatorOutlined,
    activeIcon: SpeedIndicatorSolid
  },
  {
    path: '/analytics',
    name: 'AI Analytics',
    inactiveIcon: AIOutlined,
    activeIcon: AISolid,
    routes: [
      {
        path: '/analytics/incidents',
        name: 'Incidents'
      },
      {
        path: '/analytics/recommendations',
        name: 'Recommendations'
      },
      {
        path: '/analytics/health',
        name: 'Health'
      },
      {
        path: '/analytics/configChange',
        name: 'Config Change'
      },
      {
        path: '/analytics/occupancy',
        name: 'Occupancy'
      }
    ]
  },
  {
    path: '/timeline',
    name: 'Timeline',
    inactiveIcon: CalendarDateOutlined,
    activeIcon: CalendarDateSolid
  },
  {
    path: '/reports',
    name: 'Reports',
    inactiveIcon: ReportsOutlined,
    activeIcon: ReportsSolid
  },
  genPlaceholder(),
  {
    path: '/venues',
    name: 'Venues',
    inactiveIcon: LocationOutlined,
    activeIcon: LocationSolid
  },
  {
    path: '/devices',
    name: 'Device Inventory',
    inactiveIcon: DevicesOutlined,
    activeIcon: DevicesSolid
  },
  {
    path: '/networks',
    name: 'Networks',
    inactiveIcon: NetworksOutlined,
    activeIcon: NetworksSolid
  },
  {
    path: '/services',
    name: 'Services',
    inactiveIcon: ServicesOutlined,
    activeIcon: ServicesSolid
  },
  {
    path: '/policies',
    name: 'Policies',
    inactiveIcon: PoliciesOutlined,
    activeIcon: PoliciesSolid
  },
  {
    path: '/users',
    name: 'Users',
    inactiveIcon: AccountCircleOutlined,
    activeIcon: AccountCircleSolid,
    disabled: true
  },
  genPlaceholder(),
  {
    path: '/administration',
    name: 'Administration',
    inactiveIcon: AdminOutlined,
    activeIcon: AdminSolid
  }
]

export default config
