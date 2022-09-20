import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  Incident,
  getSeriesData,
  mapCodeToReason,
  mapCodeToAttempt,
  codeToFailureTypeMap
} from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart } from '@acx-ui/components'
import { intlFormats }                    from '@acx-ui/utils'

import { ChartsData } from '../services'

export const AttemptAndFailureChart = (
  { incident, data }: { incident: Incident, data: ChartsData }) => {
  const { attemptAndFailureChart } = data
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
    { key: 'totalFailureCount', name: $t({ defaultMessage: 'Total Failures' }) },
    { key: 'failureCount', name: title },
    { key: 'attemptCount', name: attempt }
  ]

  const chartResults = getSeriesData(attemptAndFailureChart, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Failures' })} type='no-border'>
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
