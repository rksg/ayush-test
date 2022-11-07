import moment from 'moment-timezone'

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
  return minGranularity &&
    moment.duration(minGranularity).asSeconds() > moment.duration(gran).asSeconds()
    ? minGranularity
    : gran
}
