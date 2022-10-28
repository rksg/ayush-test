import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }                                       from '@acx-ui/analytics/utils'
import type { DonutChartData }                                   from '@acx-ui/components'
import { Card, Loader, NoData, DonutChart, qualitativeColorSet } from '@acx-ui/components'

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

function TopSwitchModelsWidget ({ filters }: { filters: AnalyticsFilter }) {
  const { $t } = useIntl()
  const queryResults = useTopSwitchModelsQuery(filters,{
    selectFromResult: ({ data, ...rest }) => ({
      data: getTopSwitchModelsDonutChartData(data!),
      ...rest
    })
  })

  const isDataAvailable = queryResults.data && queryResults.data.length > 0

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Switch Models' })} >
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
      </Card>
    </Loader>
  )
}

export default TopSwitchModelsWidget
