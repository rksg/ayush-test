import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'
import { getSeriesData }            from '@acx-ui/utils'

import { NetworkHistoryData }     from './services'
import { useNetworkHistoryQuery } from './services'

export const seriesMapping = [
  { key: 'newClientCount', name: 'New Clients' },
  { key: 'impactedClientCount', name: 'Impacted Clients' },
  { key: 'connectedClientCount', name: 'Connected Clients' }
] as Array<{ key: keyof Omit<NetworkHistoryData, 'time'>, name: string }>

const lineColors = [
  cssStr('--acx-primary-black'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

function NetworkHistoryWidget () {
  const filters = useGlobalFilter()
  const queryResults = useNetworkHistoryQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getSeriesData(data!, seriesMapping),
        ...rest
      })
    })

  return (
    <Loader states={[queryResults]}>
      <Card title='Network History' >
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

export default NetworkHistoryWidget
