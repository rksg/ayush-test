import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Incident, getSeriesData }        from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart } from '@acx-ui/components'
import { intlFormats }                    from '@acx-ui/utils'

import { codeToFailureTypeMap } from '../config'
import { ChartsData }           from '../services'

export const IncidentChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { incidentCharts, relatedIncidents } = data
  const { $t } = useIntl()
  const incidentTitle = codeToFailureTypeMap[incident.code].toUpperCase()

  const seriesMapping = [{
    key: codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    name: $t({ defaultMessage: '{title} Failures' }, { title: incidentTitle }) 
  }]

  const chartResults = getSeriesData(incidentCharts, seriesMapping)

  return <Card
    key={'incidentChart'}
    title={$t({ defaultMessage: '{title} FAILURES' }, { title: incidentTitle })}
    setHeight={true}
  >
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          marker={relatedIncidents}
          dataFormatter={(value: unknown) => 
            $t(intlFormats.percentFormat, { value: value as number })}
          areaColor={'green'}
          yAxisProps={{ max: 1, min: 0 }}
          start={incident.startTime}
          end={incident.endTime}
        />
      )}
    </AutoSizer>
  </Card>
}
