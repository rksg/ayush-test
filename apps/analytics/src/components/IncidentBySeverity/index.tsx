import React from 'react'

import _         from 'lodash'
import moment    from 'moment-timezone'
import AutoSizer from 'react-virtualized-auto-sizer'



import { useGlobalFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Subtitle,
  BarChart,
  BarChartData,
  Loader,
  cssStr,
  Pill,
  TrendType
} from '@acx-ui/components'

import {
  IncidentsBySeverityData,
  useIncidentsBySeverityQuery
} from './services'
import { Container, Title } from './styledComponents'

type PillData = { delta: string, total: number, trend: string }
const barColors = [
  cssStr('--acx-semantics-yellow-40'), // P4
  cssStr('--acx-accents-orange-50'), //.. P3  
  cssStr('--acx-semantics-red-50'), //... P2  
  cssStr('--acx-semantics-red-70') //.... P1
]
export const getPillData = (
  curr: IncidentsBySeverityData, prev: IncidentsBySeverityData
): PillData => {
  const currTotal = _.sum(Object.entries(curr).map(([, value]) => value))
  const prevTotal = _.sum(Object.entries(prev).map(([, value]) => value))
  const trend = currTotal - prevTotal > 0
    ? 'negative'
    : currTotal - prevTotal < 0 ? 'positive' : 'none'
  return { delta: `${Math.abs(currTotal - prevTotal)}`, trend, total: currTotal }
}
const getChartData = (data: IncidentsBySeverityData): BarChartData => ({
  source: Object.entries(data).reverse(),
  dimensions: ['severity', 'incidentCount'],
  seriesEncode: [{ x: 'incidentCount', y: 'severity' }]
})

function IncidentBySeverityWidget () {
  const { startDate, endDate, path } = useGlobalFilter()
  const currentResult = useIncidentsBySeverityQuery(
    { startDate, endDate, path },
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: { ...data } as IncidentsBySeverityData,
        ...rest
      })
    }
  )
  const prevResult = useIncidentsBySeverityQuery(
    { 
      startDate: moment(startDate).subtract(moment(endDate).diff(startDate)).format(),
      endDate: startDate,
      path
    },
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: { ...data } as IncidentsBySeverityData,
        ...rest
      })
    }
  )
  
  let chart:BarChartData, pill:PillData = { total: 0, trend: 'none', delta: '0' }
  
  if (prevResult.data && currentResult.data) {
    pill = getPillData(currentResult.data, prevResult.data)
    chart = getChartData(currentResult.data)
  }
  return <Loader states={[prevResult, currentResult]}>
    <Card title='Total Incidents'>
      <Container>
        <Title>
          <Subtitle level={1} style={{ marginBottom: 0 }}>{pill.total}</Subtitle>
          <Pill value={pill.delta} trend={pill.trend as TrendType} />
        </Title>
        <AutoSizer>
          {({ width }) => (
            <BarChart
              style={{ width, height: 140 }}
              data={chart}
              grid={{ right: 25, top: 5 }}
              barColors={barColors}
            />
          )}
        </AutoSizer>
      </Container>
    </Card>
  </Loader>
}

export default IncidentBySeverityWidget
