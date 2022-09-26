import moment from 'moment-timezone'

export const getSparklineGranularity = (start: string, end: string): string => {
  const duration = moment.duration(moment(end).diff(moment(start))).asHours()
  if (duration >= 24 * 7) return 'PT24H' // 1 day if duration >= 7 days
  if (duration >= 24) return 'PT1H'
  if (duration >= 1) return 'PT15M'
  return 'PT180S'
}
export const calculateGranularity = (
  start: string, end: string, minGranularity?: string
): string => {
  const interval = moment.duration(moment(end).diff(moment(start))).asHours()
  let gran
  switch (true) {
    case interval > 24 * 7: // 7 days
      gran = 'PT1H'
      break
    case interval > 24 * 3: // 3 days
      gran = 'PT15M'
      break
    default:
      gran = 'PT180S'
  }
  return getMaxGranularity(gran, minGranularity || '')
}
function getMaxGranularity (...durations: string[]): string {
  let max = ''
  for (let i = 0; i < durations.length; i++) {
    const duration = durations[i]
    if (!max) {
      max = duration
      continue
    }
    if (moment.duration(duration).asSeconds() > moment.duration(max).asSeconds()) {
      max = durations[i]
    }
  }
  return max
}
