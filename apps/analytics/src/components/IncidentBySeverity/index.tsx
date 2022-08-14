import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  AnalyticsFilter,
  incidentSeverities,
  IncidentCode
} from '@acx-ui/analytics/utils'
import {
  Card,
  BarChart,
  BarChartData,
  Loader,
  cssStr,
  TrendPill,
  TrendType
} from '@acx-ui/components'

import {
  IncidentsBySeverityData,
  useIncidentsBySeverityQuery
} from './services'
import * as UI from './styledComponents'

type PillData = { delta: string; total: number; trend: string }
const barColors = Object.values(incidentSeverities).map(({ color }) =>
  cssStr(color)
)
export const getPillData = (
  curr: IncidentsBySeverityData,
  prev: IncidentsBySeverityData
): PillData => {
  const currTotal = _.sum(Object.entries(curr).map(([, value]) => value))
  const prevTotal = _.sum(Object.entries(prev).map(([, value]) => value))
  const delta = currTotal - prevTotal
  return {
    delta: delta > 0 ? `+${delta}` : `${delta}`,
    trend: delta > 0 ? 'negative' : delta < 0 ? 'positive' : 'none',
    total: currTotal
  }
}
const getChartData = (data: IncidentsBySeverityData): BarChartData => ({
  source: Object.entries(data).reverse(),
  dimensions: ['severity', 'incidentCount'],
  seriesEncode: [{ x: 'incidentCount', y: 'severity' }]
})

function IncidentBySeverityWidget ({ filters }: { filters: any }) {
  const { startDate, endDate } = filters
  const { $t } = useIntl()
  const currentResult = useIncidentsBySeverityQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    })
  })
  const prevResult = useIncidentsBySeverityQuery(
    {
      ...filters,
      startDate: moment(startDate)
        .subtract(moment(endDate).diff(startDate))
        .format(),
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
    pill: PillData = { total: 0, trend: 'none', delta: '0' }

  if (prevResult.data && currentResult.data) {
    pill = getPillData(currentResult.data, prevResult.data)
    chart = getChartData(currentResult.data)
  }
  return (
    <Loader states={[prevResult, currentResult]}>
      <Card title={$t({ defaultMessage: 'Total Incidents' })}>
        <UI.Container>
          <UI.Title>
            <UI.IncidentCount>{pill.total}</UI.IncidentCount>
            <TrendPill value={pill.delta} trend={pill.trend as TrendType} />
          </UI.Title>
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
        </UI.Container>
      </Card>
    </Loader>
  )
}

export default IncidentBySeverityWidget
