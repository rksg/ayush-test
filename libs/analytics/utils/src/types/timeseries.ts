import type { TimeStamp } from '@acx-ui/types'

export interface MultiLineTimeSeriesChartData extends Object {
  key: string,
  name: string,
  show?: boolean,
  data: [TimeStamp, number | '-'][]
}
