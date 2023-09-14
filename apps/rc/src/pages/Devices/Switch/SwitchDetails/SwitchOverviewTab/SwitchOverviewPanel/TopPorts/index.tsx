import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { getSeriesData }                                                   from '@acx-ui/analytics/utils'
import { DonutChartData, MultiLineTimeSeriesChart }                        from '@acx-ui/components'
import { HistoricalCard, Loader, NoData, DonutChart, qualitativeColorSet } from '@acx-ui/components'
import { formatter }                                                       from '@acx-ui/formatter'
import type { AnalyticsFilter }                                            from '@acx-ui/utils'

import { Ports, useTopPortsQuery } from './services'

function getTopPortsDonutChartData (data: Ports[]): DonutChartData[] {
  const chartData: DonutChartData[] = []
  const colorMapping = qualitativeColorSet()
  if (data && data.length > 0) {
    data.forEach(({ name, metricValue }, i) => {
      chartData.push({
        name,
        value: metricValue,
        color: colorMapping[i]
      })
    })
  }
  return chartData
}

function getTopPortsLineChartData (data: Ports[]) {
  let seriesMapping: { key: string, name:string }[] = []
  const tmpData: { [key:string]: number[] | string[] } = {}
  tmpData['time'] = data[0].timeSeries.time
  data.forEach(item=> {
    tmpData[item.name] = item.timeSeries.metricValue
    seriesMapping.push({ key: item.name, name: item.name })
  })
  return getSeriesData(tmpData, seriesMapping)
}

export { TopPortsWidget as TopPorts }

function TopPortsWidget ({ filters, type }: {
  filters: AnalyticsFilter & { by: 'traffic' | 'error' },
  type: 'donut' | 'line' }) {
  const { $t } = useIntl()
  const queryResults = useTopPortsQuery(filters,{
    selectFromResult: ({ data, ...rest }) => ({
      data,
      ...rest
    })
  })
  const isDataAvailable = queryResults.data && queryResults.data.length > 0

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={filters.by === 'traffic' ?
        $t({ defaultMessage: 'Top 10 Ports by Traffic' }) :
        $t({ defaultMessage: 'Top 10 Ports by Errors' })
      }>
        <AutoSizer>
          {({ height, width }) => (
            isDataAvailable ?
              ( type === 'donut'
                ? <DonutChart
                  style={{ width, height }}
                  data={getTopPortsDonutChartData(queryResults.data!)}
                  title={$t({ defaultMessage: 'Ports' })}
                  showLabel={true}
                  showTotal={false}
                  showLegend={false}
                  tooltipFormat={defineMessage({
                    defaultMessage: `{name}<br></br>
                    <space><b>{formattedValue}</b> ({formattedPercent})</space>`
                  })}
                  dataFormatter={formatter('bytesFormat')}
                  size={'large'}
                />
                : <MultiLineTimeSeriesChart
                  style={{ width, height }}
                  data={getTopPortsLineChartData(queryResults.data!)}
                  dataFormatter={formatter('bytesFormat')}
                  legendFormatter={() => ''}
                />
              )
              : <NoData />
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
