import { Loader, GridRow, GridCol } from '@acx-ui/components'

import { timeSeriesCharts }               from './config'
import { ChartDataProps, useChartsQuery } from './services'

export const TimeSeries: React.FC<ChartDataProps> = (props) => {
  const queryResults = useChartsQuery(props)

  return (
    <Loader states={[queryResults]}>
      <GridRow>
        {props.charts.map((chart) => {
          const Chart = timeSeriesCharts[chart].chart!
          return <GridCol col={{ span: 24 }} style={{ height: '250px' }} key={chart}>
            <Chart incident={props.incident} data={queryResults.data!} />
          </GridCol>
        })}
      </GridRow>
    </Loader>
  )
}
