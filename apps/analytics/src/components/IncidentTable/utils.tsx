import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { 
  calculateSeverity,
  Incident,
  incidentInformation,
  noDataSymbol,
  getRootCauseAndRecommendations,
  useIncidentScope,
  useLongDesription
} from '@acx-ui/analytics/utils'
import { formatter, durationFormat } from '@acx-ui/utils'

import * as UI from './styledComponents'

export const getIncidentBySeverity = (value?: number | null) => {
  if (value === null || value === undefined) {
    return noDataSymbol
  }

  const severity = calculateSeverity(value)
  if (!severity) return noDataSymbol

  return severity
}

export const formatDate = (datetimestamp?: string) => {
  if (typeof datetimestamp !== 'string') return noDataSymbol
  return formatter('dateTimeFormat')(datetimestamp as string)
}

export const formatDuration = (startTimestamp?: string, endTimestamp?: string) => {
  if (typeof startTimestamp !== 'string') return noDataSymbol
  if (typeof endTimestamp !== 'string') return noDataSymbol

  const start = moment(startTimestamp)
  const end = moment(endTimestamp)

  const diffInMillis = end.diff(start, 'millisecond')
  return durationFormat(diffInMillis)
}

export interface FormatIntlStringProps {
  message: {
    defaultMessage: string
  }
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

export const LongIncidentDescription = (props: IncidentTableComponentProps) => {
  const { incident } = props
  const { rootCauses } = getRootCauseAndRecommendations(incident.code, incident.metadata)[0]
  const longDesc = useLongDesription(incident, rootCauses)
    
  return <UI.DescriptionSpan>{longDesc}</UI.DescriptionSpan>
}

export const getCategory = (code: string) => {
  const incidentInfo = incidentInformation[code]
  if (typeof incidentInfo === 'undefined') {
    return <FormatIntlString message={defineMessage({ defaultMessage: '{noDataSymbol}' })} />
  }
  const { category } = incidentInfo
  return <FormatIntlString message={category} />
}

export const GetScope = (props: IncidentTableComponentProps) => {
  const { incident } = props
  const scope = useIncidentScope(incident)  
  const message = defineMessage({ defaultMessage: '{scope}' })
  return <FormatIntlString message={message} scope={scope}/>
}

export const durationValue = (dateA: string, dateB: string) => moment(dateA).diff(moment(dateB))

export const dateSort = (dateA: string, dateB: string) => 
  Math.sign(durationValue(dateA, dateB))

export const defaultSort = (a: string | number, b: string | number) => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export const durationSort = (startA: string, endA: string, startB: string, endB: string) => {
  const diffA = moment(endA).diff(startA)
  const diffB = moment(endB).diff(startB)
  return defaultSort(diffA, diffB)
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
  if (isDefined && c > d) return -1
  if (isDefined && c < d) return 1
  return 0
}