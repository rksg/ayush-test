import moment from 'moment-timezone'

export const expirationTimeUnits: Record<string, string> = {
  HOURS_AFTER_TIME: 'Hours' ,
  DAYS_AFTER_TIME: 'Days',
  WEEKS_AFTER_TIME: 'Weeks',
  MONTHS_AFTER_TIME: 'Months',
  YEARS_AFTER_TIME: 'Years'
}

export const toTimeString = (value?: string) => {
  return value ? moment(value).format('MM/DD/YYYY HH:mm A') : ''
}
