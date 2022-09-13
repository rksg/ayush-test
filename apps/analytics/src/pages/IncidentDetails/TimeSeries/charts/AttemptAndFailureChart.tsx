import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Incident, getSeriesData, mapCodeToReason, mapCodeToAttempt } from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart }                             from '@acx-ui/components'
import { intlFormats }                                                from '@acx-ui/utils'

import { codeToFailureTypeMap } from '../config'
import { ChartsData }           from '../services'

export const AttemptAndFailureChart = (
  { incident, data }: { incident: Incident, data: ChartsData }) => {
  const { attemptAndFailureCharts } = data
  const { $t } = useIntl()
  const title = mapCodeToReason(
    codeToFailureTypeMap[incident.code],
    useIntl()
  )
  const attempt = mapCodeToAttempt(
    codeToFailureTypeMap[incident.code],
    useIntl()
  )

  const seriesMapping = [
    {
      key: 'totalFailureCount',
      name: $t({ defaultMessage: 'Total Failures' })
    },
    {
      key: 'failureCount',
      name: title
    },
    {
      key: 'attemptCount',
      name: attempt
    }
  ]

  const chartResults = getSeriesData(attemptAndFailureCharts, seriesMapping)

  return <Card
    key={'attemptAndFailureChart'}
    title={$t({ defaultMessage: 'FAILURES' })}
    isIncidentChart={true}
    type={'no-border'}
  >
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={(value: unknown) =>
            $t(intlFormats.countFormat, { value: value as number })}
        />
      )}
    </AutoSizer>
  </Card>
}
