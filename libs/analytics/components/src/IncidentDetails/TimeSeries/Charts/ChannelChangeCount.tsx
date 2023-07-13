import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType }      from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'

import type { TimeSeriesChartProps } from '../types'

const channelChangeCountChartQuery = () => gql`
  channelChangeCountChart: timeSeries(granularity: $granularity) {
    time
    channelChangeCount: apChannelChangeCount(filter: {code: $code})
  }
`

export const ChannelChangeCount = ({ chartRef, data }: TimeSeriesChartProps) => {
  const { channelChangeCountChart } = data
  const intl = useIntl()
  const { $t } = intl

  const seriesMapping = [
    { key: 'channelChangeCount', name: $t({ defaultMessage: 'Channel Change Count' }) }
  ]

  const chartResults = getSeriesData(
    channelChangeCountChart as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Channel Change Count' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        chartResults.length ?
          <MultiLineTimeSeriesChart
            chartRef={chartRef}
            style={{ height, width }}
            data={chartResults}
          />
          : <NoData />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ChannelChangeCount, query: channelChangeCountChartQuery }
export default chartConfig
