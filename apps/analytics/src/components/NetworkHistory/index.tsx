import React from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'

import { NetworkHistoryData }     from './services'
import { useNetworkHistoryQuery } from './services'


export function getCols ({ $t }: ReturnType<typeof useIntl>) {
  const seriesMapping = [
    { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
    { key: 'impactedClientCount', name: $t({ defaultMessage: 'Impacted Clients' }) },
    { key: 'connectedClientCount', name: $t({ defaultMessage: 'Connected Clients' }) }
  ] as Array<{ key: keyof Omit<NetworkHistoryData, 'time'>, name: string }>
  return seriesMapping
}

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

function NetworkHistoryWidget () {
  const intl = useIntl()
  const filters = useGlobalFilter()
  const queryResults = useNetworkHistoryQuery(filters,
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: getSeriesData(data!, getCols(intl)),
        ...rest
      })
    })

  return (
    <Loader states={[queryResults]}>
      <Card title={intl.$t({ defaultMessage: 'Network History' })} >
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
