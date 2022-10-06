import { useEffect, RefCallback } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import moment      from 'moment-timezone'

import ReactECharts from 'echarts-for-react'

import { AnalyticsFilter, kpiConfig }                       from '@acx-ui/analytics/utils'
import { Loader, MultiLineTimeSeriesChart, cssStr, NoData } from '@acx-ui/components'
import type { TimeStamp, TimeStampRange }                                   from '@acx-ui/types'
import { formatter }                                        from '@acx-ui/utils'

import { KPITimeseriesResponse, useKpiTimeseriesQuery } from './services'

const lineColors = [cssStr('--acx-accents-blue-30')]

const transformResponse = (
  { data, time }: KPITimeseriesResponse, [startDate, endDate]: TimeStampRange
) => {
  //console.log('start', startDate, moment(startDate).utc().toISOString())
  //console.log('end', endDate, moment(endDate).utc().toISOString())
  //time = time.filter(t => moment(t).isBetween(moment(startDate).utc(), moment(endDate).utc(), undefined, '[]'))
  return data
  // .filter((_, index) => {
  //   //console.log('t[index]', index, time[index])
  //   //console.log(moment(time[index]).isBetween(moment(startDate).utc().toISOString(), moment(endDate).utc().toISOString(), undefined, '[]'))
  //   return moment(time[index]).isBetween(moment(startDate).utc().toISOString(), moment(endDate).utc().toISOString(), undefined, '[]')
  // })
  .map((datum, index) => ([
    time[index],
    datum && datum.length && (datum[0] !== null && datum[1] !== null)
      ? datum[1] === 0 ? 0 : (datum[0] / datum[1])
      : null
])) as [TimeStamp, number][]
}

export const formatYDataPoint = (data: number | unknown) =>
  data !== null ? formatter('percentFormat')(data) : '-'

function KpiTimeseries ({ filters, kpi, chartRef, setTimeWindow, timeWindow }: { 
  filters: AnalyticsFilter,
  kpi: string,
  chartRef: RefCallback<ReactECharts>,
  setTimeWindow: { (timeWidow: TimeStampRange): void } | undefined,
  timeWindow: TimeStampRange
}) {
  const { $t } = useIntl()
  const { histogram, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const queryResults = useKpiTimeseriesQuery(
    { ...filters, kpi, threshold: histogram?.initialThreshold }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data! && [{
          name: $t(text),
          data: transformResponse(data, timeWindow)
        }]
      })
    })
    
  //console.log(moment(timeWindow[0]).utc().toISOString(), moment(timeWindow[1]).utc().toISOString(),queryResults.data)
  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) => (
          queryResults.data[0]?.data.length ?
            <MultiLineTimeSeriesChart
              style={{ height, width }}
              data={queryResults.data}
              lineColors={lineColors}
              dataFormatter={formatYDataPoint}
              yAxisProps={{ min: 0, max: 1 }}
              disableLegend
              chartRef={chartRef}
              onDataZoom={setTimeWindow}
            />
            : <NoData/>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default KpiTimeseries
