import { useEffect } from 'react'

import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { Loader, GridRow, GridCol } from '@acx-ui/components'

import { timeSeriesCharts }               from './config'
import { ChartDataProps, useChartsQuery } from './services'

export const TimeSeries: React.FC<ChartDataProps> = (props) => {
  const queryResults = useChartsQuery(props)
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'timeSeriesGroup'
    }
  }
  useEffect(() => { connect('timeSeriesGroup') }, [])

  return (
    <Loader states={[queryResults]}>
      <GridRow>
        {props.charts.map((chart) => {
          const Chart = timeSeriesCharts[chart].chart!
          return <GridCol col={{ span: 24 }} style={{ height: '250px' }} key={chart}>
            <Chart
              chartRef={connectChart}
              data={queryResults.data!}
              incident={props.incident}
              buffer={props.buffer}
            />
          </GridCol>
        })}
      </GridRow>
    </Loader>
  )
}
