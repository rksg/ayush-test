import type { TimeStamp } from '@acx-ui/types'

export interface MultiLineTimeSeriesChartData extends Object {
  name: string,
  data: [TimeStamp, number | '-'][]
}
