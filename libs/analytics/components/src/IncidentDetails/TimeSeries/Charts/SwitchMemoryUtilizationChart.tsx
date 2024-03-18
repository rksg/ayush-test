import { LineSeriesOption } from 'echarts'
import { gql }              from 'graphql-request'
import moment               from 'moment-timezone'
import { useIntl }          from 'react-intl'
import AutoSizer            from 'react-virtualized-auto-sizer'

import {
  Incident,
  getSeriesData,
  TimeSeriesDataType,
  TimeSeriesData
}                                         from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, cssStr } from '@acx-ui/components'
import { formatter }                              from '@acx-ui/formatter'
import { TimeStamp }                              from '@acx-ui/types'

import type { TimeSeriesChartProps } from '../types'


const switchMemoryUtilizationQuery = (incident: Incident) => gql`
  memoryUtilizationChart: timeSeries(granularity: $granularity) {
    time
    utilization: switchMemoryUtilization(filter: {code: "${incident.code}"})
  }
`

function transformResponse (record: Incident, response: Record<string, TimeSeriesData>) {
  const { memoryUtilizationChart: data } = response
  let time = data.time as TimeStamp[]
  let projectedUtilization = Array(time.length).fill(undefined)
  const projectTime = moment(time.at(-1))
    .add(24 * record.metadata.projected_time!, 'hours')

  if (record.metadata.projected_time) {
    time = time.concat([projectTime.toJSON(), projectTime.clone().add(12, 'hours').toJSON()])
    projectedUtilization[projectedUtilization.length - 1] = (data.utilization as number[]).at(-1)
    projectedUtilization = projectedUtilization.concat(record.metadata.upper_bound! / 100)
  }

  return {
    ...response,
    memoryUtilizationChart: { ...data, time, projectedUtilization }
  }
}

export const SwitchMemoryUtilizationChart = (props: TimeSeriesChartProps) => {
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'utilization', name: $t({ defaultMessage: 'Memory Used' }) },
    { key: 'projectedUtilization', name: $t({ defaultMessage: 'Projected Memory Used' }) }
  ]

  const time = props.data.memoryUtilizationChart.time as TimeStamp[]
  const record = props.incident
  const threshold = record.metadata.upper_bound! / 100
  const projectTime = record.metadata.projected_time!
    ? time.at(-2) // take 2nd last as last index is padding time period
    : undefined

  const chartResults = getSeriesData(
    props.data.memoryUtilizationChart as Record<string, TimeSeriesDataType[]>, seriesMapping)

  const timeMarkers = [
    { timestamp: record.startTime, label: $t({ defaultMessage: 'Detected Time' }) },
    ...(projectTime
      ? [{ timestamp: projectTime, label: $t({ defaultMessage: 'Projected Time' }) }]
      : [])
  ]

  const lineColors = Array(2).fill(cssStr('--acx-viz-qualitative-1'))
  const lineStyles: LineSeriesOption['lineStyle'][] = [undefined, { type: 'dashed' }]

  return <Card title={$t({ defaultMessage: 'Memory Utilization' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          disableLegend
          chartRef={props.chartRef}
          style={{ height, width }}
          data={chartResults}
          lineColors={lineColors}
          lineStyles={lineStyles}
          markerAreas={[{
            start: threshold,
            itemStyle: { opacity: 0.05, color: cssStr('--acx-semantics-red-50') }
          }]}
          markerLines={[{
            threshold: threshold,
            lineStyle: { color: cssStr('--acx-semantics-red-50') }
          }]}
          timeMarkers={timeMarkers}
          dataFormatter={formatter('percentFormatRound')}
          yAxisProps={{ max: 1, min: 0 }}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = {
  chart: SwitchMemoryUtilizationChart,
  query: switchMemoryUtilizationQuery,
  transformResponse
}
export default chartConfig
