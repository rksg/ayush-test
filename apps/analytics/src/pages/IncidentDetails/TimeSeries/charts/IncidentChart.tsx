import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Incident, getSeriesData, mapCodeToReason, incidentSeverities, calculateSeverity } from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart }                                                  from '@acx-ui/components'
import { useNavigate, useTenantLink }                                                      from '@acx-ui/react-router-dom'
import { intlFormats }                                                                     from '@acx-ui/utils'

import { codeToFailureTypeMap } from '../config'
import { ChartsData }           from '../services'

export const IncidentChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { incidentCharts, relatedIncidents } = data
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')
  const title = mapCodeToReason(
    codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    useIntl()
  )

  const onMarkedAreaClick = (id: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${id}`
    })
  }

  const seriesMapping = [{
    key: codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    name: title
  }]

  const colors = relatedIncidents.map(i => {
    return incidentSeverities[calculateSeverity(i.severity)].color
  })

  const chartResults = getSeriesData(incidentCharts, seriesMapping)
  return <Card
    key={'incidentChart'}
    title={title}
    isIncidentChart={true}
    type={'no-border'}
  >
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          markers={relatedIncidents}
          dataFormatter={(value: unknown) => 
            $t(intlFormats.percentFormat, { value: value as number })}
          areaColor={'green'}
          yAxisProps={{ max: 1, min: 0 }}
          disableLegend={true}
          handleMarkedAreaClick={(props) => onMarkedAreaClick(props.id)}
          markerColor={colors}
        />
      )}
    </AutoSizer>
  </Card>
}
