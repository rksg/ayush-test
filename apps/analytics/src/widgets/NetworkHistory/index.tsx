import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useGlobalFilter }                   from '@acx-ui/analytics/utils'
import { Card }                              from '@acx-ui/components'
import { Loader }                            from '@acx-ui/components'
import { MultiLineTimeSeriesChart }          from '@acx-ui/components'
import { cssStr }                            from '@acx-ui/components'
import type { MultiLineTimeSeriesChartData } from '@acx-ui/components'
import { formatter }                         from '@acx-ui/utils'

import {
  useNetworkHistoryQuery,
  NetworkHistoryData
} from './services'

const seriesMapping = [
  { key: 'newClientCount', name: 'New Clients' },
  { key: 'impactedClientCount', name: 'Impacted Clients' },
  { key: 'connectedClientCount', name: 'Connected Clients' },
] as Array<{ key: keyof Omit<NetworkHistoryData, 'time'>, name: string }>

const lineColors = [
  cssStr('--acx-primary-black'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-semantics-yellow-40')
]

export const getSeriesData = (data?: NetworkHistoryData): MultiLineTimeSeriesChartData[] => {
  if (!data) return []
  return seriesMapping.map(({ key, name }) => ({
    name,
    data: data.time.map((t: string, index: number) =>
      [t, data[key][index]])
  }))
}

function NetworkHistoryWidget () {
  const filters = useGlobalFilter()
  const queryResults = useNetworkHistoryQuery(filters)

  return (
    <Loader states={[queryResults]}>
      <Card title='Network History' >
        <AutoSizer>
          {({ height, width }) => (
            <MultiLineTimeSeriesChart
              style={{ width, height }}
              data={getSeriesData(queryResults.data)}
              lineColors={lineColors}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default NetworkHistoryWidget
