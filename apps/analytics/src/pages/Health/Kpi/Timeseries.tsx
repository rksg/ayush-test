import { RefCallback } from 'react'

import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig }               from '@acx-ui/analytics/utils'
import { Loader, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import type { TimeStamp, TimeStampRange }           from '@acx-ui/types'
import { formatter }                                from '@acx-ui/utils'

import { KPITimeseriesResponse, useKpiTimeseriesQuery } from './services'

const transformResponse = ({ data, time }: KPITimeseriesResponse) => data
  .map((datum, index) => ([
    time[index],
    datum && datum.length && (datum[0] !== null && datum[1] !== null)
      ? datum[1] === 0 ? 0 : (datum[0] / datum[1])
      : null
  ])) as [TimeStamp, number][]

export const formatYDataPoint = (data: number | unknown) =>
  data !== null ? formatter('percentFormat')(data) : '-'

function KpiTimeseries ({
  filters,
  kpi,
  threshold,
  chartRef,
  setTimeWindow,
  timeWindow
}: {
  filters: AnalyticsFilter;
  kpi: keyof typeof kpiConfig;
  threshold?: number;
  chartRef: RefCallback<ReactECharts>;
  setTimeWindow?: { (timeWidow: TimeStampRange, isReset: boolean): void };
  timeWindow?: TimeStampRange // not set if there is no zoom
}) {
  const { $t } = useIntl()
  const { text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const queryResults = useKpiTimeseriesQuery(
    { ...filters, kpi, threshold: threshold as unknown as string },
    {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data! && [
          {
            key: kpi,
            name: $t(text),
            data: transformResponse(data)
          }
        ]
      })
    }
  )
  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) =>
          queryResults.data[0]?.data.length ? (
            <MultiLineTimeSeriesChart
              grid={{ bottom: '10%', top: '5%' }}
              style={{ height, width }}
              data={queryResults.data}
              dataFormatter={formatYDataPoint}
              yAxisProps={{ min: 0, max: 1 }}
              disableLegend
              chartRef={chartRef}
              onDataZoom={setTimeWindow}
              zoom={timeWindow}
            />
          ) : (
            <NoData />
          )
        }
      </AutoSizer>
    </Loader>
  )
}

export default KpiTimeseries
