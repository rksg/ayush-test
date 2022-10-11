import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, AnalyticsFilter }                         from '@acx-ui/analytics/utils'
import { Card, Loader, MultiLineTimeSeriesChart, cssStr, NoData } from '@acx-ui/components'
import { formatter }                                              from '@acx-ui/utils'

import {
  useTrafficByVolumeQuery,
  TrafficByVolumeData
} from './services'


type Key = keyof Omit<TrafficByVolumeData, 'time'>

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-semantics-yellow-40')
]

function TrafficByVolumeWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'totalTraffic_all', name: $t({ defaultMessage: 'All Bands' }) },
    { key: 'totalTraffic_24', name: formatter('radioFormat')('2.4') },
    { key: 'totalTraffic_5', name: formatter('radioFormat')('5') },
    { key: 'totalTraffic_6', name: formatter('radioFormat')('6') }
  ] as Array<{ key: Key, name: string }>
  const queryResults = useTrafficByVolumeQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, seriesMapping),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Traffic by Volume' })} >
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                lineColors={lineColors}
                dataFormatter={formatter('bytesFormat')}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default TrafficByVolumeWidget
