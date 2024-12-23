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

// TODO: replace impactedPortsByDDoSwith switchImpactedPortsByCode, in later releases.
const switchImpactedPortsCountQuery = (incident: Incident) => gql`
  timeSeries(granularity: $granularity) {
    time
    portCount: impactedPortsByDDoS(code: "${incident.code}")
  }
`

export const SwitchImpactedPortsCount = (props: TimeSeriesChartProps) => {
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'portCount', name: $t({ defaultMessage: 'Port Count' }) }
  ]

  const chartResults = getSeriesData(
    props.data.timeSeries as Record<string, TimeSeriesDataType[]>, seriesMapping)

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
  chart: SwitchImpactedPortsCount,
  query: switchImpactedPortsCountQuery
}
export default chartConfig
