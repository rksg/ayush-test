import moment                                        from 'moment-timezone'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { 
  calculateSeverity,
  Incident,
  incidentInformation,
  noDataSymbol,
  useImpactValues,
  useIncidentScope,
  useShortDescription
} from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/utils'

import * as UI from './styledComponents'

export type GetIncidentBySeverityProps = {
  value: number,
  id: string
}

export const GetIncidentBySeverity = (props: GetIncidentBySeverityProps) => {
  const { value, id } = props

  const severity = calculateSeverity(value)
  if (typeof severity === 'undefined') return <span>{noDataSymbol}</span>

  return <UI.UnstyledLink to={id}>
    <UI.SeveritySpan severity={severity}>{severity}</UI.SeveritySpan>
  </UI.UnstyledLink>
}

export type FormatDateProps = {
  datetimestamp: string
}

export const FormatDate = (props: FormatDateProps) => {
  const { datetimestamp } = props
  const formattedDatetime = formatter('dateTimeFormat')(datetimestamp)
  if (formattedDatetime === null) return <span>{noDataSymbol}</span>
  const timeStamp = formattedDatetime as string
  return <UI.DateSpan>{timeStamp}</UI.DateSpan>
}

export interface FormatIntlStringProps {
  message: MessageDescriptor
  scope?: string
  threshold?: string
}

export const FormatIntlString = (props: FormatIntlStringProps) => {
  const { $t } = useIntl()
  const { message, scope, threshold } = props
  const intlMessage = $t(message, { scope, threshold, noDataSymbol })
  return <span>{intlMessage}</span>
}

export interface IncidentTableComponentProps {
  incident: Incident
}

export const ShortIncidentDescription = (props: IncidentTableComponentProps) => {
  const { incident } = props
  const shortDesc = useShortDescription(incident)
    
  return <UI.DescriptionSpan>{shortDesc}</UI.DescriptionSpan>
}

export const GetCategory = (code: string) => {
  const incidentInfo = incidentInformation[code]
  const { category } = incidentInfo
  return <FormatIntlString message={category} />
}

export const GetScope = (props: IncidentTableComponentProps) => {
  const { incident } = props
  const scope = useIncidentScope(incident)  
  const message = defineMessage({ defaultMessage: '{scope}' })
  return <FormatIntlString message={message} scope={scope}/>
}

export const ClientImpact = (props: IncidentTableComponentProps & {
  type: 'clientImpact' | 'impactedClients'
}) => {
  const { type, incident } = props
  const values = useImpactValues('client', incident.clientCount, incident.impactedClientCount)
  if (type === 'clientImpact') return <span>{values['clientImpactFormatted'] as string}</span>

  return <span>{values['clientImpactCountFormatted'] as string}</span>
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