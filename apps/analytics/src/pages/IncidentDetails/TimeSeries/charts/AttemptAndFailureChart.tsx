import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Incident, getSeriesData }                from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, cssStr } from '@acx-ui/components'
import { formatter }                              from '@acx-ui/utils'

import { codeToFailureTypeMap } from '../config'
import { ChartsData }           from '../services'

const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-orange-50')
]

export const AttemptAndFailureChart = (
  { incident, data }: { incident: Incident, data: ChartsData }) => {
  const { attemptAndFailureCharts } = data
  const { $t } = useIntl()
  const incidentTitle = codeToFailureTypeMap[incident.code].toUpperCase()

  const seriesMapping = [
    {
      key: 'totalFailureCount',
      name: $t({ defaultMessage: 'Total Failures' })
    },
    { 
      key: 'failureCount',
      name: $t({ defaultMessage: '{title} Failures' }, { title: incidentTitle })
    },
    { 
      key: 'attemptCount',
      name: $t({ defaultMessage: '{title} Attempts' }, { title: incidentTitle })
    }
  ]

  const chartResults = getSeriesData(attemptAndFailureCharts, seriesMapping)

  return <Card
    key={'attemptAndFailureChart'}
    title={$t({ defaultMessage: 'FAILURES' })}
    setHeight={true}
  >
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          start={incident.startTime}
          end={incident.endTime}
          lineColors={lineColors}
        />
      )}
    </AutoSizer>
  </Card>
}
