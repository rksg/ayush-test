import { Dispatch, SetStateAction, memo, useContext, useEffect } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }              from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader } from '@acx-ui/components'
import type { ConfigChange }               from '@acx-ui/components'

import { ConfigChangeContext, KPIFilterContext } from './context'
import { useConfigChangeQuery }                  from './services'
import { filterKPIData }                         from './Table/util'

function BasicChart (props: {
  selected: ConfigChange | null,
  onClick: (params: ConfigChange) => void,
  chartZoom?: { start: number, end: number },
  setChartZoom?: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>
  setInitialZoom?: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>
}){
  const { kpiFilter } = useContext(KPIFilterContext)
  const {
    timeRanges: [startDate, endDate],
    setKpiTimeRanges,
    dateRange
  } = useContext(ConfigChangeContext)
  const {
    selected, onClick, chartZoom,
    setChartZoom, setInitialZoom
  } = props
  const { path } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({
    path,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  }, { selectFromResult: queryResults => ({
    ...queryResults,
    data: filterKPIData(queryResults.data ?? [], kpiFilter)
  }) })

  useEffect(() => {
    setChartZoom?.({
      start: startDate.valueOf(), end: endDate.valueOf()
    })
  }, [dateRange])

  return <Loader states={[queryResults]}>
    <Card type='no-border'>
      <AutoSizer>
        {({ width }) =>
          <ConfigChangeChart
            style={{ width }}
            data={queryResults.data ?? []}
            chartBoundary={[ startDate.valueOf(), endDate.valueOf() ]}
            onDotClick={onClick}
            selectedData={selected?.id}
            onBrushPositionsChange={setKpiTimeRanges}
            chartZoom={chartZoom}
            setChartZoom={setChartZoom}
            setInitialZoom={setInitialZoom}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const Chart = memo(BasicChart)
