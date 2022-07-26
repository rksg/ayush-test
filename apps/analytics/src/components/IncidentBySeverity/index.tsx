import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import moment from 'moment-timezone'

import { useGlobalFilter }          from '@acx-ui/analytics/utils'
import { getSeriesData }            from '@acx-ui/analytics/utils'
import {
  Card,
  Subtitle,
  BarChart,
  BarChartData,
  Loader,
  cssStr,
  Pill
 }                     from '@acx-ui/components'

import { formatter }                from '@acx-ui/utils'
import { IncidentsBySeverityData }     from './services'
import { useIncidentsBySeverityQuery } from './services'

const data:BarChartData = {
  dimensions: ['Severity', 'incidentCount'],
  source: [
    ['P1', 53],
    ['P2', 73],
    ['P3', 107],
    ['P4', 234]
  ],
  seriesEncode:[{
    x: 'incidentCount',
    y: 'Severity'
  }]
}
const barColors = [
  cssStr('--acx-semantics-red-70'), //.... P1
  cssStr('--acx-semantics-red-50'), //... P2
  cssStr('--acx-accents-orange-50'), //.. P3  
  cssStr('--acx-semantics-yellow-40') // P4
]
function IncidentBySeverityWidget () {
  const { startDate, endDate, path } = useGlobalFilter()
  const currentResult = useIncidentsBySeverityQuery(
    { startDate, endDate, path },
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: {...data},
        ...rest
      })
    }
  )
  console.log('current', currentResult.data)
  const prevResult = useIncidentsBySeverityQuery(
    { 
      startDate: moment(startDate).subtract(moment(endDate).diff(startDate)).format(),
      endDate: startDate,
      path
    },
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: {...data},
        ...rest
      })
    }
  )
  console.log('prev', prevResult.data)
  return (
    // <Loader states={[queryResults]}>
  //     <Card title='Total Incidents'>
  //      <Subtitle level={3}>90</Subtitle>
  //      <BarChart
  //   style={{ width: 524, height: 174 }}
  //   data={data}
  //   barColors={barColors}
  // />
        
  //     </Card>
  <Card title='Total Incidents' >
    <Subtitle level={1}>90<Pill value='-123' trend='negative' /></Subtitle>
    
       <AutoSizer>
       {({ height, width }) => (
          <BarChart
            style={{ width, height: 75 }}
            data={data}
            barColors={barColors}
          />
       )}
     </AutoSizer>
     </Card>
     
    //</Loader>
  )
}

export default IncidentBySeverityWidget
