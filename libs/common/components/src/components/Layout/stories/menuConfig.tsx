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
    disableIcon: SpeedIndicatorOutlined,
    enableIcon: SpeedIndicatorSolid
  },
  {
    path: '/analytics',
    name: 'AI Analytics',
    disableIcon: AI,
    enableIcon: AI,
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
    disableIcon: CalendarDateOutlined,
    enableIcon: CalendarDateSolid
  },
  {
    path: '/reports',
    name: 'Reports',
    disableIcon: ReportsOutlined,
    enableIcon: ReportsSolid
  },
  genPlaceholder(),
  {
    path: '/venues',
    name: 'Venues',
    disableIcon: LocationOutlined,
    enableIcon: LocationSolid
  },
  {
    path: '/devices',
    name: 'Device Inventory',
    disableIcon: DevicesOutlined,
    enableIcon: DevicesSolid
  },
  {
    path: '/networks',
    name: 'Networks',
    disableIcon: NetworksOutlined,
    enableIcon: NetworksSolid
  },
  {
    path: '/services',
    name: 'Services',
    disableIcon: ServicesOutlined,
    enableIcon: ServicesSolid
  },
  {
    path: '/policies',
    name: 'Policies',
    disableIcon: ServicesOutlined,
    enableIcon: ServicesSolid
  },
  {
    path: '/users',
    name: 'Users',
    disableIcon: AccountCircleOutlined,
    enableIcon: AccountCircleSolid
  },
  genPlaceholder(),
  {
    path: '/administration',
    name: 'Administration',
    disableIcon: ConfigurationOutlined,
    enableIcon: ConfigurationSolid
  }
]

export default config
