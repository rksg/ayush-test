import moment from 'moment-timezone'

export function handleScheduledAt (scheduledAt:string) {
  const originalScheduledAt = moment(scheduledAt)
  const futureThreshold = moment().add(15, 'minutes')
  if (originalScheduledAt.isBefore(futureThreshold)) {
    const newScheduledAt = originalScheduledAt.add(1, 'day')
    return newScheduledAt.toISOString()
  } else {
    return originalScheduledAt.toISOString()
  }
}