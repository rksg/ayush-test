import { take }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, AnalyticsFilter }                 from '@acx-ui/analytics/utils'
import { HistoricalCard, Loader, StackedAreaChart,
  NoData, MultiLineTimeSeriesChart, qualitativeColorSet } from '@acx-ui/components'
import { formatter } from '@acx-ui/utils'

import {
  useTrafficByVolumeQuery,
  TrafficByVolumeData
} from './services'

type Key = keyof Omit<TrafficByVolumeData, 'time'>

export { TrafficByVolumeWidget as TrafficByVolume }

TrafficByVolumeWidget.defaultProps = {
  vizType: 'line'
}

function TrafficByVolumeWidget ({
  filters, vizType
}: { filters : AnalyticsFilter , vizType: string }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'totalTraffic_all', name: $t({ defaultMessage: 'All Bands' }) },
    { key: 'totalTraffic_24', name: formatter('radioFormat')('2.4') },
    { key: 'totalTraffic_5', name: formatter('radioFormat')('5') },
    { key: 'totalTraffic_6', name: formatter('radioFormat')('6') }
  ] as Array<{ key: Key, name: string }>
  const queryResults = useTrafficByVolumeQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, vizType === 'area' ? seriesMapping.reverse() : seriesMapping),
      ...rest
    })
  })
  const stackColors = take(qualitativeColorSet(), 4).reverse()

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              vizType === 'area' ?
                <StackedAreaChart
                  style={{ width, height }}
                  stackColors={stackColors}
                  data={queryResults.data}
                  dataFormatter={formatter('bytesFormat')}
                /> :
                <MultiLineTimeSeriesChart
                  style={{ width, height }}
                  data={queryResults.data}
                  dataFormatter={formatter('bytesFormat')}
                />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}

export default TrafficByVolumeWidget
