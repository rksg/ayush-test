import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { Event, EventBase } from '../..'

export function parseTimestampAttribute (data: Event): Event {
  const parseData: Event = { ...data }
  const timestampKeys: (keyof EventBase)[] = ['turnOnTimestamp', 'turnOffTimestamp']
  timestampKeys.forEach(key => {
    const timestampValue = parseData[key]
    if(timestampValue) {
      parseData[key] = formatter(
        DateFormatEnum.DateTimeFormatWithSeconds)
      (new Date(Number(timestampValue)).toISOString()) as string
    }
  })

  return parseData
}