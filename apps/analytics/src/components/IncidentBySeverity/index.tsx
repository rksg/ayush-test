import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { Loader }                   from '@acx-ui/components'
import { StackedBarChart }          from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'
import { formatter }                from '@acx-ui/utils'

import { TrafficByVolumeData }     from './services'
import { useTrafficByVolumeQuery } from './services'

export const seriesMapping = [
  { key: 'totalTraffic_all', name: 'All Radios' },
  { key: 'totalTraffic_24', name: formatter('radioFormat')('2.4') },
  { key: 'totalTraffic_5', name: formatter('radioFormat')('5') },
  { key: 'totalTraffic_6', name: formatter('radioFormat')('6') }
] as Array<{ key: keyof Omit<TrafficByVolumeData, 'time'>, name: string }>

const lineColors = [
  cssStr('--acx-primary-black'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-semantics-yellow-40')
]
// const data = [{
//   category: 'P1',
//   series: [
//     { name: 'i', value: 10 }
//   ]
// },{
//   category: 'P2',
//   series: [
//     { name: 'i', value: 5 }
//   ]
// }, {
//   category: 'P3',
//   series: [
//     { name: 'i', value: 7 }
//   ]
// }]
const data = [{
  category: 'Infrastructure',
  series: [
    { name: 'P3', value: 0 },
    { name: 'P1', value: 0 },
    { name: 'P2', value: 5 },
    { name: 'P4', value: 0 }
  ]
}, {
  category: 'Performance',
  series: [
    { name: 'P1', value: 0 },
    { name: 'P2', value: 2 },
    { name: 'P3', value: 5 },
    { name: 'P4', value: 0 }
  ]
}, {
  category: 'Connection',
  series: [
    { name: 'P1', value: 2 },
    { name: 'P2', value: 3 },
    { name: 'P3', value: 0 },
    { name: 'P4', value: 7 }
  ]
}]
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
        <AutoSizer>
          {({ height, width }) => (
            <StackedBarChart
            style={{ height, width }}
            data={data}
            showLabels={true}
            showTotal={true} />
          )}
        </AutoSizer> 
        
      </Card>
    // </Loader>
  )
}

export default IncidentBySeverityWidget
