import { useEffect, useState } from 'react'

import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'
import AutoSizer                                     from 'react-virtualized-auto-sizer'


import { getSelectedNodePath, mapCodeToReason } from '@acx-ui/analytics/utils'
import {
  ContentSwitcher,
  ContentSwitcherProps,
  DonutChart,
  Loader,
  NoData,
  qualitativeColorSet
} from '@acx-ui/components'
import { get }                  from '@acx-ui/config'
import { formatter }            from '@acx-ui/formatter'
import { NodesFilter }          from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

import {
  Stages,
  stageLabels,
  DrilldownSelection,
  stageNameToCodeMap,
  showTopResult
} from './config'
import { ImpactedEntities, usePieChartQuery } from './services'
import * as UI                                from './styledComponents'

const topCount = 5

type PieChartData = {
  key: string
  value: number
  name: string
  color: string
}

type TabKeyType = 'wlans'|'nodes'|'events' | 'osManufacturers'
type NodeData = {
  key: string
  value: number
  name?: string | null
}
function getTopPieChartData (nodeData: NodeData[])
: PieChartData[] {
  const colors = qualitativeColorSet()
  return nodeData
    .map((val, index) => ({
      ...val,
      name: val.name ? `${val.name} (${val.key})` : val.key,
      color: colors[index]
    }))
}

export const transformData = (
  data: ImpactedEntities | undefined
): {
  nodes: PieChartData[];
  wlans: PieChartData[];
  events: PieChartData[];
  osManufacturers: PieChartData[];
} => {
  if (data) {
    let { wlans: rawWlans, nodes: rawNodes, osManufacturers } = data.network.hierarchyNode
    const nodes = rawNodes ? getTopPieChartData(rawNodes) : []
    const wlans = getTopPieChartData(rawWlans)
    const events = data.network.hierarchyNode.events
      ? getTopPieChartData(data.network.hierarchyNode.events).map((event) => ({
        ...event,
        key: mapCodeToReason(event.key),
        name: mapCodeToReason(event.name)
      }))
      : []
    const osManufacturersData = getTopPieChartData(osManufacturers)

    return { nodes, wlans, events, osManufacturers: osManufacturersData }
  }
  return { nodes: [], wlans: [],events: [], osManufacturers: [] }
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
    case 'apGroup':
      return defineMessage({ defaultMessage: `{ count, plural,
        one {AP}
        other {APs}
      }` })
    default:
      return !isMLISA ?
        defineMessage({ defaultMessage: `{ count, plural,
        one {<VenueSingular></VenueSingular>}
        other {<VenuePlural></VenuePlural>}
      }` })
        : defineMessage({ defaultMessage: `{ count, plural,
        one {Zone}
        other {Zones}
      }` })
  }
}

const pieIntlMap = (type: Exclude<TabKeyType, 'nodes'>) => {
  const messages: Record<Exclude<TabKeyType, 'nodes'>, { defaultMessage: string }> = {
    events: defineMessage({ defaultMessage: '{ count, plural, one {Event} other {Events} }' }),
    wlans: defineMessage({ defaultMessage: '{ count, plural, one {WLAN} other {WLANs} }' }),
    osManufacturers: defineMessage({
      defaultMessage: '{ count, plural, one {Manufacturer} other {Manufacturers} }'
    })
  }
  return messages[type]
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
  const [chartKey, setChartKey] = useState<TabKeyType>('wlans')
  const { nodes, wlans, events, osManufacturers } = transformData(queryResults.data)

  const titleMap = {
    wlans: $t(pieIntlMap('wlans'), { count: wlans.length }),
    nodes: $t(pieNodeMap(filter), { count: nodes.length }),
    events: $t(pieIntlMap('events'), { count: events.length }),
    osManufacturers: $t(pieIntlMap('osManufacturers'), { count: osManufacturers.length })
  }
  const tabsList = [
    ...(nodes.length > 0 ? [{ key: 'nodes', data: nodes }] : []),
    { key: 'wlans', data: wlans },
    { key: 'events', data: events },
    { key: 'osManufacturers', data: osManufacturers }
  ]

  const tabDetails: ContentSwitcherProps['tabDetails'] = tabsList
    .filter(({ key }) => !(key === 'events' && queryType === 'ttc'))
    .map(({ key, data }) => ({
      label: titleMap[key as TabKeyType],
      value: key,
      children: getHealthPieChart(data, valueFormatter)
    }))
  const count = showTopResult(
    $t,
    tabsList.find((tab) => tab.key === chartKey)?.data.length as number,
    topCount
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setChartKey(tabDetails?.[0]?.value as TabKeyType) }, [tabDetails.length])

  return (
    <Loader states={[queryResults]}>
      <UI.HealthPieChartWrapper>
        <UI.PieChartTitle>
          <b>{$t(stageLabels[selectedStage])}</b>{' '}
          {chartKey === 'events'
            ? $t(
              { defaultMessage: '{count} {title}' },
              { count, title: titleMap[chartKey] }
            )
            : $t(
              { defaultMessage: '{count} Impacted {title}' },
              { count, title: titleMap[chartKey] }
            )}
        </UI.PieChartTitle>
        <div style={{ height: 260, minWidth: 430 }}>
          <ContentSwitcher
            key={selectedStage}
            value={chartKey}
            defaultValue={'wlans'}
            tabDetails={tabDetails}
            align='left'
            size='small'
            onChange={key => setChartKey(key as TabKeyType)}
            noPadding
          />
        </div>
      </UI.HealthPieChartWrapper>
    </Loader>
  )
}
