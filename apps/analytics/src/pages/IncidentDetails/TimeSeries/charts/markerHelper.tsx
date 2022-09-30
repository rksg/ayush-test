import {
  Incident,
  incidentSeverities,
  calculateSeverity
}                                 from '@acx-ui/analytics/utils'
import { cssStr }                 from '@acx-ui/components'
import { NavigateFunction, Path } from '@acx-ui/react-router-dom'

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
