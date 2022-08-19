import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Card, Loader, DonutChart, cssStr } from '@acx-ui/components'
import type { DonutChartData }              from '@acx-ui/components'

import { useTopSwitchModelsQuery } from './services'

import type { SwitchModel } from './services'

const colorMapping = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-60'),
  cssStr('--acx-accents-orange-25'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-semantics-yellow-40')
] as Array<string>

function getTopSwitchModelsDonutChartData (data: SwitchModel[]): DonutChartData[] {
  const chartData: DonutChartData[] = []
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

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Switch Models' })} >
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              data={queryResults.data}
              title={$t({ defaultMessage: 'Models' })}
              showLabel={true}
              showTotal={false}
              showLegend={false}
              showTooltipPercentage={true}
              type={'large'}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default TopSwitchModelsWidget
