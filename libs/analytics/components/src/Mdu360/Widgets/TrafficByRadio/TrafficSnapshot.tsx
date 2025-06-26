import AutoSizer from 'react-virtualized-auto-sizer'

import { DonutChart, NoData }  from '@acx-ui/components'
import type { DonutChartData } from '@acx-ui/components'
import { formatter }           from '@acx-ui/formatter'
import { UseQueryResult }      from '@acx-ui/types'

import { TrafficByRadioData } from './services'

function getTrafficSnapshotChartData (data: TrafficByRadioData | undefined): DonutChartData[]{
  const trafficSnapshotChartData: DonutChartData[] = []

  function sumOfTraffic (trafficData: number[]) {
    return trafficData.reduce((accumulator, current) => accumulator + current, 0)
  }

  type TrafficData = Omit<TrafficByRadioData, 'time' | 'userTraffic_all'>

  const nameMap = {
    userTraffic_24: '2.4 GHz',
    userTraffic_5: '5 GHz',
    userTraffic_6: '6 GHz'
  }

  for (const key in data) {
    if (key !== 'time' && key !== 'userTraffic_all') {
      trafficSnapshotChartData.push({
        name: nameMap[key as keyof TrafficData],
        value: sumOfTraffic(data[key as keyof TrafficData])
      })
    }
  }

  return trafficSnapshotChartData
}

function hasData (chartData: DonutChartData[]): boolean {
  console.log(chartData)
  if (chartData[0].value === 0 && chartData[1].value === 0 && chartData[2].value === 0) {
    return false
  }
  return true
}

export function TrafficSnapshot ({ queryResults }:
  { queryResults: UseQueryResult<TrafficByRadioData> }) {

  const chartData = getTrafficSnapshotChartData(queryResults?.data)

  return (
    <AutoSizer>
      {({ height, width }) => (
        queryResults.data?.time.length && hasData(chartData) ?
          <DonutChart
            style={{ width, height }}
            data={chartData}
            showLegend={true}
            showTotal={true}
            showValue={true}
            showLabel={true}
            legend='name-bold-value'
            dataFormatter={formatter('bytesFormat')}
            size={'large'}
          />
          : <NoData />
      )}
    </AutoSizer>
  )
}