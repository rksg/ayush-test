import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { 
  calculateSeverity,
  incidentInformation
} from '@acx-ui/analytics/utils'

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
  }
}

export const FormatIntlString = (props: FormatIntlStringProps) => {
  const { $t } = useIntl()
  const message = $t(props.message)
  const truncMsg = truncateString(message)
  return <span>{truncMsg}</span>
}


export const getShortIncidentDescription = (code?: string) => {
  if (typeof code !== 'string') return '-'

  const shortDesc = incidentInformation[code].shortDescription
  return <FormatIntlString message={shortDesc} />
}

export const getLongIncidentDescription = (code?: string) => {
  if (typeof code !== 'string') return '-'
  
  const longDesc = incidentInformation[code].longDescription
  return <FormatIntlString message={longDesc} />
}

export const getCategory = (code?: string) => {
  if (typeof code !== 'string') return '-'

  const category = incidentInformation[code].category
  return <FormatIntlString message={category} />
}

export const truncateString = (text?: string) => {
  if (typeof text !== 'string') return '-'
  if (text.length < 25) return text
  return text.slice(0, 25) + '...'
}