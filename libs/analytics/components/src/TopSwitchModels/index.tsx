import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import type { DonutChartData }                                             from '@acx-ui/components'
import { HistoricalCard, Loader, NoData, DonutChart, qualitativeColorSet } from '@acx-ui/components'
import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { useTrackLoadTime, widgetsMapping }                                from '@acx-ui/utils'
import type { AnalyticsFilter }                                            from '@acx-ui/utils'

import { useTopSwitchModelsQuery } from './services'

import type { SwitchModel } from './services'

function getTopSwitchModelsDonutChartData (data: SwitchModel[]): DonutChartData[] {
  const chartData: DonutChartData[] = []
  const colorMapping = qualitativeColorSet()
  if (data && data.length > 0) {
    data.forEach(({ name, count }, i) => {
      chartData.push({
        name,
        value: count,
        color: colorMapping[i]
      })
    })
  }
  return chartData
}

export { TopSwitchModelsWidget as TopSwitchModels }

function TopSwitchModelsWidget ({ filters }: { filters: AnalyticsFilter }) {
  const { $t } = useIntl()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const queryResults = useTopSwitchModelsQuery(filters,{
    selectFromResult: ({ data, ...rest }) => ({
      data: getTopSwitchModelsDonutChartData(data!),
      ...rest
    })
  })

  const isDataAvailable = queryResults.data && queryResults.data.length > 0

  useTrackLoadTime({
    itemName: widgetsMapping.TOP_SWITCH_MODELS,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Switch Models' })}>
        <AutoSizer>
          {({ height, width }) => (
            isDataAvailable ?
              <DonutChart
                style={{ width, height }}
                data={queryResults.data}
                title={$t({ defaultMessage: 'Models' })}
                showLabel={true}
                showTotal={false}
                showLegend={false}
                tooltipFormat={defineMessage({
                  defaultMessage: `{name}<br></br>
                    <space><b>{formattedValue}</b> ({formattedPercent})</space>`
                })}
                size={'large'}
              />
              : <NoData />
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
