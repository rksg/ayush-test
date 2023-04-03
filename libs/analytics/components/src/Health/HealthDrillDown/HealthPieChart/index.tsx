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
import { DrilldownSelection, stageNameToCodeMap, Stages } from '../config'
import { NetworkPath } from '@acx-ui/utils'
import { isNull } from 'lodash'

const transformData = (
  data: ImpactedNodesAndWlans | undefined,
  queryType: DrilldownSelection
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
        .slice(0, 5)
        const wlans = data.network.hierarchyNode.wlans.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        .slice(0, 5)
        return { nodes, wlans }
      }
      case 'ttc': {
        const nodes = data.network.hierarchyNode.nodes.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        .slice(0, 5)
        const wlans = data.network.hierarchyNode.wlans.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        .slice(0, 5)
        return { nodes, wlans }
      }
      default:
        return { nodes: [], wlans: [] }
    }
  }
  return { nodes: [], wlans: [] }
}

function pieNodeMap (node: NetworkPath) {
   const lastPath = node[node.length - 1]
   const type = lastPath.type
   switch (type) {
      case 'zone':
        return 'AP Group'
      case 'ap':
      case 'AP':
        return 'AP'
      default:
        return 'Venue'
   }
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
      showLabel
      dataFormatter={dataFormatter}
    />
  )
}

export const HealthPieChart = ({
  queryType,
  queryFilter,
}: {
  queryType: DrilldownSelection,
  queryFilter: Stages
}) => {
  const { $t } = useIntl()
  const analyticsFilter = useAnalyticsFilter()
  const { startDate: start, endDate: end, path } = analyticsFilter.filters
  const queryResults = usePieChartQuery({
    start,
    end,
    path,
    queryType: queryType as string,
    queryFilter: queryFilter!.toLowerCase(),
  }, {
    skip: isNull(queryFilter)
  })

  const { nodes, wlans } = transformData(queryResults.data, queryType)
  const venues = nodes.length > 1 ? 'Venues' : 'Venue'
  const networks = pieNodeMap(path)

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: '{venues}' }, { venues }),
      value: 'nodes',
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
                nodes,
                height,
                width,
                formatter('countFormat'))
            }
          </AutoSizer>
        </Card>
      )
    },
    {
      label: $t({ defaultMessage: '{networks}' }, { networks: 'WLAN' }),
      value: 'wlans',
      children: (
        <Card
          type='no-border'
          title={$t(
            { defaultMessage: 'Top {count} Impacted {networks}' },
            { count: wlans.length, networks: 'WLANs' }
          )}
        >
          <AutoSizer>
            {({ height, width }) =>
              getHealthPieChart(
                wlans,
                height,
                width,
                formatter('durationFormat'))
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
