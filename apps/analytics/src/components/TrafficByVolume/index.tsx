import React from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'
import { formatter }                from '@acx-ui/utils'

import { TrafficByVolumeData }     from './services'
import { useTrafficByVolumeQuery } from './services'

type Key = keyof Omit<TrafficByVolumeData, 'time'>

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-semantics-yellow-40')
]

function TrafficByVolumeWidget () {
  const { $t } = useIntl()
  const filters = useGlobalFilter()
  const seriesMapping = [
    { key: 'totalTraffic_all', name: $t({ defaultMessage: 'All Radios' }) },
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
            <MultiLineTimeSeriesChart
              style={{ width, height }}
              data={queryResults.data}
              lineColors={lineColors}
              dataFormatter={formatter('bytesFormat')}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default TrafficByVolumeWidget
