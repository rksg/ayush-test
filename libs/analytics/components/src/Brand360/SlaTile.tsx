import { useState } from 'react'

import { meanBy, sortBy, sumBy, groupBy, reduce, toPairs } from 'lodash'
import { defineMessage, useIntl }                          from 'react-intl'

import { Card, Loader }       from '@acx-ui/components'
import { formatter }          from '@acx-ui/formatter'
import { UpArrow, DownArrow } from '@acx-ui/icons'

import { SlaChart }                                                   from './Chart'
import { Lsp, Property, transformToLspView, transformToPropertyView } from './helpers'
import { useFetchBrandPropertiesQuery, Response }                     from './services'
import * as UI                                                        from './styledComponents'

import type { ChartKey }  from '.'
import type { SliceType } from './useSliceType'


interface SlaTileProps {
  chartKey: ChartKey
  tableQuery: ReturnType<typeof useFetchBrandPropertiesQuery>
  sliceType: SliceType
  start: string
  end: string
  ssidRegex: string
}

export const slaKpiConfig = {
  incident: {
    getTitle: (sliceType: SliceType) => sliceType === 'lsp'
      ? defineMessage({ defaultMessage: 'Distressed LSPs' })
      : defineMessage({ defaultMessage: 'Distressed Properties' }),
    dataKey: 'p1Incidents',
    avg: false,
    formatter: formatter('countFormat')
  },
  experience: {
    getTitle: () => defineMessage({ defaultMessage: 'Guest Experience' }),
    dataKey: 'guestExp',
    avg: true,
    formatter: formatter('percentFormat')
  },
  compliance: {
    getTitle: () => defineMessage({ defaultMessage: 'Brand SSID Compliance' }),
    dataKey: 'ssidCompliance',
    avg: true,
    formatter: formatter('percentFormat')
  }
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

const getOverallData = (listData: Array<[string, number]>, chartKey: ChartKey) => {
  if (!listData.length) return 0
  const { avg } = slaKpiConfig[chartKey]
  const total = sumBy(listData, (val) => val[1])
  return avg ? total / listData.length : total
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

const ChangeIcon = ({ chartKey, formatter }
: { chartKey: ChartKey, formatter: CallableFunction }) => {
  const changeValue = chartKey === 'incident'
    ? Math.random() * 10
    : Math.random()
  const isNegative = changeValue < 0.5
  return <UI.ChangeWrapper $isNegative={isNegative}>
    {isNegative
      ? <><DownArrow />{formatter(changeValue)}</>
      : <><UpArrow />{formatter(changeValue)}</>}
  </UI.ChangeWrapper>
}

const Subtitle = ({ sliceType }: { sliceType: SliceType }) => {
  const { $t } = useIntl()
  return <UI.SubtitleWrapper>{sliceType === 'lsp'
    ? $t({ defaultMessage: '# of LSPs with P1 Incident' })
    : $t({ defaultMessage: '# of Properties with P1 Incident' })}
  </UI.SubtitleWrapper>
}

export function SlaTile ({ chartKey, tableQuery, sliceType, ...payload }: SlaTileProps) {
  const { $t } = useIntl()
  const { getTitle, formatter } = slaKpiConfig[chartKey]
  const { data } = (tableQuery as unknown as { data?: Response[] })
  const groupedData = groupBySliceType(sliceType, data)
  const listData = getListData(groupedData, chartKey)
  const overallData = getOverallData(listData, chartKey)
  return <Loader states={[
    tableQuery as unknown as { isFetching: boolean, isLoading: boolean }
  ]}>
    <Card title={$t(getTitle(sliceType))}>
      <UI.Spacer />
      {chartKey === 'incident' && <Subtitle sliceType={sliceType} />}
      <UI.ValueWrapper>
        {formatter(overallData)}
        <ChangeIcon chartKey={chartKey} formatter={formatter} />
      </UI.ValueWrapper>
      <UI.Spacer />
      <SlaChart {...payload} chartKey={chartKey} mock />
      <UI.Spacer />
      <TopElementsSwitcher data={listData} chartKey={chartKey} />
    </Card>
  </Loader>
}
