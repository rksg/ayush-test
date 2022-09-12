import { Space } from 'antd'

import { Loader } from '@acx-ui/components'

import { failureCharts }                  from './config'
import { ChartDataProps, useChartsQuery } from './services'

export const TimeSeries : React.FC<ChartDataProps> = ({ charts, incident }) => {
  const excludedIncident = ['relatedIncidents']
  const filteredCharts = charts.filter(chart => !excludedIncident.includes(chart))
  const queryResults = useChartsQuery({ charts, incident })

  return (
    <Loader states={[queryResults]}>
      {filteredCharts.map((chart, index) => {
        const Chart = failureCharts[chart].chart!
        return <Space
          direction='vertical'
          size={'middle'}
          key={`space${index}`}
          style={{ paddingTop: '30px' }}
        >
          <Chart incident={incident} data={queryResults.data!} key={index}/>
        </Space>
      })}
    </Loader>
  )
}
