import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { 
  calculateSeverity,
  Incident,
  incidentInformation,
  noDataSymbol,
  useLongDesription
} from '@acx-ui/analytics/utils'

import * as UI from './styledComponents'

export const getIncidentBySeverity = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-'
  }

  const severity = calculateSeverity(value)
  if (!severity) return '-'

  return severity
}

export const formatDate = (datetimestamp?: string) => {
  if (typeof datetimestamp !== 'string') return '-'

  return moment(datetimestamp).format('MMM DD yyyy HH:mm')
}

export const formatDuration = (startTimestamp?: string, endTimestamp?: string) => {
  if (typeof startTimestamp !== 'string') return '-'
  if (typeof endTimestamp !== 'string') return '-' 

  const start = moment(startTimestamp)
  const end = moment(endTimestamp)
  const hours = end.diff(start, 'hours')
  const minutes = end.diff(start, 'minutes')
  return `${hours}h ${minutes % 60}min`
}

export const sorterCompare = (a?: unknown, b?: unknown) => {
  if ((typeof a !== 'number') || (typeof b !== 'number')) {
    return -1
  }

  return a - b
}

interface FormatIntlStringProps {
  message: {
    defaultMessage: string
    scope?: string
    threshold?: string
  }
}

export const FormatIntlString = (props: FormatIntlStringProps) => {
  const { $t } = useIntl()
  
  const message = $t(props.message, { scope: 'test', threshold: 'test1', noDataSymbol })
  const truncMsg = truncateString(message)
  return <span>{truncMsg}</span>
}


export const getShortIncidentDescription = (code?: string) => {
  if (typeof code !== 'string') {
    return <FormatIntlString message={defineMessage({ defaultMessage: '{noDataSymbol}' })} />
  }

  const shortDesc = incidentInformation[code].shortDescription
  return <FormatIntlString message={shortDesc} />
}

export const LongIncidentDescription = (incident: Incident) => {
  const longDesc = useLongDesription(incident, 'cause')
  
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

export const truncateString = (text?: string) => {
  if (typeof text !== 'string') return '-'
  if (text.length < 25) return text
  return text.slice(0, 25) + '...'
}