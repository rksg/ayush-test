import moment from 'moment-timezone'

export const getSparklineGranularity = (start: string, end: string): string => {
  const duration = moment.duration(moment(end).diff(moment(start))).asHours()
  if (duration >= 24 * 7) return 'PT24H' // 1 day if duration >= 7 days
  if (duration >= 24) return 'PT1H'
  if (duration >= 1) return 'PT15M'
  return 'PT180S'
}
export const calcGranularity = (start: string, end: string): string => {
  const duration = moment.duration(moment(end).diff(moment(start))).asHours()
  switch (true) {
    case duration > 24 * 7: return 'PT1H'
    case duration > 24 * 3: return 'PT15M'
    default: return 'PT180S'
  }
}
