import { memo, useContext } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }              from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader } from '@acx-ui/components'


import { ConfigChangeContext, KPIFilterContext } from './context'
import { useConfigChangeQuery }                  from './services'
import { filterKPIData }                         from './Table/util'

function BasicChart (){
  const { kpiFilter } = useContext(KPIFilterContext)
  const { timeRanges: [startDate, endDate], setKpiTimeRanges } = useContext(ConfigChangeContext)
  const { path } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({
    path,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  }, { selectFromResult: queryResults => ({
    ...queryResults,
    data: filterKPIData(queryResults.data ?? [], kpiFilter)
  }) })

  return <Loader states={[queryResults]}>
    <Card type='no-border'>
      <AutoSizer>
        {({ width }) =>
          <ConfigChangeChart
            style={{ width }}
            data={queryResults.data ?? []}
            chartBoundary={[ startDate.valueOf(), endDate.valueOf() ]}
            onBrushPositionsChange={setKpiTimeRanges}
            // TODO: need to handle sync betweem chart and table
            // onDotClick={(params) => console.log(params)}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const Chart = memo(BasicChart)
