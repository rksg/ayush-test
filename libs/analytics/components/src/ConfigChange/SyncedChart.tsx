import { memo, useContext, useEffect } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }              from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader } from '@acx-ui/components'

import { ConfigChangeContext }        from './context'
import { useConfigChangeSeriesQuery } from './services'

function BasicChart (){
  const { pathFilters } = useAnalyticsFilter()
  const {
    timeRanges: [startDate, endDate], setKpiTimeRanges, dateRange,
    entityList, kpiFilter,
    entityNameSearch, entityTypeFilter,
    pagination, applyPagination,
    selected, setSelected, onDotClick,
    chartZoom, setChartZoom, setInitialZoom
  } = useContext(ConfigChangeContext)

  const queryResults = useConfigChangeSeriesQuery({
    ...pathFilters,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    filterBy: {
      kpiFilter,
      entityName: entityNameSearch,
      entityType: entityTypeFilter.length === 0
        ? entityList.map(t => t.key) : entityTypeFilter
    }
  })

  useEffect(
    () => setChartZoom?.({ start: startDate.valueOf(), end: endDate.valueOf() }),
    [dateRange]
  )

  useEffect(
    ()=> applyPagination({ total: queryResults.data?.length || 0 }),
    [queryResults]
  )

  return <Loader states={[queryResults]}>
    <Card type='no-border'>
      <AutoSizer>
        {({ width }) =>
          <ConfigChangeChart
            style={{ width }}
            data={queryResults.data!}
            chartBoundary={[ startDate.valueOf(), endDate.valueOf() ]}
            onDotClick={onDotClick}
            selectedData={selected!}
            onBrushPositionsChange={setKpiTimeRanges}
            chartZoom={chartZoom}
            setChartZoom={setChartZoom}
            setInitialZoom={setInitialZoom}
            setSelectedData={setSelected}
            pagination={pagination}
            setPagination={applyPagination}
          />}
      </AutoSizer>
    </Card>
  </Loader>
}

export const SyncedChart = memo(BasicChart)
