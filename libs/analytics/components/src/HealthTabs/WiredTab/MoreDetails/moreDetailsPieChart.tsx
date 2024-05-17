import AutoSizer from 'react-virtualized-auto-sizer'

import { DonutChart, NoData, qualitativeColorSet } from '@acx-ui/components'

import { topNByCpu, topNByDhcp } from './services'

type PieChartData = {
  mac: string
  value: number
  name: string
  color: string
}

type mapping = {
  type: string
  title: string
  pieTitle: string
  tableTitle: string
  pieData: topNByCpu[] | topNByDhcp[] | undefined
}[]
export function transformData (type: string, data: topNByCpu[]|topNByDhcp[]): PieChartData[]{
  const colors = qualitativeColorSet()
  let value: number
  return data.map((val, index: number) => {
    switch(type){
      case 'cpu':
        value = (val as topNByCpu).cpuUtilization
        break
      case 'dhcp':
        value = (val as topNByDhcp).dhcpFailureCount
        break
    }
    return {
      name: val.name,
      mac: val.mac,
      value: value,
      color: colors[index]
    }
  })
}
export const MoreDetailsPieChart = ({ mapping }: { mapping: mapping }) => {
  const pieData = mapping[0]?.pieData
  if (!pieData || pieData.length === 0) {
    return <NoData />
  }
  return (
    <AutoSizer defaultHeight={150}>
      {({ width, height }) => (
        <DonutChart
          data={transformData(mapping[0]?.type, pieData)}
          style={{ height, width, top: 20 }}
          legend='name'
          size={'x-large'}
          showTotal={false}
          showLegend
        />
      )}
    </AutoSizer>
  )
}
