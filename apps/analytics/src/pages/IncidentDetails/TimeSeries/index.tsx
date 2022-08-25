import { Loader } from '@acx-ui/components'

import { failureCharts }                  from './config'
import { ChartDataProps, useChartsQuery } from './services'

export const TimeSeries : React.FC<ChartDataProps> = ({ charts, incident }) => {
  const excludedIncident = ['relatedIncidents']
  const filteredCharts = charts.filter(chart => !excludedIncident.includes(chart))
  const queryResults = useChartsQuery({ charts, incident })

  return (
    <Loader states={[queryResults]}>
      {filteredCharts.map(chart => {
        if(queryResults.data) {
          const Chart = failureCharts[chart].chart!
          return Chart(incident, queryResults.data)
        }
      })}
    </Loader>
  )
}
