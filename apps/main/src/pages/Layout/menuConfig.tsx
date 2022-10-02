import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { genPlaceholder } from '@acx-ui/components'
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

const AI = styled(AIOriginal)`
  path { stroke: none !important; }
`

export function useMenuConfig () {
  const { $t } = useIntl()
  const config = [
    {
      path: '/dashboard',
      name: $t({ defaultMessage: 'Dashboard' }),
      inactiveIcon: SpeedIndicatorOutlined,
      activeIcon: SpeedIndicatorSolid
    },
    {
      path: '/analytics',
      name: $t({ defaultMessage: 'AI Analytics' }),
      inactiveIcon: AI,
      activeIcon: AI,
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
      activeIcon: CalendarDateSolid
    },
    {
      path: '/reports',
      name: $t({ defaultMessage: 'Reports' }),
      inactiveIcon: ReportsOutlined,
      activeIcon: ReportsSolid
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
      activeIcon: DevicesSolid
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
      activeIcon: ServicesSolid
    },
    {
      path: '/policies',
      name: $t({ defaultMessage: 'Policies' }),
      inactiveIcon: ServicesOutlined,
      activeIcon: ServicesSolid
    },
    {
      path: '/users',
      name: $t({ defaultMessage: 'Users' }),
      inactiveIcon: AccountCircleOutlined,
      activeIcon: AccountCircleSolid
    },
    genPlaceholder(),
    {
      path: '/administration',
      name: $t({ defaultMessage: 'Administration' }),
      inactiveIcon: ConfigurationOutlined,
      activeIcon: ConfigurationSolid
    }
  ]
  return config
}
