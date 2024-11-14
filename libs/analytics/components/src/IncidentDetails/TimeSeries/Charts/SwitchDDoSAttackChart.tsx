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


const switchDDoSAttackQuery = (incident: Incident) => gql`
  ddosAttackOnPortTimeSeries: timeSeries(granularity: $granularity) {
    time
    ddos: impactedPortsByDDoS(code: "${incident.code}")
  }
`

export const SwitchDDoSAttackChart = (props: TimeSeriesChartProps) => {
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'ddos', name: $t({ defaultMessage: 'Ports Attacked' }) }
  ]

  const chartResults = getSeriesData(
    props.data.ddosAttackOnPortTimeSeries as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Impacted Port Count' })} type='no-border'>
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
  chart: SwitchDDoSAttackChart,
  query: switchDDoSAttackQuery
}
export default chartConfig
