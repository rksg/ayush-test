import { Dispatch, SetStateAction, memo, useContext, useEffect } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }              from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader } from '@acx-ui/components'
import type { ConfigChange }               from '@acx-ui/components'

import { ConfigChangeContext, KPIFilterContext } from './context'
import { useConfigChangeQuery }                  from './services'
import { filterData }                            from './Table/util'

function BasicChart (props: {
  selected: ConfigChange | null,
  onClick: (params: ConfigChange) => void,
  chartZoom?: { start: number, end: number },
  setChartZoom?: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>,
  setInitialZoom?: Dispatch<SetStateAction<{ start: number, end: number } | undefined>>,
  legend?: string[],
  setLegend?: Dispatch<SetStateAction<Record<string, boolean> | undefined>>,
  setSelectedData?: React.Dispatch<React.SetStateAction<ConfigChange | null>>,
  setPagination?: (params: { current: number, pageSize: number }) => void
}){
  const { kpiFilter, applyKpiFilter } = useContext(KPIFilterContext)
  const {
    timeRanges: [startDate, endDate],
    setKpiTimeRanges,
    dateRange
  } = useContext(ConfigChangeContext)
  const {
    selected, onClick, chartZoom, setChartZoom, setInitialZoom,
    legend, setLegend, setSelectedData, setPagination
  } = props
  const { path } = useAnalyticsFilter()
  const queryResults = useConfigChangeQuery({
    path,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  }, { selectFromResult: queryResults => ({
    ...queryResults,
    data: filterData(queryResults.data ?? [], kpiFilter, legend)
  }) })

  useEffect(() => {
    setChartZoom?.({
      start: startDate.valueOf(), end: endDate.valueOf()
    })
  }, [dateRange])

  const onDotClick = (params: ConfigChange) => {
    applyKpiFilter([])
    onClick(params)
  }

  return <Loader states={[queryResults]}>
    <Card type='no-border'>
      <AutoSizer>
        {({ width }) =>
          <ConfigChangeChart
            style={{ width }}
            data={queryResults.data}
            chartBoundary={[ startDate.valueOf(), endDate.valueOf() ]}
            onDotClick={onDotClick}
            selectedData={selected!}
            onBrushPositionsChange={setKpiTimeRanges}
            chartZoom={chartZoom}
            setChartZoom={setChartZoom}
            setInitialZoom={setInitialZoom}
            setLegend={setLegend}
            setSelectedData={setSelectedData}
            setPagination={setPagination}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const Chart = memo(BasicChart)
