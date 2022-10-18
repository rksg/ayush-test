import type { TimeStamp } from '@acx-ui/types'

export interface TimeSeriesChartData extends Object {
  key: string,
  name: string,
  show?: boolean,
  data: [TimeStamp, number | '-'][]
}
