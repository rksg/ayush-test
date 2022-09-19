import { forwardRef, RefObject } from 'react'

import ReactECharts from 'echarts-for-react'
import EChartsReact from 'echarts-for-react'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { MultiLineTimeSeriesChartData }                                       from '@acx-ui/analytics/utils'
import { Card, cssStr, Loader, MultiLineTimeSeriesChart, NoData, QueryState } from '@acx-ui/components'

import { TimeWindow } from '../../pages/Health/HealthPageContext'


const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

interface HealthTimeSeriesChartProps {
  queryResults: QueryState & { data: MultiLineTimeSeriesChartData[] }
  setTimeWindow: React.Dispatch<React.SetStateAction<TimeWindow>>
  brush?: TimeWindow
}

const HealthTimeSeriesChart = forwardRef<ReactECharts, HealthTimeSeriesChartProps>((
  props,
  ref
) => {
  const { queryResults, setTimeWindow, brush } = props
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
                  brush={brush}
                  style={{ width, height: 200 }}
                  chartRef={ref as RefObject<EChartsReact> | undefined}
                  ref={ref}
                  onBrushChange={(range) => setTimeWindow(range as TimeWindow)}
                />
                : <NoData />}
            </Card>
          </div>
        )}
      </AutoSizer>
    </Loader>
  )})

export default HealthTimeSeriesChart
