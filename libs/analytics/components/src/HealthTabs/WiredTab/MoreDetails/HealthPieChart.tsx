import { Space }                     from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { DonutChart, NoData, qualitativeColorSet, Loader } from '@acx-ui/components'
import { get }                                             from '@acx-ui/config'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { formatter }                                       from '@acx-ui/formatter'
import { InformationOutlined }                             from '@acx-ui/icons'
import { AnalyticsFilter }                                 from '@acx-ui/utils'

import { FixedAutoSizer }         from '../../../DescriptionSection/styledComponents'
import { showTopNPieChartResult } from '../../../Health/HealthDrillDown/config'

import {
  PieChartResult, TopNByCPUUsageResult,
  TopNByDHCPFailureResult, WidgetType,
  TopNByPortCongestionResult, TopNByStormPortCountResult,
  showTopNTableResult
} from './config'
import { usePieChartDataQuery }         from './services'
import { NoDataWrapper, PieChartTitle } from './styledComponents'

type PieChartData = {
  mac: string
  value: number
  name: string
  color: string
}

export function transformData (
  type: WidgetType,
  data: TopNByCPUUsageResult[] | TopNByDHCPFailureResult[] |
    TopNByPortCongestionResult[] | TopNByStormPortCountResult[]
): PieChartData[] {
  const colors = qualitativeColorSet()
  let value: number
  return data.map((val, index: number) => {
    switch (type) {
      case 'cpuUsage':
        value = (val as TopNByCPUUsageResult).cpuUtilization
        break
      case 'dhcpFailure':
        value = (val as TopNByDHCPFailureResult).dhcpFailureCount
        break
      case 'congestion':
        value = (val as TopNByPortCongestionResult).congestedPortCount
        break
      case 'portStorm':
        value = (val as TopNByStormPortCountResult).stormPortCount
        break
    }
    return {
      name: `${val.name} (${val.mac})`,
      mac: val.mac,
      value: value,
      color: colors[index]
    }
  })
}

export const getPieData = (data: PieChartResult, type: WidgetType) => {
  if (!data) return []

  let transformedData: PieChartData[] = []
  switch (type) {
    case 'cpuUsage':
      transformedData = transformData(type, data.topNSwitchesByCpuUsage)
      break
    case 'dhcpFailure':
      transformedData = transformData(type, data.topNSwitchesByDhcpFailure)
      break
    case 'congestion':
      transformedData = transformData(type, data.topNSwitchesByPortCongestion)
      break
    case 'portStorm':
      transformedData = transformData(type, data.topNSwitchesByStormPortCount)
      break
  }
  return transformedData
}

export const tooltipFormatter = (
  total: number,
  dataFormatter: (value: unknown, tz?: string | undefined) => string
) => (value: unknown) =>
  `${formatter('percentFormat')(value as number / total)} (${dataFormatter(value)})`

export const MoreDetailsPieChart = ({
  filters,
  queryType,
  title
}: { filters: AnalyticsFilter, queryType: WidgetType, title: string }) => {
  const enableWithOthers = [
    useIsSplitOn(Features.HEALTH_WIRED_TOPN_WITH_OTHERS),
    get('IS_MLISA_SA')
  ].some(Boolean)
  const n = 5
  const { $t } = useIntl()
  const { filter, startDate: start, endDate: end } = filters
  const payload = {
    filter,
    start,
    end,
    n: n + 1,
    type: queryType
  }

  const queryResults = usePieChartDataQuery(payload, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: getPieData(data!, queryType)
    })
  })

  const totalCount = enableWithOthers
    ? queryResults?.data?.length
    : queryResults?.data?.filter(({ mac }) => mac !== 'Others').length
  const showTopNResult = enableWithOthers ? showTopNPieChartResult : showTopNTableResult
  const heading = <PieChartTitle>
    <FormattedMessage
      defaultMessage={`<b>{count}</b> {title} {totalCount, plural,
      one {Switch}
      other {Switches}
    }`}
      values={{
        count: showTopNResult($t, totalCount, n),
        title,
        totalCount,
        b: (chunk) => <b>{chunk}</b>
      }}
    />
  </PieChartTitle>

  const hasOthers = enableWithOthers
    ? queryResults?.data?.find(({ mac }) => mac === 'Others')
    : false
  const pieData = enableWithOthers
    ? (hasOthers
      ? [...queryResults.data.slice(0, queryResults.data.length - 1),
        {
          ...queryResults.data.slice(-1)[0],
          name: $t({ defaultMessage: 'Others' }),
          mac: undefined
        }]
      : queryResults.data) as PieChartData[]
    : queryResults.data.slice(0, n)
  const total = pieData?.reduce((total, { value }) => total + value, 0)
  return (
    <Loader states={[queryResults]}>
      <FixedAutoSizer>{({ width, height }) =>
        <div style={{ width, height }}>
          {heading}
          {pieData && pieData.length > 0 ? <DonutChart
            data={pieData}
            style={{ width, height: Math.max(width * 0.5, 190) }} // min height 190px to have space to show "Others"
            legend='name'
            size={'x-large'}
            showTotal={false}
            labelTextStyle={{ overflow: 'truncate', width: width * 0.5 }} // 50% of width
            showLegend
            dataFormatter={tooltipFormatter(total, formatter('countFormat'))}
          /> : <NoDataWrapper>
            <NoData />
          </NoDataWrapper>
          }
          {hasOthers &&
            <Space align='start' style={{ width }}>
              <InformationOutlined />
              {$t({
                defaultMessage: `Detailed breakup of all items beyond
              Top {n} can be explored using Data Studio custom charts.` }, { n })}
            </Space>}
        </div>
      }</FixedAutoSizer>
    </Loader>
  )
}
