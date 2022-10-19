import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType } from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart }    from '@acx-ui/components'
import { formatter }                         from '@acx-ui/utils'

import { TimeSeriesChartProps } from '../types'

const connectedClientsChartQuery = () => gql`
  clientCountCharts: timeSeries(granularity:$granularity){
    time
    connectedClientCount
  }
`
export const ConnectedClientsChart = (
  { chartRef, data }: TimeSeriesChartProps
) => {
  const { clientCountCharts } = data
  const { $t } = useIntl()

  const seriesMapping = [{
    key: 'connectedClientCount',
    name: $t({ defaultMessage: 'Connected Clients' })
  }]

  const chartResults = getSeriesData(
    clientCountCharts as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Connected Clients' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          chartRef={chartRef}
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          yAxisProps={{ minInterval: 1 }}
          disableLegend={true}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ConnectedClientsChart, query: connectedClientsChartQuery }
export default chartConfig
