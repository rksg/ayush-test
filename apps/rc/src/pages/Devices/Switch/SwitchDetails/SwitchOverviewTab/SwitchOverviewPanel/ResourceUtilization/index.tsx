import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                                            from '@acx-ui/analytics/utils'
import { HistoricalCard, Loader, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { formatter }                                                from '@acx-ui/formatter'
import type { AnalyticsFilter }                                     from '@acx-ui/utils'

import {
  useResourceUtilizationQuery,
  ResourceUtilizationData
} from './services'


type Key = keyof Omit<ResourceUtilizationData, 'time'>

export { ResourceUtilizationWidget as ResourceUtilization }

function ResourceUtilizationWidget ({ filters }: { filters : AnalyticsFilter }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'cpuPercent', name: $t({ defaultMessage: 'CPU' }) },
    { key: 'memoryPercent', name: $t({ defaultMessage: 'Memory' }) },
    { key: 'poePercent', name: $t({ defaultMessage: 'PoE' }) }
  ] as Array<{ key: Key, name: string }>
  const queryResults = useResourceUtilizationQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, seriesMapping),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Resource Utilization' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                dataFormatter={formatter('percentFormat')}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}

