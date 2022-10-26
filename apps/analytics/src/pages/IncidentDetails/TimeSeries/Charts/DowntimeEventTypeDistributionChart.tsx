import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType } from '@acx-ui/analytics/utils'
import { Card, StackedAreaChart }            from '@acx-ui/components'

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
  { chartRef, data }: TimeSeriesChartProps
) => {
  const { downtimeEventTypeDistributionChart: { time, apDisconnectionEvents } } = data
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'apHeartbeatLost', name: $t({ defaultMessage: 'AP Heartbeat Lost' }) },
    { key: 'apRebootBySystem', name: $t({ defaultMessage: 'AP Reboot by System' }) },
    { key: 'apConnectionLost', name: $t({ defaultMessage: 'AP Connection Lost' }) },
    { key: 'apRebootByUser', name: $t({ defaultMessage: 'AP Reboot by User' }) }
  ]

  const chartResults = getSeriesData({
    time,
    ...apDisconnectionEvents
  } as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Events' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <StackedAreaChart
          chartRef={chartRef}
          type='step'
          style={{ height, width }}
          data={chartResults}
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
