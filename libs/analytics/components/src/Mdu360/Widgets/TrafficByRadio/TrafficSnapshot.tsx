import AutoSizer from 'react-virtualized-auto-sizer'

import { Loader, DonutChart, NoData } from '@acx-ui/components'
import type { DonutChartData }        from '@acx-ui/components'
import { formatter }                  from '@acx-ui/formatter'
import { UseQueryResult }             from '@acx-ui/types'

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

export function TrafficSnapshot ({ queryResults }:
  { queryResults: UseQueryResult<TrafficByRadioData> }) {

  const chartData = getTrafficSnapshotChartData(queryResults?.data)

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) => (
          queryResults.data?.time.length ?
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
    </Loader>
  )
}