import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'
import {
  Card,
  Subtitle,
  StackedBarChart,
  Loader
 }                     from '@acx-ui/components'

import { formatter }                from '@acx-ui/utils'
import { TrafficByVolumeData }     from './services'
import { useTrafficByVolumeQuery } from './services'

export const seriesMapping = [
  { key: 'totalTraffic_all', name: 'All Radios' },
  { key: 'totalTraffic_24', name: formatter('radioFormat')('2.4') },
  { key: 'totalTraffic_5', name: formatter('radioFormat')('5') },
  { key: 'totalTraffic_6', name: formatter('radioFormat')('6') }
] as Array<{ key: keyof Omit<TrafficByVolumeData, 'time'>, name: string }>


const data = [{
  category: 'P1',
  series: [
    { name: 'p1', value: 10 }
  ]
},{
  category: 'P2',
  series: [
    { name: 'p1', value: 0 },
    { name: 'p2', value: 5 },
    { name: 'p3', value: 0 },
    { name: 'p4', value: 0 }
  ]
}, {
  category: 'P3',
  series: [
    { name: 'p1', value: 0 },
    { name: 'p2', value: 0 },
    { name: 'p3', value: 7 },
    { name: 'p4', value: 0 }
  ]
}, {
  category: 'P4',
  series: [
    { name: 'p1', value: 0 },
    { name: 'p2', value: 0 },
    { name: 'p3', value: 0 },
    { name: 'p4', value: 2 }
  ]
}].reverse()

function IncidentBySeverityWidget () {
  // const filters = useGlobalFilter()
  // const queryResults = useTrafficByVolumeQuery(filters,
  //   {
  //     selectFromResult: ({ data, ...rest }) => ({
  //       data: getSeriesData(data!, seriesMapping),
  //       ...rest
  //     })
  //   })
  return (
    // <Loader states={[queryResults]}>
      <Card title='Total Incidents'>
       <Subtitle level={3}>90</Subtitle>
       <StackedBarChart
         style={{ height: 85 }}
         data={data.slice(0, 1)}
         showLabels={true}
         showTotal={true}
         axisLabelWidth={15}
         setBarColor={(data: any) => console.log(data)}
        />
        
      </Card>
    //    <AutoSizer>
    //    {({ height, width }) => (
    //      <StackedBarChart
    //      style={{ height, width }}
    //      data={data}
    //      showLabels={true}
    //      showTotal={true} />
    //    )}
    //  </AutoSizer> 
    // </Loader>
  )
}

export default IncidentBySeverityWidget
