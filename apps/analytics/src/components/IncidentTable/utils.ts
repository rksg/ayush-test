import moment from 'moment-timezone'

import { Severities } from '@acx-ui/analytics/utils'

import incidentInformation from './incidentInformation'

export const getIncidentBySeverity = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-'
  }

  const severity = Object.entries(Severities).filter(((elem) => {
    return value >= elem[1].gt && value <= elem[1].lte
  }))

  return severity[0][0]
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

export const getShortIncidentDescription = (code?: string) => {
  if (typeof code !== 'string') return '-'

  return incidentInformation[code].shortDescription
}

export const getLongIncidentDescription = (code?: string) => {
  if (typeof code !== 'string') return '-'
  
  return incidentInformation[code].longDescription
}

export const getCategory = (code?: string) => {
  if (typeof code !== 'string') return '-'

  return incidentInformation[code].category
}