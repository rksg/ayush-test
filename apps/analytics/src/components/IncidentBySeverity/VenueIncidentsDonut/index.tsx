import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { incidentSeverities, IncidentFilter } from '@acx-ui/analytics/utils'
import { DonutChartData, NoActiveData }       from '@acx-ui/components'
import {
  Card,
  Loader,
  cssStr,
  DonutChart
} from '@acx-ui/components'

import { IncidentsBySeverityData, useIncidentsBySeverityQuery } from '../services'

function VenueIncidentsWidget ({ filters }: { filters: IncidentFilter }) {
  const { $t } = useIntl()
  const queryResult = useIncidentsBySeverityQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    })
  })

  const getChartData = (data: IncidentsBySeverityData): DonutChartData[] => {
    const chartData: DonutChartData[] = []
    for (const key in data) {
      const value = data[key as keyof typeof incidentSeverities]
      if (value > 0) {
        chartData.push({
          name: key,
          color: cssStr(incidentSeverities[key as keyof typeof incidentSeverities].color),
          value
        })
      }
    }
    return chartData
  }

  const data = getChartData(queryResult.data)

  return <Loader states={[queryResult]}>
    <Card title={$t({ defaultMessage: 'Incidents' })}>
      <AutoSizer>
        {({ width, height }) => (
          data && data.length > 0
            ? <DonutChart
              style={{ width, height }}
              legend='name-value'
              data={data}/>
            : <NoActiveData text={$t({ defaultMessage: 'No active incidents' })} />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}

export default VenueIncidentsWidget
