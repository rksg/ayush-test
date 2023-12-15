import { useState } from 'react'

import {
  meanBy,
  mean,
  sortBy,
  sumBy,
  groupBy,
  reduce,
  toPairs
} from 'lodash'
import { useIntl } from 'react-intl'

import { Card }               from '@acx-ui/components'
import { UpArrow, DownArrow } from '@acx-ui/icons'

import { SlaChart }                                                   from './Chart'
import { Lsp, Property, transformToLspView, transformToPropertyView } from './helpers'
import { ChartKey, slaKpiConfig }                                     from './helpers'
import * as UI                                                        from './styledComponents'

import type { Response,  FranchisorTimeseries } from './services'
import type { SliceType }                       from './useSliceType'


interface SlaTileProps {
  chartKey: ChartKey
  tableData: Response[]
  chartData: FranchisorTimeseries | undefined
  prevData: FranchisorTimeseries | undefined
  currData: FranchisorTimeseries | undefined
  sliceType: SliceType
}

export const getChartDataKey = (chartKey: ChartKey): string[] => {
  switch (chartKey) {
    case 'incident': return ['incidentCount']
    case 'experience': return ['timeToConnectSLA', 'clientThroughputSLA', 'connectionSuccessSLA']
    case 'compliance': return ['ssidComplianceSLA']
  }
}


const Subtitle = ({ sliceType }: { sliceType: SliceType }) => {
  const { $t } = useIntl()
  return <UI.SubtitleWrapper>{sliceType === 'lsp'
    ? $t({ defaultMessage: '# of LSPs with P1 Incident' })
    : $t({ defaultMessage: '# of Properties with P1 Incident' })}
  </UI.SubtitleWrapper>
}

const ChangeIcon = ({ chartKey, prevData, currData }
: {
  chartKey: ChartKey,
  prevData?: FranchisorTimeseries,
  currData?: FranchisorTimeseries,
}) => {
  if (!prevData || !currData) return null
  const keys = getChartDataKey(chartKey)
  const prevValues = keys
    .map(k => prevData[k as keyof typeof prevData])
    .flat()
  const prev = mean(prevValues)
  const currValues = keys
    .map(k => currData[k as keyof typeof currData])
    .flat()
  const curr = mean(currValues)
  const change = curr - prev
  if (change === 0) return null
  const { formatter, direction } = slaKpiConfig[chartKey]
  const isNegative = (direction === 'low') === (change > 0)
  const arrow = change > 0 ? <UpArrow /> : <DownArrow />
  return <UI.ChangeWrapper $isNegative={isNegative}>
    {arrow}{formatter(Math.abs(change))}
  </UI.ChangeWrapper>
}

const useOverallData = (chartKey: ChartKey, currData: FranchisorTimeseries | undefined) => {
  if (!currData) return null
  const keys = getChartDataKey(chartKey)
  const currValues = keys
    .map(k => currData[k as keyof typeof currData])
    .flat()
  return mean(currValues)
}

const groupBySliceType = (type: SliceType, data?: Response[]) => {
  if (!data || !data.length) return {}
  return type === 'lsp'
    ? groupBy(transformToLspView(data), type)
    : groupBy(transformToPropertyView(data), type)
}

const getListData = (
  groupedData: Record<string, (Lsp | Property)[]>,
  chartKey: ChartKey
): Array<[string, number]> => {
  const { dataKey, avg } = slaKpiConfig[chartKey]
  const res = reduce(groupedData, (
    result: Record<string, number>,
    val: (Lsp | Property)[],
    key: string) => {
    const curr = result[key as unknown as string] || 0
    result[key] = curr + (avg ? meanBy(val, dataKey) : sumBy(val, dataKey))
    return result
  }, {} as Record<string, number>)
  return sortBy(toPairs(res), val => val[1])
}

const SwitcherIcon = ({ order, size }: { order: boolean, size: number }) => {
  if (size <= 3) return null
  return <UI.IconWrapper>
    <UI.HighlightedIcon $highlight={order}>
      <UpArrow/>
    </UI.HighlightedIcon>
    <UI.HighlightedIcon $highlight={!order}>
      <DownArrow />
    </UI.HighlightedIcon>
  </UI.IconWrapper>
}

const TopElementsSwitcher = ({ data, chartKey }:
{ data: Array<[string, number]>, chartKey: ChartKey }) => {
  const [isAsc, setIsAsc] = useState(true)
  const start = isAsc ? 0 : -4
  const end = isAsc ? 3 : -1
  const indexData = data.map((val, ind) => [...val, ind + 1])
  const slice = indexData.slice(start, end)
  const { formatter } = slaKpiConfig[chartKey]
  return <UI.ListWrapper onClick={() => setIsAsc(asc => !asc)}>
    <div>
      {slice.map(([key, val, ind]) => <li key={key}>{ind}. {key} ({formatter(val)})</li>)}
    </div>
    <SwitcherIcon order={isAsc} size={data.length} />
  </UI.ListWrapper>
}

export function SlaTile ({
  chartKey,
  tableData,
  chartData,
  prevData,
  currData,
  sliceType
}: SlaTileProps) {
  const { $t } = useIntl()
  const { getTitle, formatter } = slaKpiConfig[chartKey]
  const groupedData = groupBySliceType(sliceType, tableData)
  const listData = getListData(groupedData, chartKey)
  const overallData = useOverallData(chartKey, currData)
  return <Card title={$t(getTitle(sliceType))}>
    <UI.Spacer />
    {chartKey === 'incident' && <Subtitle sliceType={sliceType} />}
    <UI.ValueWrapper>
      {formatter(overallData)}
      <ChangeIcon
        chartKey={chartKey}
        prevData={prevData}
        currData={currData} />
    </UI.ValueWrapper>
    <UI.Spacer />
    <SlaChart chartData={chartData} chartKey={chartKey} />
    <UI.Spacer />
    <TopElementsSwitcher data={listData} chartKey={chartKey} />
  </Card>
}
