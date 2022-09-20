import { forwardRef, useCallback } from 'react'

import ReactECharts from 'echarts-for-react'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { MultiLineTimeSeriesChartData }                                       from '@acx-ui/analytics/utils'
import { Card, cssStr, Loader, MultiLineTimeSeriesChart, NoData, QueryState } from '@acx-ui/components'                                             
import { TimeStamp }                                                          from '@acx-ui/types'

import { TimeWindow } from '../../pages/Health/HealthPageContext'



const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

export interface HealthTimeSeriesChartProps {
  timeWindow?: TimeWindow
  setTimeWindow?: (range: TimeWindow) => void,
  queryResults: QueryState & { data: MultiLineTimeSeriesChartData[] }
}

const HealthTimeSeriesChart = forwardRef<ReactECharts, HealthTimeSeriesChartProps>((
  props,
  ref
) => {
  const { 
    timeWindow,
    setTimeWindow,
    queryResults
  } = props

  const onBrushChange = useCallback((range: TimeWindow | TimeStamp[]) => {
    if (!timeWindow) return

    if (!ref) return

    if (!setTimeWindow) return

    if (range[0] !== timeWindow[0]) {
      setTimeWindow(range as TimeWindow)
    }

    if (range[1] !== timeWindow[1]) {
      setTimeWindow(range as TimeWindow)
    }
  }, [setTimeWindow, timeWindow, ref])

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ width }) => (
          <div style={{ width, height: 250 }}>
            <Card>
              {(queryResults.data && queryResults.data.length > 0)
                ? <MultiLineTimeSeriesChart
                  data={queryResults.data}
                  lineColors={lineColors}
                  brush={timeWindow}
                  style={{ width, height: 200 }}
                  ref={ref}
                  onBrushChange={onBrushChange}
                />
                : <NoData />}
            </Card>
          </div>
        )}
      </AutoSizer>
    </Loader>
  )})

export default HealthTimeSeriesChart
