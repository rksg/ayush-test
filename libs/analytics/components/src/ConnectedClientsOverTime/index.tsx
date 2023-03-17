import React from 'react'

import { take }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, getSeriesData }                 from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  Loader, StackedAreaChart,
  NoData, MultiLineTimeSeriesChart, qualitativeColorSet } from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import { ConnectedClientsOverTimeData, useConnectedClientsOverTimeQuery } from './services'

type Key = keyof Omit<ConnectedClientsOverTimeData, 'time'>

ConnectedClientsOverTime.defaultProps = {
  vizType: 'line'
}

export function ConnectedClientsOverTime ({
  filters, vizType
}: { filters : AnalyticsFilter , vizType: string }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'uniqueUsers_all', name: $t({ defaultMessage: 'All Bands' }) },
    { key: 'uniqueUsers_24', name: formatter('radioFormat')('2.4') },
    { key: 'uniqueUsers_5', name: formatter('radioFormat')('5') },
    { key: 'uniqueUsers_6', name: formatter('radioFormat')('6') }
  ] as Array<{ key: Key, name: string }>

  const stackColors = take(qualitativeColorSet(), 4).reverse()

  const queryResults = useConnectedClientsOverTimeQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: getSeriesData(data!, vizType === 'area' ? seriesMapping.reverse() : seriesMapping)
    })
  })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Connected Clients Over Time' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              vizType === 'area' ?
                <StackedAreaChart
                  stackColors={stackColors}
                  style={{ width, height }}
                  data={queryResults.data}
                /> :
                <MultiLineTimeSeriesChart
                  style={{ width, height }}
                  data={queryResults.data}
                />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
