import { DonutChart, NoData }  from '@acx-ui/components'
import type { DonutChartData } from '@acx-ui/components'
import { formatter }           from '@acx-ui/formatter'
import { UseQueryResult }      from '@acx-ui/types'

import { TrafficByRadioData } from './services'

function sumOfTraffic (trafficData: number[]) {
  return trafficData.reduce((accumulator, current) => accumulator + current, 0)
}

type TrafficData = Omit<TrafficByRadioData, 'time' | 'userTraffic_all'>

const nameMap = {
  userTraffic_24: '2.4 GHz',
  userTraffic_5: '5 GHz',
  userTraffic_6: '6 GHz'
}

function getTrafficSnapshotChartData (data: TrafficByRadioData | undefined): DonutChartData[]{
  const trafficSnapshotChartData: DonutChartData[] = []

  for (const key in data) {
    if (key !== 'time' && key !== 'userTraffic_all') {
      const dataVolume : number = sumOfTraffic(data[key as keyof TrafficData])
      if (dataVolume) {
        trafficSnapshotChartData.push({
          name: nameMap[key as keyof TrafficData],
          value: dataVolume
        })
      }
    }
  }

  return trafficSnapshotChartData
}

export function TrafficSnapshot ({
  queryResults,
  height,
  width
}: {
  queryResults: UseQueryResult<TrafficByRadioData>,
  height: number,
  width: number
}) {
  const chartData = getTrafficSnapshotChartData(queryResults?.data)

  return chartData.length ? (
    <DonutChart
      style={{ width, height: Math.min(height, 203) }}
      data={chartData}
      showLegend
      showTotal
      showValue
      showLabel
      legend='name-bold-value'
      dataFormatter={formatter('bytesFormat')}
      size={'large'}
    />
  ) : (
    <NoData />
  )
}