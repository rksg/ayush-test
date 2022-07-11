import { countBy } from 'lodash'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader }            from '@acx-ui/components'
import { Card }                      from '@acx-ui/components'
import { DonutChart }                from '@acx-ui/components'
import type { DonutChartData }       from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import {
  Dashboard
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

const seriesMapping = [
  { name: 'Good', color: cssStr('--acx-semantics-green-60') },
  { name: 'Average', color: cssStr('--acx-semantics-yellow-40') },
  { name: 'Poor', color: cssStr('--acx-semantics-red-50') }
] as Array<{ name: string, color: string }>

const getAPClientChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const clientDto = overviewData?.summary?.clients?.clientDto
  if (clientDto && clientDto.length > 0) {
    const counts = countBy(clientDto, client => client.healthCheckStatus)
    seriesMapping.forEach(({ name, color }) =>
      chartData.push({
        name,
        value: counts[name] || 0,
        color
      }))
  }
  return chartData
}

const getSwitchClientChartData = (overviewData?: Dashboard): DonutChartData[] => {
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

export function Clients () {
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
                data={queryResults.data.apData}/>
              <DonutChart
                style={{ width: width/2, height }}
                title='Switch'
                data={queryResults.data.switchData} />
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
