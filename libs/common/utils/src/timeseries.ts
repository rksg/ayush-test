import { TimeStamp } from '@acx-ui/types'

interface MultiLineTimeSeriesChartData extends Object {
  /**
   * Multi dimensional array which first item is timestamp and 2nd item is value
   * @example
   * [
   *   [1603900800000, 64.12186646508322],
   *   [1603987200000, 76]
   * ]
   */
  data: [TimeStamp, number][]
}

type TimeSeriesData = {
  [key: string]: number[] | string[]
}

export function getSeriesData (data: TimeSeriesData | null, 
  seriesMapping: 
  Array<{ key: string, name: string }>): 
  MultiLineTimeSeriesChartData[] {
  if (!data) return []
  return seriesMapping.map(({ key , name }) => ({
    name,
    data: (data.time as string[]).map((t: string, index: number) =>{
      return [t, data[key][index] as number]
    })
  }))
}
