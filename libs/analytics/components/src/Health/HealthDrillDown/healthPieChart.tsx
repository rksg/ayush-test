import { useEffect } from 'react'

import { Space }                                     from 'antd'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { getSelectedNodePath, mapCodeToReason } from '@acx-ui/analytics/utils'
import {
  ContentSwitcher,
  ContentSwitcherProps,
  DonutChart,
  EventParams,
  Loader,
  NoData,
  qualitativeColorSet
} from '@acx-ui/components'
import { get }                  from '@acx-ui/config'
import { formatter }            from '@acx-ui/formatter'
import { InformationOutlined }  from '@acx-ui/icons'
import { NodesFilter, getIntl } from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

import {
  Stages,
  stageLabels,
  DrilldownSelection,
  stageNameToCodeMap,
  showTopNPieChartResult
} from './config'
import { ImpactedEntities, usePieChartQuery } from './services'
import * as UI                                from './styledComponents'

const topCount = 5

export type PieChartData = {
  key: string
  value: number
  name: string
  color: string
  rawKey: string
  selected: boolean
}

export type TabKeyType = 'wlans' | 'nodes' | 'events' | 'osManufacturers'

type NodeData = {
  key: string
  value: number
  name?: string | null
}

type ClickParamsType = (data: PieChartData[] | EventParams) => (params: EventParams) => void

function getTopPieChartData (nodeData: NodeData[])
  : PieChartData[] {
  const colors = qualitativeColorSet()
  return nodeData
    .map((val, index) => ({
      ...val,
      name: val.name ? `${val.name} (${val.key})` : val.key,
      rawKey: val.key,
      color: colors[index],
      selected: false
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
  return { nodes: [], wlans: [], events: [], osManufacturers: [] }
}

export function pieNodeMap (filter: NodesFilter): MessageDescriptor {
  const isMLISA = get('IS_MLISA_SA')
  const node = getSelectedNodePath(filter)
  switch (node[node.length - 1].type) {
    case 'zone':
      return defineMessage({
        defaultMessage: `{ count, plural,
        one {AP Group}
        other {AP Groups}
      }` })
    case 'apGroup':
      return defineMessage({
        defaultMessage: `{ count, plural,
        one {AP}
        other {APs}
      }` })
    default:
      return !isMLISA ?
        defineMessage({
          defaultMessage: `{ count, plural,
        one {<VenueSingular></VenueSingular>}
        other {<VenuePlural></VenuePlural>}
      }` })
        : defineMessage({
          defaultMessage: `{ count, plural,
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

export const usePieActionHandler = (
  onPieClick: (e: EventParams) => void,
  onLegendClick: (data: PieChartData) => void,
  selectedSlice: number | null,
  setSelectedSlice: (slice: number | null) => void
) => {

  const onChartClick = (params: EventParams) => {
    setSelectedSlice(params.dataIndex === selectedSlice ? null : params.dataIndex)
    onPieClick(params)
  }

  const createOnClickLegend = (data: { name: string }[]) => (params: EventParams) => {
    const clickedIndex = data.findIndex((item) => item.name === params.name)
    if (clickedIndex !== -1) {
      setSelectedSlice(clickedIndex === selectedSlice ? null : clickedIndex)
    }
    const clickedData = data.find((pie) => pie.name === params.name)
    onLegendClick && onLegendClick(clickedData as PieChartData)
  }

  return [onChartClick, createOnClickLegend]
}

export function getHealthPieChart (
  data: PieChartData[],
  dataFormatter: (value: unknown, tz?: string | undefined) => string,
  size: { width: number; height: number },
  onChartClick: (e: EventParams) => void,
  createOnClickLegend: (data: PieChartData[]) => (params: EventParams) => void,
  pieFilter: PieChartData | null,
  selectedSlice: number | null
) {

  let tops = data.slice(0, topCount).map((item, index) => {
    return({
      ...item,
      selected: pieFilter ? selectedSlice === index : false
    })})
  if (data.slice(topCount)[0]?.key === 'Others') {
    tops.push({
      ...data.slice(topCount)[0],
      key: getIntl().$t({ defaultMessage: 'Others' }),
      selected: pieFilter?.name === 'Others'
    })
  }

  const total = tops.reduce((total, { value }) => value + total, 0)

  return (
    data.length > 0 ? <DonutChart
      data={tops}
      style={{ width: size.width, height: Math.max(size.width * 0.5, 190) }} // min height 190px to have space to show "Others"
      legend='name'
      size={'x-large'}
      showLegend
      showTotal={false}
      labelTextStyle={{ overflow: 'truncate', width: size.width * 0.5 }} // 50% of width
      dataFormatter={tooltipFormatter(total, dataFormatter)}
      onClick={onChartClick}
      onLegendClick={createOnClickLegend(data)}
      singleSelect={true}
    /> : <NoData />
  )
}

export const HealthPieChart = ({
  size,
  filters,
  queryType,
  selectedStage,
  valueFormatter,
  pieFilter,
  setPieFilter,
  chartKey,
  setChartKey,
  onPieClick,
  onLegendClick,
  setPieList,
  selectedSlice,
  setSelectedSlice
}: {
  size: { width: number; height: number }
  filters: AnalyticsFilter
  queryType: DrilldownSelection
  selectedStage: Stages
  valueFormatter: (value: unknown, tz?: string | undefined) => string
  pieFilter: PieChartData | null
  setPieFilter: (data: PieChartData | null) => void
  chartKey: TabKeyType
  setChartKey: (key: TabKeyType) => void
  onPieClick: (e: EventParams) => void
  onLegendClick: (data: PieChartData) => void
  setPieList: (data: PieChartData[]) => void
  selectedSlice: number | null
  setSelectedSlice: (slice: number | null) => void
}) => {
  const { $t } = useIntl()
  const [onChartClick, createOnClickLegend] = usePieActionHandler(
    onPieClick, onLegendClick, selectedSlice, setSelectedSlice)
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
      children: getHealthPieChart(
        data, valueFormatter, size, onChartClick as ClickParamsType,
        createOnClickLegend as ClickParamsType, pieFilter, selectedSlice
      )
    }))
  const count = showTopNPieChartResult(
    $t,
    tabsList.find((tab) => tab.key === chartKey)?.data.length as number,
    topCount
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setChartKey(tabDetails?.[0]?.value as TabKeyType) }, [tabDetails.length])
  useEffect(() => {
    setPieFilter(null)
    setSelectedSlice(null)
    setPieList(tabsList.find((tab) => tab.key === chartKey)?.data || [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartKey])

  return (
    <Loader states={[queryResults]} style={size}>
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
      {(tabsList.find((tab) => tab.key === chartKey)?.data.length || 0) > topCount &&
        <Space align='start'>
          <InformationOutlined />
          {$t({
            defaultMessage: `Detailed breakup of all items beyond
          Top 5 can be explored using Data Studio custom charts.` })}
        </Space>}
    </Loader>
  )
}
