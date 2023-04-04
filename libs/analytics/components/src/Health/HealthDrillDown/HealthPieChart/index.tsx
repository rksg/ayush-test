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
import { DrilldownSelection, Stages } from '../config'
import { NetworkPath } from '@acx-ui/utils'
import { isNull } from 'lodash'
import * as UI from './styledComponents'

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
    let { wlans: rawWlans, nodes: rawNodes } = data.network.hierarchyNode
    rawNodes = rawNodes ?? []
    switch (queryType) {
      case 'connectionFailure': {
        const nodes = rawNodes.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        .slice(0, 5)
        const wlans = rawWlans.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        .slice(0, 5)
        return { nodes, wlans }
      }
      case 'ttc': {
        const nodes = rawNodes.map((node, index) => ({
          ...node,
          name: node.key,
          color: colors[index]
        }))
        .slice(0, 5)
        const wlans = rawWlans.map((node, index) => ({
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
      dataFormatter={dataFormatter}
      showLabel
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
  const singularNetwork = pieNodeMap(path)
  const venueTitle = nodes.length > 1 ? singularNetwork + 's' : singularNetwork
  const wlansTitle = wlans.length > 1 ? 'WLANs' : 'WLAN'

  const tabDetails: ContentSwitcherProps['tabDetails'] = []
  if (nodes.length > 1) {
    tabDetails.push(
    {
      label: $t({ defaultMessage: '{venueTitle}' }, { venueTitle }),
      value: 'nodes',
      children: (
       <UI.HealthPieChartWrapper>
        <Card
          type='no-border'
          title={$t(
            { defaultMessage: 'Top {count} Impacted {venueTitle}' },
            { count: nodes.length, venueTitle }
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
       </UI.HealthPieChartWrapper>
      )
    })
  }

  tabDetails.push(
    {
      label: $t({ defaultMessage: '{wlansTitle}' }, { wlansTitle }),
      value: 'wlans',
      children: (
        <UI.HealthPieChartWrapper>
        <Card
          type='no-border'
          title={$t(
            { defaultMessage: 'Top {count} Impacted {wlansTitle}' },
            { count: wlans.length, wlansTitle }
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
        </UI.HealthPieChartWrapper>
      )
    })

  return (
    <Loader states={[queryResults]}>
      <ContentSwitcher tabDetails={tabDetails} size='small' />
    </Loader>
  )
}
