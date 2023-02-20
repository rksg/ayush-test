import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import type { DonutChartData }                         from '@acx-ui/components'
import {
  cssStr, DonutChart, HistoricalCard, Loader, NoData
} from '@acx-ui/components'
import { EdgePortStatus } from '@acx-ui/rc/utils'

type ReduceReturnType = Record<string, number>
const getChartData = (ports: EdgePortStatus[]): DonutChartData[] => {
  // TODOs: generate series mapping data dynamically by the responsed data.

  //
  const seriesMapping = [
    { key: 'Enabled',
      name: 'Up',
      color: cssStr('--acx-semantics-green-50') },
    { key: 'Disabled',
      name: 'Down',
      color: cssStr('--acx-accents-orange-30') }
  ] as Array<{ key: string, name: string, color: string }>
  const chartData: DonutChartData[] = []

  if (ports && ports.length > 0) {
    const portsSummary = ports.reduce<ReduceReturnType>((acc, { adminStatus }) => {
      acc[adminStatus] = (acc[adminStatus] || 0) + 1
      return acc
    }, {})

    seriesMapping.forEach(({ key, name, color }) => {
      if (portsSummary[key]) {
        chartData.push({
          name,
          value: portsSummary[key],
          color
        })
      }
    })
  }

  return chartData
}

export function EdgePortsByTrafficWidget ({ edgePortsSetting, isLoading }:
   { edgePortsSetting: EdgePortStatus[], isLoading: boolean }) {
  const { $t } = useIntl()

  // TODO: retrieve by API, use fake data for testing
  const chartData = getChartData(edgePortsSetting)

  return (
    <Loader states={[ { isLoading } ]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Ports by Traffic' })}>
        <AutoSizer>
          {({ height, width }) => (
            chartData && chartData.length > 0
              ?
              <DonutChart
                title={$t({ defaultMessage: 'Ports' })}
                style={{ width, height }}
                legend={'name-value'}
                data={chartData}
              />
              : <NoData />
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}