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
      disableIcon: SpeedIndicatorOutlined,
      enableIcon: SpeedIndicatorSolid
    },
    {
      path: '/analytics',
      name: $t({ defaultMessage: 'AI Analytics' }),
      disableIcon: AI,
      enableIcon: AI,
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
      disableIcon: CalendarDateOutlined,
      enableIcon: CalendarDateSolid
    },
    {
      path: '/reports',
      name: $t({ defaultMessage: 'Reports' }),
      disableIcon: ReportsOutlined,
      enableIcon: ReportsSolid
    },
    genPlaceholder(),
    {
      path: '/venues',
      name: $t({ defaultMessage: 'Venues' }),
      disableIcon: LocationOutlined,
      enableIcon: LocationSolid
    },
    {
      path: '/devices',
      name: $t({ defaultMessage: 'Devices' }),
      disableIcon: DevicesOutlined,
      enableIcon: DevicesSolid
    },
    {
      path: '/networks',
      name: $t({ defaultMessage: 'Networks' }),
      disableIcon: NetworksOutlined,
      enableIcon: NetworksSolid
    },
    {
      path: '/services',
      name: $t({ defaultMessage: 'Services' }),
      disableIcon: ServicesOutlined,
      enableIcon: ServicesSolid
    },
    {
      path: '/policies',
      name: $t({ defaultMessage: 'Policies' }),
      disableIcon: ServicesOutlined,
      enableIcon: ServicesSolid
    },
    {
      path: '/users',
      name: $t({ defaultMessage: 'Users' }),
      disableIcon: AccountCircleOutlined,
      enableIcon: AccountCircleSolid
    },
    genPlaceholder(),
    {
      path: '/administration',
      name: $t({ defaultMessage: 'Administration' }),
      disableIcon: ConfigurationOutlined,
      enableIcon: ConfigurationSolid
    }
  ]
  return config
}
