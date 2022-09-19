import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  Incident,
  getSeriesData,
  mapCodeToReason,
  incidentSeverities,
  calculateSeverity,
  codeToFailureTypeMap
} from '@acx-ui/analytics/utils'
import { Card, cssStr, MultiLineTimeSeriesChart }             from '@acx-ui/components'
import { NavigateFunction, Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { intlFormats }                                        from '@acx-ui/utils'

import { ChartsData } from '../services'

export const onMarkedAreaClick = (
  navigate: NavigateFunction,
  basePath: Path,
  incident: Incident
) => (
  data: Incident
) => {
  // click on current incident marker
  if (data.id === incident.id) return

  navigate({
    ...basePath,
    pathname: `${basePath.pathname}/${data.id}`
  })
}

export const getMarkers = (
  relatedIncidents: Incident[],
  incident: Incident
) => relatedIncidents?.map(related => ({
  data: related,
  startTime: related.startTime,
  endTime: related.endTime,
  itemStyle: {
    opacity: related.id === incident.id ? 1 : 0.3,
    color: cssStr(incidentSeverities[calculateSeverity(incident.severity)].color)
  }
}))

export const IncidentChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { incidentCharts, relatedIncidents } = data
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')
  const title = mapCodeToReason(
    codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    useIntl()
  )

  const seriesMapping = [{
    key: codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    name: title
  }]

  const chartResults = getSeriesData(incidentCharts, seriesMapping)

  return <Card
    key={'incidentChart'}
    title={title}
    type='no-border'
  >
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={(value: unknown) =>
            $t(intlFormats.percentFormat, { value: value as number })}
          yAxisProps={{ max: 1, min: 0 }}
          disableLegend={true}
          onMarkedAreaClick={onMarkedAreaClick(navigate, basePath, incident)}
          markers={getMarkers(relatedIncidents, incident)}
        />
      )}
    </AutoSizer>
  </Card>
}
