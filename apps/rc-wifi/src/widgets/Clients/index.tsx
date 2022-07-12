import { countBy } from 'lodash'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader }            from '@acx-ui/components'
import { Card }                      from '@acx-ui/components'
import { DonutChart }                from '@acx-ui/components'
import type { DonutChartData }       from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { Dashboard }                 from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

const seriesMapping = [
  { name: 'Poor', color: cssStr('--acx-semantics-red-50') },
  { name: 'Average', color: cssStr('--acx-semantics-yellow-40') },
  { name: 'Good', color: cssStr('--acx-semantics-green-60') },
  { name: 'Unknown', color: cssStr('--acx-neutrals-50') }
] as Array<{ name: string, color: string }>

export const getAPClientChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const clientDto = overviewData?.summary?.clients?.clientDto
  if (clientDto && clientDto.length > 0) {
    const counts = countBy(clientDto, client => client.healthCheckStatus)
    seriesMapping.forEach(({ name, color }) => {
      if(counts[name] && counts[name] > 0) {
        chartData.push({
          name,
          value: counts[name],
          color
        })
      }
    })
  }
  return chartData
}

export const getSwitchClientChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchClients = overviewData?.summary?.switchClients
  if (switchClients && switchClients.totalCount > 0) {
    chartData.push({
      name: 'Clients',
      value: switchClients.totalCount,
      color: cssStr('--acx-semantics-green-60')
    })
  }
  return chartData
}

function Clients () {
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        apData: getAPClientChartData(data),
        switchData: getSwitchClientChartData(data)
      },
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <Card title='Clients'>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'inline-flex' }}>
              <DonutChart
                style={{ width: width/2 , height }}
                title='Wi-Fi'
                showLegend={false}
                data={queryResults.data.apData}/>
              <DonutChart
                style={{ width: width/2, height }}
                title='Switch'
                showLegend={false}
                data={queryResults.data.switchData} />
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default Clients
