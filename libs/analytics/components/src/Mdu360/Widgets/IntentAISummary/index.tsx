import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { DonutChart, HistoricalCard, Loader, NoData } from '@acx-ui/components'
import type { DonutChartData }                        from '@acx-ui/components'
import { formatter }                                  from '@acx-ui/formatter'

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
    path: [{ type: 'network', name: 'Network' }] // replace this with the path when provided by ResidentExperienceTab
  })

  const chartData: DonutChartData[] = useMemo(() => {
    return getIntentAISummaryChartData(queryResults.data)
  }, [queryResults.data])

  return (
    <Loader>
      <HistoricalCard title={$t({ defaultMessage: 'IntentAI Summary' })}>
        {chartData.length ?
          <AutoSizer>
            {({ height, width }) => (
              <DonutChart
                style={{ width, height }}
                data={chartData}
                showLegend={true}
                showTotal={true}
                showValue={true}
                showLabel={true}
                legend='name-bold-value'
                dataFormatter={formatter('noFormat')}
                size={'large'}
              />
            )}
          </AutoSizer> : <NoData/>}
      </HistoricalCard>
    </Loader>
  )
}