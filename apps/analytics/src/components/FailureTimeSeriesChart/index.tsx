import AutoSizer from 'react-virtualized-auto-sizer'

import {
  Incident,
  incidentSeverities,
  calculateSeverity,
  MultiLineTimeSeriesChartData
} from '@acx-ui/analytics/utils'
import { Card, cssStr, MultiLineTimeSeriesChart }             from '@acx-ui/components'
import { NavigateFunction, Path, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { formatter }                                          from '@acx-ui/utils'

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

interface FailureTimeSeriesChartProps {
  title: string
  incident: Incident
  relatedIncidents: Incident[]
  data: MultiLineTimeSeriesChartData[]
}

export const FailureTimeSeriesChart = (
  { title, incident, relatedIncidents, data }: FailureTimeSeriesChartProps
) => {
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')
  return <Card title={title} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={data}
          dataFormatter={formatter('countFormat')}
          yAxisProps={{ max: 1, min: 0 }}
          disableLegend={true}
          onMarkedAreaClick={onMarkedAreaClick(navigate, basePath, incident)}
          markers={getMarkers(relatedIncidents, incident)}
        />
      )}
    </AutoSizer>
  </Card>
}
