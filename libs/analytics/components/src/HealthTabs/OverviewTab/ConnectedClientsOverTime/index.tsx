import React from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  NoData,
  MultiLineTimeSeriesChart,
  qualitativeColorSet } from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import type { AnalyticsFilter }   from '@acx-ui/utils'

import { ConnectedClientsOverTimeData, useHealthConnectedClientsOverTimeQuery } from './services'

type Key = keyof Omit<ConnectedClientsOverTimeData, 'time'>

export function ConnectedClientsOverTime ({
  filters
}: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const chartColors = qualitativeColorSet()
  const isSwitchHealth10010eEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_10010E_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_10010E_TOGGLE)
  ].some(Boolean)

  const seriesMapping = [
    { key: 'wirelessClientsCount', name: $t({ defaultMessage: 'Wireless Clients' }) }
  ] as unknown as Array<{ key: Key, name: string }>
  if(isSwitchHealth10010eEnabled){
    seriesMapping.push({ key: 'wiredClientsCount', name: $t({ defaultMessage: 'Wired Clients' }) })
  }

  const queryResults = useHealthConnectedClientsOverTimeQuery(
    { ...filters , isSwitchHealth10010eEnabled }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: getSeriesData(data!, seriesMapping)
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
                seriesYAxisIndexes={[0, 1]}
                seriesChartTypes={['line', 'line']}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
