import { useIntl, FormattedMessage } from 'react-intl'
import AutoSizer                     from 'react-virtualized-auto-sizer'

import { DonutChart, NoData, qualitativeColorSet, Loader } from '@acx-ui/components'
import { AnalyticsFilter }                                 from '@acx-ui/utils'

import {
  PieChartResult, TopNByCPUUsageResult,
  TopNByDHCPFailureResult, WidgetType, showTopResult,
  TopNByPortCongestionResult, TopNByStormPortCountResult
} from './config'
import { usePieChartDataQuery }        from './services'
import { ChartTitle, PieChartWrapper } from './styledComponents'

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
    switch(type){
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
      name: val.name,
      mac: val.mac,
      value: value,
      color: colors[index]
    }
  })
}

export const getPieData = (data: PieChartResult, type: WidgetType) => {
  if (!data) return []

  let transformedData: PieChartData[] = []
  switch(type){
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

export const MoreDetailsPieChart = ({
  filters,
  queryType
} : { filters: AnalyticsFilter, queryType: WidgetType }) => {
  const { $t } = useIntl()
  const { filter, startDate: start, endDate: end } = filters
  const payload = {
    filter,
    start,
    end,
    n: 5,
    type: queryType
  }

  const queryResults = usePieChartDataQuery(payload, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: getPieData(data!, queryType)
    })
  })

  const totalCount = queryResults?.data?.length
  const Title = <ChartTitle>
    <FormattedMessage
      defaultMessage={`<b>{count}</b> Impacted {totalCount, plural,
      one {Switch}
      other {Switches}
    }`}
      values={{
        count: showTopResult($t, totalCount, 5),
        totalCount,
        b: (chunk) => <b>{chunk}</b>
      }}
    />
  </ChartTitle>

  const pieData = queryResults.data

  return (
    <PieChartWrapper>
      <Loader states={[queryResults]}>
        {Title}
        {pieData && pieData.length > 0 ?
          <AutoSizer defaultHeight={150}>
            {({ width, height }) => (
              <DonutChart
                data={pieData}
                style={{ height, width, top: 20 }}
                legend='name'
                size={'x-large'}
                showTotal={false}
                showLegend
              />
            )}
          </AutoSizer> :
          <NoData />
        }
      </Loader>
    </PieChartWrapper>
  )
}
