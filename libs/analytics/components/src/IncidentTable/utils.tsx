import { ReactNode } from 'react'

import {
  Incident,
  IncidentSeverities,
  shortDescription
} from '@acx-ui/analytics/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { IncidentTableRow } from './services'
import * as UI              from './styledComponents'

export type GetIncidentBySeverityProps = {
  severityLabel: string,
  id: string
}

export const GetIncidentBySeverity = (props: GetIncidentBySeverityProps) => {
  const { severityLabel, id } = props
  const basePath = useTenantLink('/analytics/incidents/')
  return <UI.UnstyledLink to={{ ...basePath, pathname: `${basePath.pathname}/${id}` }}>
    <UI.SeveritySpan severity={severityLabel as IncidentSeverities}>
      {severityLabel}
    </UI.SeveritySpan>
  </UI.UnstyledLink>
}

export interface IncidentTableComponentProps {
  incident: Incident,
}
export interface IncidentTableDescriptionProps {
  incident: Incident,
  onClickDesc : CallableFunction
}

export const ShortIncidentDescription = (
  props: IncidentTableDescriptionProps & { highlightFn: (val: string) => ReactNode }
) => {
  const { incident, onClickDesc } = props
  const shortDesc = shortDescription(incident)
  return (
    <UI.DescriptionSpan onClick={() => onClickDesc(incident)}>
      {props.highlightFn(shortDesc)}
    </UI.DescriptionSpan>
  )
}

export const filterMutedIncidents = (data?: IncidentTableRow[]) => {
  if (!data) return []
  const unmutedIncidents = data
    .filter(incident => !incident.isMuted)
    .map(datum => ({
      ...datum,
      children: datum.children?.filter(child => !child.isMuted)
    }))
  return unmutedIncidents
}
