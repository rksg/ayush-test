import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  ContentSwitcher,
  ContentSwitcherProps,
  DonutChart,
  Loader,
  qualitativeColorSet
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import { ImpactedNodesAndWlans, usePieChartQuery } from './services'

const transformData = (
  data: ImpactedNodesAndWlans | undefined,
  queryType: string
): {
  nodes: {
    key: string;
    value: number;
    name: string;
    color: string;
  }[];
  wlans: {
    key: string;
    value: number;
    name: string;
    color: string;
  }[];
} => {
  if (data) {
    const colors = qualitativeColorSet()
    switch (queryType) {
      case 'connectionFailure': {
        const nodes = data.network.hierarchyNode.nodes.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        const wlans = data.network.hierarchyNode.wlans.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        return { nodes, wlans }
      }
      case 'timeToConnect': {
        const nodes = data.network.hierarchyNode.nodes.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        const wlans = data.network.hierarchyNode.wlans.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        return { nodes, wlans }
      }
      default:
        return { nodes: [], wlans: [] }
    }
  }
  return { nodes: [], wlans: [] }
}

function getHealthPieChart (
  data: { key: string; value: number; name: string; color: string }[],
  height: number,
  width: number,
  dataFormatter: (value: unknown, tz?: string | undefined) => string
) {
  return (
    <DonutChart
      data={data}
      style={{ height, width }}
      showLegend={false}
      dataFormatter={dataFormatter}
    />
  )
}

export const HealthPieChart = ({
  queryType = 'connectionFailure',
  queryFilter = 'connectionFailure'
}) => {
  const { $t } = useIntl()
  const analyticsFilter = useAnalyticsFilter()
  const { startDate: start, endDate: end, path } = analyticsFilter.filters
  const queryResults = usePieChartQuery({
    start,
    end,
    path,
    queryType,
    queryFilter
  })

  const { nodes, wlans } = transformData(queryResults.data, queryType)
  const venues = nodes.length > 1 ? 'Venues' : 'Venue'
  const venueTitle = nodes.length > 1
    ? 'TOP {count} IMPACTED {venues}'
    : '{count} IMPACTED {venues}'
  const networks = wlans.length > 1 ? 'Networks' : 'Network'

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: '{venues}' }, { venues }),
      value: 'nodes',
      children: (
        <Card
          type='no-border'
          title={$t(
            { defaultMessage: venueTitle },
            { count: wlans.length, venues }
          )}
        >
          <AutoSizer>
            {({ height, width }) =>
              getHealthPieChart(wlans, height, width, formatter('countFormat'))
            }
          </AutoSizer>
        </Card>
      )
    },
    {
      label: $t({ defaultMessage: '{networks}' }, { networks }),
      value: 'wlans',
      children: (
        <Card
          type='no-border'
          title={$t(
            { defaultMessage: 'Top {count} Impacted {networks}' },
            { count: nodes.length, networks }
          )}
        >
          <AutoSizer>
            {({ height, width }) =>
              getHealthPieChart(
                wlans,
                height,
                width,
                formatter('durationFormat')
              )
            }
          </AutoSizer>
        </Card>
      )
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <ContentSwitcher tabDetails={tabDetails} size='small' />
    </Loader>
  )
}
