import React from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  NoData,
  MultiLineTimeSeriesChart,
  qualitativeColorSet,
  cssStr } from '@acx-ui/components'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { ConnectedClientsOverTimeData, useConnectedApWiredClientsOverTimeQuery } from './services'

type Key = keyof Omit<ConnectedClientsOverTimeData, 'time'>

export function ConnectedClientsOverTime ({
  filters
}: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const chartColors = qualitativeColorSet()

  const seriesMapping = [
    { key: 'connectedClients', name: $t({ defaultMessage: 'Connected Clients' }) },
    { key: 'wirelessClientsCount', name: $t({ defaultMessage: 'Wireless Clients' }) },
    { key: 'wiredClientsCount', name: $t({ defaultMessage: 'Wired Clients' }) }
  ] as unknown as Array<{ key: Key, name: string }>

  const massageData = (data: ConnectedClientsOverTimeData) => {
    if (!data) return data
    return {
      ...data,
      connectedClients: data.wirelessClientsCount.map((w, i) => w + data.wiredClientsCount[i])
    }
  }

  const queryResults = useConnectedApWiredClientsOverTimeQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: getSeriesData(massageData(data!), seriesMapping)
    })
  })

  return (
    <Loader states={[queryResults]}>
      <Card>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                lineColors={[
                  cssStr('--acx-neutrals-30'),
                  chartColors[0],
                  chartColors[1]
                ]}
                grid={{
                  left: 40,
                  right: 40
                }}
                yAxisConfig={[{
                  axisName: $t({ defaultMessage: 'Wireless Clients Count' }),
                  nameRotate: 90,
                  showLabel: true,
                  color: chartColors[0]
                }, {
                  axisName: $t({ defaultMessage: 'Wired Clients Count' }),
                  nameRotate: 270,
                  showLabel: true,
                  color: chartColors[1]
                }]}
                seriesYAxisIndexes={[0, 0, 1]}
                seriesChartTypes={['area', 'line', 'line']}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
