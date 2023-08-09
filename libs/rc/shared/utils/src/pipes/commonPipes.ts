/* eslint-disable max-len */
import moment from 'moment-timezone'

import { getIntl } from '@acx-ui/utils'

export function transformDisplayText (value?: string) {
  return value ? value : '--'
}

export function transformDisplayOnOff (value: boolean) {
  const { $t } = getIntl()
  return value ? $t({ defaultMessage: 'ON' }) :
    $t({ defaultMessage: 'OFF' })
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

export function transformByte (bytes: string| number, perSecondFlag: boolean = false, precision?: number) {
  if (bytes === 0 || bytes === '0.0' || bytes === '0') {
    return perSecondFlag ? '0 Bps' : '0 Bytes'
  }

  if (isNaN(parseFloat(bytes as string)) || !isFinite(bytes as number)) {
    return '--'
  }
  if (typeof precision === 'undefined') {
    precision = 1
  }
  let units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const number = Math.floor(Math.log(bytes as number) / Math.log(1024))

  if (perSecondFlag) {
    units = ['Bps', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps']
  }

  return (bytes as number / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number]
}

export function transformTimezoneDifference (timeOffset: number){
  return 'UTC ' + (timeOffset >= 0 ? '+' : '-') + moment.utc(Math.abs(timeOffset) * 1000)
    .format('HH:mm')
}
