import type { BarChartData } from '@acx-ui/components'

type BarChartAPIData = {
  [key: string]: string | number
}

export function getBarChartSeriesData ( 
  data: BarChartAPIData[], 
  seriesMapping: BarChartData['seriesEncode']
): BarChartData {
  const dimensions: BarChartData['dimensions'] = data && Object.keys(data[0])
  const source: BarChartData['source'] = []
  
  data && data.forEach(datum =>{
    source.unshift(Object.values(datum))
  })
  const seriesEncode: BarChartData['seriesEncode'] = seriesMapping

  return {
    dimensions,
    source,
    seriesEncode
  }
}