import React from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, getSeriesData }                 from '@acx-ui/analytics/utils'
import { Card, Loader, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { formatter }                                      from '@acx-ui/utils'

import { ConnectedClientsOverTimeData, useConnectedClientsOverTimeQuery } from './services'

type Key = keyof Omit<ConnectedClientsOverTimeData, 'time'>

function ConnectedClientsOverTimeWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'uniqueUsers_all', name: $t({ defaultMessage: 'All Bands' }) },
    { key: 'uniqueUsers_24', name: formatter('radioFormat')('2.4') },
    { key: 'uniqueUsers_5', name: formatter('radioFormat')('5') },
    { key: 'uniqueUsers_6', name: formatter('radioFormat')('6') }
  ] as Array<{ key: Key, name: string }>

  const queryResults = useConnectedClientsOverTimeQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: getSeriesData(data!, seriesMapping)
    })
  })

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Connected Clients Over Time' })} >
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default ConnectedClientsOverTimeWidget
