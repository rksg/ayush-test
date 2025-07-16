import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { DonutChart, HistoricalCard, Loader, NoData } from '@acx-ui/components'
import type { DonutChartData }                        from '@acx-ui/components'
import { formatter }                                  from '@acx-ui/formatter'
import { UseQueryResult }                             from '@acx-ui/types'

import { Mdu360TabProps } from '../../types'

import {  } from './services'

export function IntentAISummary ({ filters }: { filters: Mdu360TabProps }) {

  const { $t } = useIntl()

  const chartData: DonutChartData[] = [{ value: 0, name: 'test' }]

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
                dataFormatter={formatter('bytesFormat')}
                size={'large'}
              />
            )}
          </AutoSizer> : <NoData/>}
      </HistoricalCard>
    </Loader>
  )
}