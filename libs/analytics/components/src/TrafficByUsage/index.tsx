import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                                  from '@acx-ui/analytics/utils'
import { Card, Loader, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { formatter }                                      from '@acx-ui/formatter'
import type { AnalyticsFilter }                           from '@acx-ui/utils'

import {
  useTrafficByUsageQuery,
  TrafficByUsageData
} from './services'


type Key = keyof Omit<TrafficByUsageData, 'time'>

export { TrafficByUsageWidget as TrafficByUsage }

function TrafficByUsageWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'userTraffic', name: $t({ defaultMessage: 'Total' }) },
    { key: 'userRxTraffic', name: $t({ defaultMessage: 'From Client' }) },
    { key: 'userTxTraffic', name: $t({ defaultMessage: 'To Client' }) }
  ] as Array<{ key: Key, name: string }>
  const queryResults = useTrafficByUsageQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, seriesMapping),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Traffic by Usage' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                dataFormatter={formatter('bytesFormat')}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default TrafficByUsageWidget
