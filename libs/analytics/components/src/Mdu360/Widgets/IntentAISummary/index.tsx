import React from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { DonutChart, Card, Loader, NoData } from '@acx-ui/components'
import type { DonutChartData }              from '@acx-ui/components'

import { IntentSummary, useIntentAISummaryQuery } from './services'

function getIntentAISummaryChartData (data: IntentSummary | undefined): DonutChartData[] {
  const intentAISummaryChartData: DonutChartData[] = [
    { name: 'New', value: 0 },
    { name: 'Active', value: 0 },
    { name: 'Paused', value: 0 },
    { name: 'Verified', value: 0 }
  ]

  if (data === undefined) {
    return []
  }

  for (const intent of Object.values(data!) ) {
    intentAISummaryChartData[0].value += intent?.new ?? 0
    intentAISummaryChartData[1].value += intent?.active ?? 0
    intentAISummaryChartData[2].value += intent?.paused ?? 0
    intentAISummaryChartData[3].value += intent?.verified ?? 0
  }

  return intentAISummaryChartData.filter(({ value }) => value > 0)
}

export function IntentAISummary () {
  const { $t } = useIntl()

  const queryResults = useIntentAISummaryQuery({
    path: [{ type: 'network', name: 'Network' }] // replace this with the path when provided by NetworkOverviewTab
  })

  const chartData: DonutChartData[] = getIntentAISummaryChartData(queryResults.data)

  const IntentAISummaryChart: React.FC<{ data: DonutChartData[] }> = React.memo(({ data }) => {
    return (
      <AutoSizer>
        {({ height, width }) => (
          <DonutChart
            style={{ width, height }}
            data={data}
            showLegend
            showTotal
            showValue
            showLabel
            legend='name-bold-value'
            size={'large'}
          />
        )}
      </AutoSizer>
    )})

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'IntentAI Summary' })}>
        {chartData.length ?
          <IntentAISummaryChart data={chartData}/> : <NoData/>}
      </Card>
    </Loader>
  )
}