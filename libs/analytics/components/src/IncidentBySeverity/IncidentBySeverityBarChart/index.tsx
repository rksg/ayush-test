import { CallbackDataParams } from 'echarts/types/dist/shared'
import _                      from 'lodash'
import moment                 from 'moment-timezone'
import { useIntl }            from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'


import { incidentSeverities, IncidentFilter, BarChartData, TrendTypeEnum } from '@acx-ui/analytics/utils'
import {
  Card,
  BarChart,
  Loader,
  cssStr,
  TrendPill
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import { IncidentsBySeverityData, useIncidentsBySeverityQuery } from '../services'

import * as UI from './styledComponents'

type PillData = { delta: string, total: number, trend: string }
export const getPillData = (
  curr: IncidentsBySeverityData,
  prev: IncidentsBySeverityData
): PillData => {
  const currTotal = _.sum(Object.entries(curr).map(([, value]) => value))
  const prevTotal = _.sum(Object.entries(prev).map(([, value]) => value))
  const delta = currTotal - prevTotal
  const formattedDelta = formatter('countFormat')(delta)
  return {
    delta: delta > 0 ? `+${formattedDelta}` : `${formattedDelta}`,
    trend: delta > 0
      ? TrendTypeEnum.Negative
      : delta < 0 ? TrendTypeEnum.Positive : TrendTypeEnum.None,
    total: currTotal
  }
}
const getChartData = (data: IncidentsBySeverityData): BarChartData => ({
  source: Object.entries(data).reverse(),
  dimensions: ['severity', 'incidentCount'],
  seriesEncode: [{ x: 'incidentCount', y: 'severity' }]
})

export function IncidentBySeverityBarChart ({ filters }: { filters: IncidentFilter }) {
  const { startDate, endDate } = filters
  const { $t } = useIntl()
  const currentResult = useIncidentsBySeverityQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    })
  })
  const labelFormatter = (params: CallbackDataParams) => {
    const value = (params.data as string[])?.[1]
    return formatter('countFormat')(value)
  }
  const prevResult = useIncidentsBySeverityQuery(
    {
      ...filters,
      startDate: moment(startDate).subtract(moment(endDate).diff(startDate)).format(),
      endDate: startDate
    },
    {
      selectFromResult: ({ data, ...rest }) => ({
        data: { ...data } as IncidentsBySeverityData,
        ...rest
      })
    }
  )

  let chart: BarChartData,
    barColors: string[],
    pill: PillData = { total: 0, trend: 'none', delta: '0' }

  if (prevResult.data && currentResult.data) {
    pill = getPillData(currentResult.data, prevResult.data)
    chart = getChartData(currentResult.data)
    barColors = chart.source.map(([p]) =>
      cssStr(incidentSeverities[p as keyof typeof incidentSeverities].color)
    )
  }
  return <Loader states={[prevResult, currentResult]}>
    <Card title={$t({ defaultMessage: 'Total Incidents' })} type='no-border'>
      <UI.Container>
        <UI.Title>
          <UI.IncidentCount>{formatter('countFormat')(pill.total?.toString())}</UI.IncidentCount>
          <TrendPill value={pill.delta} trend={pill.trend as TrendTypeEnum} />
        </UI.Title>
        <AutoSizer>
          {({ width }) => (
            <BarChart
              style={{ width, height: 140 }}
              data={chart}
              grid={{ right: 30, top: 5 }}
              barColors={barColors}
              labelFormatter={labelFormatter}
            />
          )}
        </AutoSizer>
      </UI.Container>
    </Card>
  </Loader>

}
