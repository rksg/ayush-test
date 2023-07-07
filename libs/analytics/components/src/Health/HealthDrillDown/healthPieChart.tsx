import { useEffect, useState } from 'react'

import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'
import AutoSizer                                     from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, getSelectedNodePath } from '@acx-ui/analytics/utils'
import {
  ContentSwitcher,
  ContentSwitcherProps,
  DonutChart,
  Loader,
  NoData,
  qualitativeColorSet
} from '@acx-ui/components'
import { get }         from '@acx-ui/config'
import { formatter }   from '@acx-ui/formatter'
import { NodesFilter } from '@acx-ui/utils'

import {
  Stages,
  stageLabels,
  DrilldownSelection,
  stageNameToCodeMap,
  showTopResult
} from './config'
import { ImpactedNodesAndWlans, usePieChartQuery } from './services'
import * as UI                                     from './styledComponents'

const topCount = 5

type PieChartData = {
  key: string
  value: number
  name: string
  color: string
}

function getTopPieChartData (nodeData: Omit<PieChartData, 'color' | 'name'>[])
: PieChartData[] {
  const colors = qualitativeColorSet()
  return nodeData
    .map((val, index) => ({
      ...val,
      name: val.key,
      color: colors[index]
    }))
}

const transformData = (
  data: ImpactedNodesAndWlans | undefined
): {
  nodes: PieChartData[];
  wlans: PieChartData[];
} => {
  if (data) {
    let { wlans: rawWlans, nodes: rawNodes } = data.network.hierarchyNode
    const nodes = rawNodes ? getTopPieChartData(rawNodes) : []
    const wlans = getTopPieChartData(rawWlans)
    return { nodes, wlans }
  }
  return { nodes: [], wlans: [] }
}

export function pieNodeMap (filter: NodesFilter): MessageDescriptor {
  const isMLISA = get('IS_MLISA_SA')
  const node = getSelectedNodePath(filter)
  switch (node[node.length - 1].type) {
    case 'zone':
      return defineMessage({ defaultMessage: `{ count, plural,
        one {AP Group}
        other {AP Groups}
      }` })
    case 'AP':
      return defineMessage({ defaultMessage: `{ count, plural,
        one {AP}
        other {APs}
      }` })
    default:
      return !isMLISA ?
        defineMessage({ defaultMessage: `{ count, plural,
        one {Venue}
        other {Venues}
      }` })
        : defineMessage({ defaultMessage: `{ count, plural,
        one {Zone}
        other {Zones}
      }` })
  }
}

function pieWlanMap () {
  return defineMessage({ defaultMessage: ` { count, plural,
    one {WLAN}
    other {WLANs}
  }` })
}

export const tooltipFormatter = (
  total: number,
  dataFormatter: (value: unknown, tz?: string | undefined) => string
) => (value: unknown) =>
  `${formatter('percentFormat')(value as number / total)}(${dataFormatter(value)})`

function getHealthPieChart (
  data: { key: string; value: number; name: string; color: string }[],
  dataFormatter: (value: unknown, tz?: string | undefined) => string
) {
  const tops = data.slice(0, topCount)
  const total = tops.reduce((total, { value }) => value + total, 0)
  return (
    data.length > 0
      ? <AutoSizer defaultHeight={150}>
        {({ width, height }) => (
          <DonutChart
            data={tops}
            style={{ height, width }}
            legend='name'
            size={'x-large'}
            showLegend
            showTotal={false}
            dataFormatter={tooltipFormatter(total, dataFormatter)}
          />
        )}
      </AutoSizer>
      : <NoData />
  )
}

export const HealthPieChart = ({
  filters,
  queryType,
  selectedStage,
  valueFormatter
}: {
  filters: AnalyticsFilter
  queryType: DrilldownSelection
  selectedStage: Stages
  valueFormatter: (value: unknown, tz?: string | undefined) => string
}) => {
  const { $t } = useIntl()
  const { startDate: start, endDate: end, filter } = filters
  const queryResults = usePieChartQuery(
    {
      start,
      end,
      filter,
      queryType: queryType as string,
      queryFilter: stageNameToCodeMap[selectedStage]
    }
  )
  const { nodes, wlans } = transformData(queryResults.data)
  const venueTitle = $t(pieNodeMap(filter), { count: nodes.length })
  const wlansTitle = $t(pieWlanMap(), { count: wlans.length })
  const tabDetails: ContentSwitcherProps['tabDetails'] = [{
    label: wlansTitle,
    value: 'wlans',
    children: getHealthPieChart(wlans, valueFormatter)
  }]
  if (nodes.length > 0) {
    tabDetails.unshift({
      label: venueTitle,
      value: 'nodes',
      children: getHealthPieChart(nodes, valueFormatter)
    })
  }
  const [chartKey, setChartKey] = useState('wlans')
  const count = showTopResult($t, chartKey === 'wlans' ? wlans.length : nodes.length, topCount)
  const title = chartKey === 'wlans' ? wlansTitle : venueTitle

  useEffect(() => { setChartKey(tabDetails.length === 2 ? 'nodes' : 'wlans') }, [tabDetails.length])

  return (
    <Loader states={[queryResults]}>
      <UI.HealthPieChartWrapper>
        <UI.PieChartTitle>
          <b>{$t(stageLabels[selectedStage])}</b>{' '}
          {$t({ defaultMessage: '{count} Impacted {title}' }, { count, title })}
        </UI.PieChartTitle>
        <div style={{ height: 260, minWidth: 430 }}>
          {(tabDetails.length === 2)
            ? <ContentSwitcher
              key={selectedStage}
              value={chartKey}
              defaultValue={'wlans'}
              tabDetails={tabDetails}
              align='center'
              size='small'
              onChange={key => setChartKey(key)}
            />
            : <UI.SinglePieChartWrapper>
              {tabDetails[0].children}
            </UI.SinglePieChartWrapper>
          }
        </div>
      </UI.HealthPieChartWrapper>
    </Loader>
  )
}
