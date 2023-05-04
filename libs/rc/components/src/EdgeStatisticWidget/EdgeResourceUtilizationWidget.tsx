import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  Loader,
  MultiLineTimeSeriesChart,
  NoData
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import { EdgeResourceUtilizationWidgetMockData } from './__test__/fixture'

type Key = keyof Omit<ResourceUtilizationData, 'time'>

export type ResourceUtilizationData = {
  time: string[]
  cpu: number[]
  memory: number[]
  disk: number[]
}

function EdgeResourceUtilizationWidget () {
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'cpu', name: $t({ defaultMessage: 'CPU' }) },
    { key: 'memory', name: $t({ defaultMessage: 'Memory' }) },
    { key: 'disk', name: $t({ defaultMessage: 'Disk' }) }
  ] as Array<{ key: Key, name: string }>

  // TODO: wait for backend support, use fake empty data for testing
  // API response format is still TBD
  // const queryResults = { data: [], isLoading: false }
  // eslint-disable-next-line max-len
  const queryResults = { data: getSeriesData(EdgeResourceUtilizationWidgetMockData.timeSeries, seriesMapping), isLoading: false }

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Resource Utilization' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                seriesFormatters={{
                  cpu: formatter('percent'),
                  memory: formatter('percent'),
                  disk: formatter('percent')
                }}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}

export { EdgeResourceUtilizationWidget }