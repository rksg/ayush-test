import moment         from 'moment-timezone'
import {
  FormattedMessage,
  MessageDescriptor
} from 'react-intl'

import {
  Incident,
  IncidentSeverities,
  noDataSymbol,
  shortDescription
} from '@acx-ui/analytics/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { formatter }     from '@acx-ui/utils'

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

export type FormatDateProps = {
  datetimestamp: string
}

export const FormatDate = (props: FormatDateProps) => {
  const { datetimestamp } = props
  const timeStamp = formatter('dateTimeFormat')(datetimestamp)
  return <span>{timeStamp}</span>
}

export interface FormatIntlStringProps {
  message: MessageDescriptor
  scope?: string
  threshold?: string
}

export const FormatIntlString = (props: FormatIntlStringProps) => {
  const { message, scope, threshold } = props
  return <FormattedMessage {...message} values={{ scope, threshold, noDataSymbol }} />
}

export interface IncidentTableComponentProps {
  incident: Incident,
}
export interface IncidentTableDescriptionProps {
  incident: Incident,
  onClickDesc : CallableFunction
}

export const ShortIncidentDescription = (props: IncidentTableDescriptionProps) => {
  const { incident, onClickDesc } = props
  const shortDesc = shortDescription(incident)
  return (
    <UI.DescriptionSpan
      onClick={() => onClickDesc(incident)}
    >
      {shortDesc}
    </UI.DescriptionSpan>
  )
}

export const durationValue = (start: string, end: string) => moment(end).diff(moment(start))

export const dateSort = (dateA: string, dateB: string) =>
  Math.sign(durationValue(dateA, dateB))

export const defaultSort = (a: string | number, b: string | number) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export const clientImpactSort = (a?: unknown, b?: unknown) => {
  let c = (a === noDataSymbol) ? -1 : parseFloat(a as string)
  let d = (b === noDataSymbol) ? -1 : parseFloat(b as string)
  if (isNaN(c)) c = -2
  if (isNaN(d)) d = -2
  if (c > d) return -1
  if (c < d) return 1
  return 0
}

export const severitySort = (a?: unknown, b?: unknown) => {
  if (typeof a !== 'number' && typeof b !== 'number') return 0
  const isDefined = typeof a !== 'undefined' && typeof b !== 'undefined'
  const c = a as number
  const d = b as number
  if (isDefined && c > d) return 1
  if (isDefined && c < d) return -1
  return 0
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
