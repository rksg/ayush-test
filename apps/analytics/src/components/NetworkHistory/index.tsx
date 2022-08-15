import React from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  MultiLineTimeSeriesChart,
  cssStr
} from '@acx-ui/components'

import {
  NetworkHistoryData,
  useNetworkHistoryQuery,
  Filters
} from './services'

type Key = keyof Omit<NetworkHistoryData, 'time'>

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

function NetworkHistoryWidget ({
  hideTitle,
  filters
}: {
  hideTitle?: boolean;
  filters: Filters;
}) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
    {
      key: 'impactedClientCount',
      name: $t({ defaultMessage: 'Impacted Clients' })
    },
    {
      key: 'connectedClientCount',
      name: $t({ defaultMessage: 'Connected Clients' })
    }
  ] as Array<{ key: Key; name: string }>
  const queryResults = useNetworkHistoryQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, seriesMapping),
      ...rest
    })
  })
  const title = hideTitle ? '' : $t({ defaultMessage: 'Network History' })
  return (
    <Loader states={[queryResults]}>
      <Card title={title}>
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
