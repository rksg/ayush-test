import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                                  from '@acx-ui/analytics/utils'
import { Card, Loader, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { formatter }                                      from '@acx-ui/formatter'
import type { AnalyticsFilter }                           from '@acx-ui/utils'

import {
  useTrafficByBandQuery,
  TrafficByBandData
} from './services'


type Key = keyof Omit<TrafficByBandData, 'time'>

export { TrafficByBandWidget as TrafficByBand }

function TrafficByBandWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'userTraffic', name: $t({ defaultMessage: 'All Bands' }) },
    { key: 'userTraffic_2_4', name: $t({ defaultMessage: '2.4 GHz' }) },
    { key: 'userTraffic_5', name: $t({ defaultMessage: '5 GHz' }) },
    { key: 'userTraffic_6', name: $t({ defaultMessage: '6 GHz' }) }
  ] as Array<{ key: Key, name: string }>
  const queryResults = useTrafficByBandQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, seriesMapping),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Traffic by Band' })}>
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

export default TrafficByBandWidget
