import { memo, useContext, useEffect } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }              from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader } from '@acx-ui/components'
import type { ConfigChange }               from '@acx-ui/components'

import { ConfigChangeContext }  from './context'
import { useConfigChangeQuery } from './services'
import { filterData }           from './Table/util'

function BasicChart (){
  const { pathFilters } = useAnalyticsFilter()
  const {
    timeRanges: [startDate, endDate], setKpiTimeRanges, dateRange,
    kpiFilter, applyKpiFilter,
    legendFilter, applyLegendFilter,
    pagination, applyPagination,
    selected, setSelected, onDotClick: onClick,
    chartZoom, setChartZoom, setInitialZoom
  } = useContext(ConfigChangeContext)

  const queryResults = useConfigChangeQuery({
    ...pathFilters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }, { selectFromResult: queryResults => ({
    ...queryResults,
    data: filterData(queryResults.data ?? [], kpiFilter, legendFilter)
  }) })

  useEffect(() => {
    setChartZoom?.({ start: startDate.valueOf(), end: endDate.valueOf() })
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
            setLegend={applyLegendFilter}
            setSelectedData={setSelected}
            pagination={pagination}
            setPagination={applyPagination}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const Chart = memo(BasicChart)
