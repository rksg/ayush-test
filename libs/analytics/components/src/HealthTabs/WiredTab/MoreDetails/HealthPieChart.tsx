import AutoSizer from 'react-virtualized-auto-sizer'

import { DonutChart, NoData, qualitativeColorSet, Loader } from '@acx-ui/components'
import { AnalyticsFilter }                                 from '@acx-ui/utils'

import {
  PieChartResult,
  usePieChartDataQuery,
  TopNByCPUUsageResult,
  TopNByDHCPFailureResult,
  WidgetType
} from './services'

type PieChartData = {
  mac: string
  value: number
  name: string
  color: string
}

export function transformData (
  type: WidgetType['type'],
  data: TopNByCPUUsageResult[] | TopNByDHCPFailureResult[]
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
    }
    return {
      name: val.name,
      mac: val.mac,
      value: value,
      color: colors[index]
    }
  })
}

export const getPieData = (data: PieChartResult, type: WidgetType['type']) => {
  if (!data) return []

  let transformedData: PieChartData[] = []
  switch(type){
    case 'cpuUsage':
      transformedData = transformData(type, data.topNSwitchesByCpuUsage)
      break
    case 'dhcpFailure':
      transformedData = transformData(type, data.topNSwitchesByDhcpFailure)
      break
  }
  return transformedData
}

export const MoreDetailsPieChart = ({
  filters,
  queryType
} : { filters: AnalyticsFilter, queryType: WidgetType['type'] }) => {
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

  const pieData = queryResults.data
  if (!pieData || pieData.length === 0) {
    return <NoData />
  }

  return (
    <Loader states={[queryResults]}>
      <AutoSizer defaultHeight={150}>
        {({ width, height }) => (
          <DonutChart
            data={pieData}
            style={{ height, width, top: 20 }}
            legend='name'
            size={'x-large'}
            showTotal={false}
            showLabel
          />
        )}
      </AutoSizer>
    </Loader>
  )
}
