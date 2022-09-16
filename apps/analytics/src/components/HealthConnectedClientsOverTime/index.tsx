import { forwardRef } from 'react'

import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, getSeriesData, MultiLineTimeSeriesChartData, TimeSeriesData }         from '@acx-ui/analytics/utils'
import { Card, cssStr, Loader, MultiLineTimeSeriesChart, NoData, QueryState } from '@acx-ui/components'

import { useHealthTimeseriesQuery } from './services'


const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]
function HealthTimeSeriesChart ({ filters, chartRef, data }:
  {
    filters: AnalyticsFilter,
    chartRef: React.RefObject<ReactECharts>
    data: QueryState & { data: MultiLineTimeSeriesChartData[] }
  }
) {

  // const { $t } = useIntl()
  const { startDate, endDate } = filters

  return (
    <MultiLineTimeSeriesChart
      data={data.data}
      lineColors={lineColors}
      brush={[startDate, endDate]}
      style={{ width: 500, height: 200 }}
      chartRef={chartRef}
    />
    // <Loader states={[data]}>
    //   <AutoSizer>
    //     {({ width }) => (
    //       <div style={{ width, height: 250 }}>
    //         <Card>
    //           {(data.data && data.data.length > 0)
    //             ? <MultiLineTimeSeriesChart
    //               data={data.data}
    //               lineColors={lineColors}
    //               brush={[startDate, endDate]}
    //               style={{ width, height: 200 }}
    //               chartRef={chartRef}
    //             />
    //             : <NoData />}
    //         </Card>
    //       </div>
    //     )}
    //   </AutoSizer>
    // </Loader>
  )
}

export default HealthTimeSeriesChart
