import { Dispatch, SetStateAction, memo, useContext } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter, getFilterPayload } from '@acx-ui/analytics/utils'
import { Card, ConfigChangeChart, Loader }      from '@acx-ui/components'
import type { ConfigChange }                    from '@acx-ui/components'

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
  const { timeRanges: [startDate, endDate], setKpiTimeRanges } = useContext(ConfigChangeContext)
  const { filters: { filter } } = useAnalyticsFilter()
  const {
    selected, onClick, chartZoom,
    setChartZoom, setInitialZoom
  } = props
  const queryResults = useConfigChangeQuery({
    ...getFilterPayload({ filter }),
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
