export interface BarChartData extends Object {
  /**
   * Dataset dimensions array
   * @example
   * ['switch_name', 'poe_usage', 'utilisation_per'],
   */
  dimensions: string[]

  /**
   * Multi dimensional dataset value array
   * @example
   * ['Switch 1', 73780, 7.3],
     ['Switch 2', 273780, 19.3],
     ['Switch 3', 1073780, 79.11],
   * **/
  source: (string | number)[][]

  /**
   * Dimension mapping to Axis, supports multiseries
   * * @example
   * [{
   // Map "poe_usage" to x-axis.
      x: 'poe_usage',
   // Map "switch_name" to y-axis.
      y: 'switch_name'
   // Display name of the series, must be present into the dimensions array
      seriesName: 'poe_usage'
    * }]
  */
  seriesEncode: { x: string, y: string, seriesName?: string }[]
}

type BarChartAPIData = {
  [key: string]: string | number
}

export function getBarChartSeriesData (
  data: BarChartAPIData[],
  seriesMapping: BarChartData['seriesEncode'],
  uniqueColumnName?: string
): BarChartData {
  const dimensions: BarChartData['dimensions'] = data && data.length > 0 ? Object.keys(data[0]): []
  const source: BarChartData['source'] = []
  let space = ' '
  data && data.forEach(datum =>{
    const row = Object.values(datum)
    // Bar chart groups the category names which leads to overlapping of bars on the axis,
    // adding space to the names makes the value unique. These spaces are trimmed in the axisLabelFormatter.
    if(uniqueColumnName){
      const index = dimensions.indexOf(uniqueColumnName)
      if(index>=0){
        row[index] = space + row[index]
        space = ' ' + space
      }
    }
    source.unshift(row)
  })
  const seriesEncode: BarChartData['seriesEncode'] = seriesMapping

  return {
    dimensions,
    source,
    seriesEncode
  }
}
