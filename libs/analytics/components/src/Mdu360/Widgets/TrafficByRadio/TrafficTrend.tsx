import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                    from '@acx-ui/analytics/utils'
import { NoData, MultiLineTimeSeriesChart } from '@acx-ui/components'
import { formatter }                        from '@acx-ui/formatter'
import { UseQueryResult }                   from '@acx-ui/types'

import { TrafficByRadioData } from './services'

export function TrafficTrend ({
  queryResults
}: { queryResults: UseQueryResult<TrafficByRadioData> }) {
  const { $t } = useIntl()

  type Key = keyof Omit<TrafficByRadioData, 'time'>
  const seriesMapping = [
    { key: 'userTraffic_all', name: $t({ defaultMessage: 'All Bands' }) },
    { key: 'userTraffic_24', name: formatter('radioFormat')('2.4') },
    { key: 'userTraffic_5', name: formatter('radioFormat')('5') },
    { key: 'userTraffic_6', name: formatter('radioFormat')('6') }
  ] as Array<{ key: Key, name: string }>

  const data = getSeriesData(queryResults.data!, seriesMapping)

  return (
    (data.length && data[0].data.length) ?
      <AutoSizer>
        {({ height, width }) => (
          <MultiLineTimeSeriesChart
            style={{ width, height }}
            data={data}
            dataFormatter={formatter('bytesFormat')}
          />
        )}
      </AutoSizer> : <NoData/>
  )
}