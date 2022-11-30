import moment from 'moment-timezone'

export function transformDisplayText (value?: string) {
  return value ? value : '--'
}

export function transformDisplayNumber (value?: number) {
  return value ? value : 0
}

export function transformTitleCase (value: string) {
  return value.replace(
    /\w\S*/g,
    value => value.charAt(0).toUpperCase() + value.substr(1).toLowerCase()
  )
}

export function transformTimezoneDifference (timeOffset: number){
  return 'UTC ' + (timeOffset >= 0 ? '+' : '-') + moment.utc(Math.abs(timeOffset) * 1000)
    .format('HH:mm')
}