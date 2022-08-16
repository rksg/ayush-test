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

export interface LongIncidentDescriptionProps {
  incident: Incident
}

export const LongIncidentDescription = (props: LongIncidentDescriptionProps) => {
  const { incident } = props
  const { rootCauses } = getRootCauseAndRecommendations(incident.code, incident.metadata)[0]
  const longDesc = useLongDesription(incident, rootCauses)
  
  if (typeof incident.code !== 'string') {
    return <FormatIntlString message={defineMessage({ defaultMessage: '{noDataSymbol}' })} />
  }
  
  return <UI.DescriptionSpan>{longDesc}</UI.DescriptionSpan>
}

export const getCategory = (code?: string) => {
  if (typeof code !== 'string') {
    return <FormatIntlString message={defineMessage({ defaultMessage: '{noDataSymbol}' })} />
  }

  const category = incidentInformation[code].category
  return <FormatIntlString message={category} />
}

export interface GetScopeProps {
  incident: Incident
}

export const GetScope = (props: GetScopeProps) => {
  const { incident } = props
  const scope = useIncidentScope(incident)  
  const message = defineMessage({ defaultMessage: '{scope}' })
  return <FormatIntlString message={message} scope={scope}/>
}
