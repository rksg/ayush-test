import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  NoData,
  DonutChart,
  qualitativeColorSet
} from '@acx-ui/components'
import type { DonutChartData }  from '@acx-ui/components'
import { formatter }            from '@acx-ui/formatter'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { HierarchyNodeData, useTopAppsByTrafficQuery } from './services'

function getTopAppsByTrafficChartData (data: HierarchyNodeData): DonutChartData[] {
  const chartData: DonutChartData[] = []
  const colorMapping = qualitativeColorSet()

  if (data && data?.topNAppByTotalTraffic?.length > 0) {
    data.topNAppByTotalTraffic.forEach(({ name, applicationTraffic }, i) => {
      chartData.push({
        name,
        value: applicationTraffic,
        color: colorMapping[i]
      })
    })
  }
  return chartData
}

export function dataFormatter (value: unknown){
  return formatter('bytesFormat')(value)
}

export function TopAppsByTraffic ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTopAppsByTrafficQuery(filters,{
    selectFromResult: ({ data, ...rest }) => ({
      data: getTopAppsByTrafficChartData(data!),
      ...rest
    })
  })

  const isDataAvailable = queryResults.data && queryResults.data.length > 0

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Applications by Traffic' })}>
        <AutoSizer>
          {({ height, width }) => (
            isDataAvailable ?
              <div style={{ margin: '10px 0px' }}>
                <DonutChart
                  style={{ width, height: height-30 }}
                  data={queryResults.data}
                  showLegend={true}
                  showTotal={false}
                  legend='name'
                  dataFormatter={dataFormatter}
                  size={'x-large'}
                />
              </div>
              : <NoData />
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
