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

import { ConnectedClientsOverTimeData }     from './services'
import { useConnectedClientsOverTimeQuery } from './services'

export const seriesMapping = [
  { key: 'uniqueUsers_all', name: 'All Radios' },
  { key: 'uniqueUsers_24', name: formatter('radioFormat')('2.4') },
  { key: 'uniqueUsers_5', name: formatter('radioFormat')('5') },
  { key: 'uniqueUsers_6', name: formatter('radioFormat')('6') }
] as Array<{ key: keyof Omit<ConnectedClientsOverTimeData, 'time'>, name: string }>

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-semantics-yellow-40')
]

function ConnectedClientsOverTimeWidget () {
  const filters = useGlobalFilter()
  const { $t } = useIntl()
  const queryResults = useConnectedClientsOverTimeQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getSeriesData(data!, seriesMapping),
        ...rest
      })
    })

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Connected Clients Over Time' })} >
        <AutoSizer>
          {({ height, width }) => (
            <MultiLineTimeSeriesChart
              style={{ width, height }}
              data={queryResults.data}
              lineColors={lineColors}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default ConnectedClientsOverTimeWidget
