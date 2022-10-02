import styled from 'styled-components/macro'

import {
  AI as AIOriginal,
  AccountCircleOutlined,
  AccountCircleSolid,
  CalendarDateOutlined,
  CalendarDateSolid,
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  NetworksOutlined,
  NetworksSolid,
  ReportsOutlined,
  ReportsSolid,
  ServicesOutlined,
  ServicesSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'

import { genPlaceholder } from '..'

const AI = styled(AIOriginal)`
  path { stroke: none !important; }
`

const config = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    inactiveIcon: SpeedIndicatorOutlined,
    activeIcon: SpeedIndicatorSolid
  },
  {
    path: '/analytics',
    name: 'AI Analytics',
    inactiveIcon: AI,
    activeIcon: AI,
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
    inactiveIcon: ServicesOutlined,
    activeIcon: ServicesSolid
  },
  {
    path: '/users',
    name: 'Users',
    inactiveIcon: AccountCircleOutlined,
    activeIcon: AccountCircleSolid
  },
  genPlaceholder(),
  {
    path: '/administration',
    name: 'Administration',
    inactiveIcon: ConfigurationOutlined,
    activeIcon: ConfigurationSolid
  }
]

export default config
