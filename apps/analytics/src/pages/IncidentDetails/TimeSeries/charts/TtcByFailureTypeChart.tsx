import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  TimeSeriesData,
  getSeriesData
}                                         from '@acx-ui/analytics/utils'
import { Card, cssStr, StackedAreaChart } from '@acx-ui/components'
import { formatter }                      from '@acx-ui/utils'

import type { TimeSeriesChartProps } from '../types'

const ttcByFailureTypeChartQuery = () => gql`
  ttcByFailureTypeChart: timeSeries(granularity: $granularity) {
    time
    ttcByFailureTypes {
      ttcByEap
      ttcByDhcp
      ttcByAuth
      ttcByAssoc
      ttcByRadius
    }
  }
  `

export const TtcByFailureTypeChart = ({ chartRef, data }: TimeSeriesChartProps) => {
  const { ttcByFailureTypeChart: { time, ttcByFailureTypes } } = data
  const intl = useIntl()
  const { $t } = intl

  // TODO: change color when confirmed
  const stackColors = [
    cssStr('--acx-semantics-green-50'),
    cssStr('--acx-semantics-red-30'),
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-accents-orange-70'),
    cssStr('--acx-accents-orange-30')
  ]

  const seriesMapping = [
    { key: 'ttcByAuth', name: $t({ defaultMessage: 'Authentication' }) },
    { key: 'ttcByAssoc', name: $t({ defaultMessage: 'Association' }) },
    { key: 'ttcByEap', name: $t({ defaultMessage: 'EAP' }) },
    { key: 'ttcByRadius', name: $t({ defaultMessage: 'Radius' }) },
    { key: 'ttcByDhcp', name: $t({ defaultMessage: 'DHCP' }) }
  ]

  const chartResults = getSeriesData({
    time,
    ...ttcByFailureTypes
  } as TimeSeriesData, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Time To Connect (By Stage)' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <StackedAreaChart
          chartRef={chartRef}
          style={{ height, width }}
          stackColors={stackColors}
          data={chartResults}
          dataFormatter={formatter('durationFormat')}
          tooltipTotalTitle={$t({ defaultMessage: 'Total Time To Connect' })}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: TtcByFailureTypeChart, query: ttcByFailureTypeChartQuery }
export default chartConfig
