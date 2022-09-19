import { Loader, GridRow, GridCol } from '@acx-ui/components'

import { failureCharts }                  from './config'
import { ChartDataProps, useChartsQuery } from './services'

export const TimeSeries : React.FC<ChartDataProps> = ({ charts, incident }) => {
  const excludedIncident = ['relatedIncidents']
  const filteredCharts = charts.filter(chart => !excludedIncident.includes(chart))
  const queryResults = useChartsQuery({ charts, incident })

  return (
    <Loader states={[queryResults]}>
      <GridRow>
        {filteredCharts.map((chart, index) => {
          const Chart = failureCharts[chart].chart!
          return <GridCol col={{ span: 24 }} style={{ height: '250px' }}>
            <Chart incident={incident} data={queryResults.data!} key={index}/>
          </GridCol>
        })}
      </GridRow>
    </Loader>
  )
}
