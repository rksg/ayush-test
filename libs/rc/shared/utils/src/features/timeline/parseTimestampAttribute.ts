import _ from 'lodash'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'

export function parseTimestampAttribute<Data> (data: Data) {
  let parseData = {} as Data
  for (const key in data) {
    if (_.endsWith(key, 'Timestamp')) {
      const value = data[key];
      (parseData as any)[key] = formatter(
        DateFormatEnum.DateTimeFormatWithSeconds
      )(new Date(Number(value)).toISOString()) as string
    } else {
      parseData[key] = data[key]
    }
  }

  return parseData
}
