import type { TimeStamp } from '@acx-ui/types'

export interface SeriesChartData extends Object {
  name: string,
  data: [TimeStamp, number | '-'][]
}
