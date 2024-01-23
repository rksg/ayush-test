import { gql }                    from 'graphql-request'
import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType }      from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { formatter }                              from '@acx-ui/formatter'

import type { TimeSeriesChartProps } from '../types'

const airtimeUtilizationChartQuery = () => gql`
    airtimeUtilizationChart: timeSeries(granularity: $granularity) {
      time
      airtimeBusy(filter: {code: $code})
      airtimeRx(filter: {code: $code})
      airtimeTx(filter: {code: $code})
      airtimeUtilization(filter: {code: $code})
  }
`

export const AirtimeUtilizationChart = ({ chartRef, data, incident }: TimeSeriesChartProps) => {
  const { airtimeUtilizationChart } = data
  const intl = useIntl()
  const { $t } = intl

  const seriesMapping = [
    { key: 'airtimeBusy', name: $t({ defaultMessage: 'Avg Airtime Busy' }) },
    { key: 'airtimeRx', name: $t({ defaultMessage: 'Avg Airtime Rx' }) },
    { key: 'airtimeTx', name: $t({ defaultMessage: 'Avg Airtime Tx' }) },
    { key: 'airtimeUtilization', name: $t({ defaultMessage: 'Avg Airtime Utilization' }) }
  ]

  const chartResults = getSeriesData(
    airtimeUtilizationChart as Record<string, TimeSeriesDataType[]>, seriesMapping)

  // @ts-ignore, no need default
  const radio = ((code) => {
    switch (code) {
      case 'p-airtime-b-24g-high':
      case 'p-airtime-tx-24g-high':
      case 'p-airtime-rx-24g-high':
        return '2.4'
      case 'p-airtime-b-5g-high':
      case 'p-airtime-tx-5g-high':
      case 'p-airtime-rx-5g-high':
        return '5'
      case 'p-airtime-b-6(5)g-high':
      case 'p-airtime-tx-6(5)g-high':
      case 'p-airtime-rx-6(5)g-high':
        return '6(5)'
    }
  })(incident.code)

  return <Card
    title={$t(
      defineMessage({ defaultMessage: 'Airtime Utilization for {radio}' }),
      { radio: formatter('radioFormat')(radio) }
    )}
    type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        chartResults.length ?
          <MultiLineTimeSeriesChart
            chartRef={chartRef}
            style={{ height, width }}
            data={chartResults}
            dataFormatter={formatter('percentFormat')}
            yAxisProps={{ max: 1, min: 0 }}
          />
          : <NoData />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: AirtimeUtilizationChart, query: airtimeUtilizationChartQuery }
export default chartConfig
