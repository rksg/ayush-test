import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { EventBase } from '../..'

export function parseTimestampAttribute (data: Event) {
  const parseData: Event = { ...data }
  const timestampKeys: (keyof EventBase)[] = ['turnOnTimestamp', 'turnOffTimestamp']
  timestampKeys.forEach(key => {
    const timestampValue = parseData[key]
    if(timestampValue) {
      parseData[key] = formatter(
        DateFormatEnum.DateTimeFormatWithSeconds)(new Date(Number(timestampValue)).toISOString())
    }
  })

  return parseData
}