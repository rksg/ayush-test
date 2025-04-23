import { useState } from 'react'

import { Tooltip, Typography } from 'antd'
import {
  meanBy,
  mean,
  orderBy,
  sumBy,
  groupBy,
  reduce,
  toPairs,
  isNaN
} from 'lodash'
import { useIntl } from 'react-intl'

import { Card }                                    from '@acx-ui/components'
import { UpArrow, DownArrow, InformationOutlined } from '@acx-ui/icons'
import { getUserProfile, isCoreTier }              from '@acx-ui/user'
import { noDataDisplay }                           from '@acx-ui/utils'

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
  lsp: string
  property: string
  isMDU: boolean
}

const { Text } = Typography

export const getChartDataKey = (chartKey: ChartKey): string[] => {
  switch (chartKey) {
    case 'incident': return ['incidentCount']
    case 'experience': return ['timeToConnectSLA', 'clientThroughputSLA', 'connectionSuccessSLA']
    case 'compliance': return ['ssidComplianceSLA']
    // for demo only
    // istanbul ignore next
    case 'mdu': return ['prospectCountSLA']
  }
}

const Subtitle = ({ sliceType }: { sliceType: SliceType }) => {
  const { $t } = useIntl()
  return <UI.SubtitleWrapper>{sliceType === 'lsp' // TODO get the actual lsp/property count
    ? $t({ defaultMessage: '# of P1 Incidents' })
    : $t({ defaultMessage: '# of P1 Incidents' })}
  </UI.SubtitleWrapper>
}

function calculateMean (keys: string[], data: FranchisorTimeseries) {
  const values = keys
    .map(k => data[k as keyof typeof data])
    .flat()
    .filter(v => v !== null)
  return mean(values.length ? values : [0])
}

const ChangeIcon = ({ chartKey, prevData, currData }
: {
  chartKey: ChartKey,
  prevData?: FranchisorTimeseries,
  currData?: FranchisorTimeseries,
}) => {
  if (!prevData || !currData) return null
  const keys = getChartDataKey(chartKey)
  const prev = calculateMean(keys, prevData)
  const curr = calculateMean(keys, currData)
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
  return calculateMean(keys, currData)
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
  const { dataKey, avg, order } = slaKpiConfig[chartKey]
  const res = reduce(groupedData, (
    result: Record<string, number>,
    val: (Lsp | Property)[],
    key: string) => {
    const curr = result[key as unknown as string] || 0
    result[key] = curr + (avg ? meanBy(val, dataKey) : sumBy(val, dataKey))
    return result
  }, {} as Record<string, number>)
  return orderBy(toPairs(res), val =>isNaN(val[1]) ? -1 : val[1],[order as 'asc' | 'desc'])
}

const SwitcherIcon = ({ order }: { order: boolean }) => {
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
  const indexData = data.map((val, ind) => [...val, ind + 1])
  const topSortedItems = isAsc ? indexData.slice(0, 3) : indexData.slice(-3)
  const { formatter } = slaKpiConfig[chartKey]
  const enableSort = data.length > 3
  return <UI.ListWrapper
    $showCursor={enableSort}
    onClick={
      () => {
        if (enableSort) {
          setIsAsc(asc => !asc)
        }
      }
    }>
    <UI.ListContainer>
      {topSortedItems.map(([key, val, ind]) => <li key={key}>
        <Text ellipsis={{ suffix: ` (${!isNaN(val as number) ? formatter(val) : noDataDisplay})` }}>
          {ind}. {key}
        </Text>
      </li>)}
    </UI.ListContainer>
    {enableSort && <SwitcherIcon order={isAsc} /> }
  </UI.ListWrapper>
}

export function SlaTile ({
  chartKey,
  tableData,
  chartData,
  prevData,
  currData,
  sliceType,
  isMDU,
  lsp,
  property
}: SlaTileProps) {
  const { $t } = useIntl()
  const { getTitle, formatter } = slaKpiConfig[chartKey]
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const name = sliceType === 'lsp' ? lsp : property
  const groupedData = groupBySliceType(sliceType, tableData)
  const listData = getListData(groupedData, chartKey)
  const overallData = useOverallData(chartKey, currData)

  const getTooltip = (chartKey: string) => {
    if(chartKey === 'experience' && isCore) {
      return <Tooltip placement='top'
        title={$t({ // eslint-disable-next-line max-len
          defaultMessage: 'This value is calculated using data from Essential and Professional tier properties only.' })}>
        <InformationOutlined />
      </Tooltip>
    }
    return null
  }

  return <Card title={{
    title: ($t(getTitle(isMDU), { name })),
    icon: getTooltip(chartKey) }}
  >
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
    <SlaChart isMDU={isMDU} chartData={chartData} chartKey={chartKey} />
    <UI.Spacer />
    <TopElementsSwitcher data={listData} chartKey={chartKey} />
  </Card>
}
