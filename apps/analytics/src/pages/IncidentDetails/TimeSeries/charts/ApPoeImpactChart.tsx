import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType }      from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'

import { TimeSeriesChartProps } from '../types'

const apPoeImpactQuery = () => gql`
  apInfraImpactedAPsChart: timeSeries(granularity:$granularity){
    time
    impactedAPs: apInfraAPCount(code: $code)
  }
`
export const ApPoeImpactChart = (
  { chartRef, data }: TimeSeriesChartProps
) => {
  const { apInfraImpactedAPsChart } = data
  const { $t } = useIntl()

  const seriesMapping = [{
    key: 'impactedAPs',
    name: $t({ defaultMessage: 'Impacted APs' })
  }]

  const chartResults = getSeriesData(
    apInfraImpactedAPsChart as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'APs PoE Impact' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        chartResults.length ?
          <MultiLineTimeSeriesChart
            chartRef={chartRef}
            style={{ height, width }}
            data={chartResults}
            disableLegend={true}
          />
          : <NoData />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ApPoeImpactChart, query: apPoeImpactQuery }
export default chartConfig
