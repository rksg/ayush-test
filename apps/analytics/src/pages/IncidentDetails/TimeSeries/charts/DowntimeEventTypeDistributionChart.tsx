import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType } from '@acx-ui/analytics/utils'
import { Card, cssStr, StackedAreaChart }    from '@acx-ui/components'
import { formatter }                         from '@acx-ui/utils'

import { TimeSeriesChartProps } from '../types'

const downtimeEventTypeDistributionChartQuery = () => gql`
  downtimeEventTypeDistributionChart: timeSeries(granularity: $granularity) {
    time
    apDisconnectionEvents {
      apHeartbeatLost
      apRebootBySystem
      apConnectionLost
      apRebootByUser
    }
  }
  `

export const DowntimeEventTypeDistributionChart = (
  { data }: { data: TimeSeriesChartProps['data'] }
) => {
  const { downtimeEventTypeDistributionChart: { time, apDisconnectionEvents } } = data
  const { $t } = useIntl()

  // TODO: change color when confirmed
  const stackColors = [
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-semantics-green-50'),
    cssStr('--acx-accents-orange-30'),
    cssStr('--acx-semantics-red-30')
  ]

  const seriesMapping = [
    { key: 'apHeartbeatLost', name: $t({ defaultMessage: 'AP Heartbeat Lost' }) },
    { key: 'apRebootBySystem', name: $t({ defaultMessage: 'AP Reboot By System' }) },
    { key: 'apConnectionLost', name: $t({ defaultMessage: 'AP Connection Lost' }) },
    { key: 'apRebootByUser', name: $t({ defaultMessage: 'AP Reboot By User' }) }
  ]

  const chartResults = getSeriesData({
    time,
    ...apDisconnectionEvents
  } as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Events' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <StackedAreaChart
          type='step'
          style={{ height, width }}
          stackColors={stackColors}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          yAxisProps={{ minInterval: 1 }}
          tooltipTotalTitle={$t({ defaultMessage: 'Total Events' })}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = {
  chart: DowntimeEventTypeDistributionChart,
  query: downtimeEventTypeDistributionChartQuery
}
export default chartConfig
