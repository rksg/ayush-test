import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { DonutChart, HistoricalCard, Loader, NoData } from '@acx-ui/components'
import type { DonutChartData }                        from '@acx-ui/components'
import { formatter }                                  from '@acx-ui/formatter'

import { Mdu360TabProps } from '../../types'

import { IntentHighlight, useIntentAISummaryQuery } from './services'

function hasData (intentAISummaryChartData: DonutChartData[]) : Boolean {
  if (
    intentAISummaryChartData[0].value === 0 &&
    intentAISummaryChartData[1].value === 0 &&
    intentAISummaryChartData[2].value === 0 &&
    intentAISummaryChartData[3].value === 0
  ) {
    return false
  }
  return true
}

function getIntentAISummaryChartData (data: IntentHighlight | undefined): DonutChartData[] {
  const intentAISummaryChartData: DonutChartData[] = [
    { name: 'New', value: 0 },
    { name: 'Active', value: 0 },
    { name: 'Paused', value: 0 },
    { name: 'Verified', value: 0 }
  ]

  for (const intent in data ) {
    const currentIntent = data[intent as keyof IntentHighlight]

    intentAISummaryChartData[0].value += currentIntent?.new ?? 0
    intentAISummaryChartData[1].value += currentIntent?.active ?? 0
    intentAISummaryChartData[2].value += currentIntent?.paused ?? 0
    intentAISummaryChartData[3].value += currentIntent?.verified ?? 0
  }

  return hasData(intentAISummaryChartData) ? intentAISummaryChartData : []
}

export function IntentAISummary ({ filters }: { filters: Mdu360TabProps }) {
  const { $t } = useIntl()

  const queryResults = useIntentAISummaryQuery({
    path: [{ type: 'network', name: 'Network' }] // replace this with the path when provided by ResidentExperienceTab
  })

  // const queryResults = {
  //   data: {
  //     highlights: {
  //       rrm: {
  //         new: 1,
  //         active: 0,
  //         paused: 7,
  //         verified: 3
  //       },
  //       probeflex: {
  //         new: 0,
  //         active: 0,
  //         paused: 3,
  //         verified: 6
  //       },
  //       ops: {
  //         new: 0,
  //         active: 0,
  //         paused: 8,
  //         verified: 14
  //       },
  //       ecoflex: {
  //         new: 0,
  //         active: 4,
  //         paused: 1,
  //         verified: 1
  //       }
  //     }
  //   }
  // }

  const chartData: DonutChartData[] = getIntentAISummaryChartData(queryResults.data)
  // const chartData: DonutChartData[] = getIntentAISummaryChartData(queryResults.data.highlights)

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