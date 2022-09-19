import { Loader, GridRow, GridCol } from '@acx-ui/components'

import { failureCharts }                  from './config'
import { ChartDataProps, useChartsQuery } from './services'

export const TimeSeries : React.FC<ChartDataProps> = ({ charts, incident }) => {
  const queryResults = useChartsQuery({ charts, incident })

  return (
    <Loader states={[queryResults]}>
      <GridRow>
        {charts.map((chart) => {
          const chartConfig = failureCharts[chart]
          const Chart = chartConfig.chart!
          return <GridCol col={{ span: 24 }} style={{ height: '250px' }} key={chartConfig.key}>
            <Chart incident={incident} data={queryResults.data!} />
          </GridCol>
        })}
      </GridRow>
    </Loader>
  )
}
