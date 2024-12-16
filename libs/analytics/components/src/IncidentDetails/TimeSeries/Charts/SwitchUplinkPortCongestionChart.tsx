import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  Incident,
  getSeriesData,
  TimeSeriesDataType
}                                         from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart } from '@acx-ui/components'
import { formatter }                      from '@acx-ui/formatter'

import type { TimeSeriesChartProps } from '../types'


const switchUplinkPortCongestionQuery = (incident: Incident) => gql`
  uplinkPortCongestionTimeSeries: timeSeries(granularity: $granularity) {
    time
    uplinkPortCongestion: switchImpactedPortsByCode(code: "${incident.code}")
  }
`

export const SwitchUplinkPortCongestionChart = (props: TimeSeriesChartProps) => {
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'uplinkPortCongestion', name: $t({ defaultMessage: 'Ports Congested' }) }
  ]

  const chartResults = getSeriesData(
    props.data.uplinkPortCongestionTimeSeries as Record<string, TimeSeriesDataType[]>,
    seriesMapping)

  return <Card title={$t({ defaultMessage: 'Congested Port Count' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          disableLegend
          chartRef={props.chartRef}
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          yAxisProps={{ min: 0 }}
          echartOptions={{ yAxis: { minInterval: 1 } }}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = {
  chart: SwitchUplinkPortCongestionChart,
  query: switchUplinkPortCongestionQuery
}
export default chartConfig
