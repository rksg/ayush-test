import AutoSizer from 'react-virtualized-auto-sizer'

import { DonutChart, NoData, qualitativeColorSet, Loader } from '@acx-ui/components'
import { AnalyticsFilter }                                 from '@acx-ui/utils'

import {
  PieChartResult,
  usePieChartDataQuery,
  TopNByCPUUsageResult,
  TopNByDHCPFailureResult
} from './services'

type PieChartData = {
  mac: string
  value: number
  name: string
  color: string
}

export function transformData (
  type: string,
  data: TopNByCPUUsageResult[] | TopNByDHCPFailureResult[]
): PieChartData[] {
  const colors = qualitativeColorSet()
  let value: number
  return data.map((val, index: number) => {
    switch(type){
      case 'cpu':
        value = (val as TopNByCPUUsageResult).cpuUtilization
        break
      case 'dhcp':
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

export const getPieData = (data: PieChartResult, type: string) => {
  if (!data) return []
  switch(type){
    case 'cpu':
      return transformData(type, data.topNSwitchesByCpuUsage)
    case 'dhcp':
      return transformData(type, data.topNSwitchesByDhcpFailure)
    default:
      return []
  }
}

export const MoreDetailsPieChart = ({
  filters,
  queryType
} : { filters: AnalyticsFilter, queryType: string }) => {
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
            showLegend
          />
        )}
      </AutoSizer>
    </Loader>
  )
}
