import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  Incident,
  TimeSeriesData,
  getSeriesData,
  mapCodeToReason,
  mapCodeToAttempt,
  codeToFailureTypeMap
} from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart } from '@acx-ui/components'
import { formatter }                      from '@acx-ui/utils'

import { ChartsData } from '../services'

const attemptAndFailureChartQuery = (incident: Incident) => gql`
  attemptAndFailureChart: timeSeries(granularity: $granularity) {
    time
    failureCount(
      metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
    totalFailureCount: failureCount
    attemptCount(
      metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
  }
`

export const AttemptAndFailureChart = (
  { incident, data }: { incident: Incident, data: ChartsData }) => {
  const { attemptAndFailureChart } = data
  const intl = useIntl()
  const { $t } = intl
  const title = mapCodeToReason(codeToFailureTypeMap[incident.code], intl)
  const attempt = mapCodeToAttempt(codeToFailureTypeMap[incident.code], intl)

  const seriesMapping = [
    { key: 'totalFailureCount', name: $t({ defaultMessage: 'Total Failures' }) },
    { key: 'failureCount', name: title },
    { key: 'attemptCount', name: attempt }
  ]

  const chartResults = getSeriesData(attemptAndFailureChart as TimeSeriesData, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Failures' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: AttemptAndFailureChart, query: attemptAndFailureChartQuery }
export default chartConfig
