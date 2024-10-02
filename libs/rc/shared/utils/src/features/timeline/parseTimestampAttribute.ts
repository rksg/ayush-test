import _ from 'lodash'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'

export function parseTimestampAttribute<Data> (data: Data) {
  let parseData = {} as Data
  for (const key in data) {
    if (_.endsWith(key, 'Timestamp')) {
      const value = data[key]
      parseData[key] = formatter(
        DateFormatEnum.DateTimeFormatWithSeconds
      )(new Date(Number(value)).toISOString()) as unknown as Data[typeof key]
    } else {
      parseData[key] = data[key]
    }
  }

  return parseData
}