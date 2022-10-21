import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType }      from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { formatter }                              from '@acx-ui/utils'

import { TimeSeriesChartProps } from '../types'

const rebootedAPsCountQuery = () => gql`
  rebootedAPsChart: timeSeries(granularity: $granularity) {
    time
    rebootedApCount
  }
  `
export const RebootedAPsCountChart = (
  { chartRef, data }: TimeSeriesChartProps
) => {
  const { rebootedAPsChart } = data
  const { $t } = useIntl()

  const seriesMapping = [{
    key: 'rebootedApCount',
    name: $t({ defaultMessage: 'Rebooted APs' })
  }]

  const chartResults = getSeriesData(
    rebootedAPsChart as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Rebooted APs' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        chartResults.length ?
          <MultiLineTimeSeriesChart
            chartRef={chartRef}
            style={{ height, width }}
            data={chartResults}
            dataFormatter={formatter('countFormat')}
            yAxisProps={{ minInterval: 1 }}
            disableLegend={true}
          />
          : <NoData />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RebootedAPsCountChart, query: rebootedAPsCountQuery }
export default chartConfig
