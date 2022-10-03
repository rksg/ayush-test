import ReactECharts from 'echarts-for-react'

import { TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { formatter }           from '@acx-ui/utils'

import { cssStr }              from '../../theme/helper'
import {
  gridOptions,
  legendOptions,
  legendTextStyleOptions,
  xAxisOptions,
  yAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  tooltipOptions,
  timeSeriesTooltipFormatter
}                             from '../Chart/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export interface StackedAreaChartProps
  <TChartData extends TimeSeriesChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData
    stackColors?: string[]
    dataFormatter?: ReturnType<typeof formatter>
    seriesFormatters?: Record<string, ReturnType<typeof formatter>>
    tooltipTotal?: string
  }

export function StackedAreaChart <
  TChartData extends TimeSeriesChartData,
> ({
  data: initalData,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  seriesFormatters,
  tooltipTotal,
  ...props
}: StackedAreaChartProps<TChartData>) {

  const data = tooltipTotal
    ? initalData.concat({
      key: 'total',
      name: tooltipTotal,
      show: false,
      data: initalData[0].data.map((point, index)=>{
        const total = initalData.reduce((sum, series)=>
          (typeof series.data[index][1] === 'number'
            ? sum + (series.data[index][1] as number)
            : sum ), 0)
        return [ point[0], total ]
      })
    } as TChartData )
    : initalData

  const option: EChartsOption = {
    color: props.stackColors || [
      cssStr('--acx-accents-blue-30'),
      cssStr('--acx-accents-blue-70'),
      cssStr('--acx-accents-blue-50')
    ],
    grid: { ...gridOptions() },
    legend: {
      ...legendOptions(),
      textStyle: legendTextStyleOptions(),
      data: initalData.map(datum => datum[legendProp]) as unknown as string[]
    },
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      formatter: timeSeriesTooltipFormatter(
        data,
        { ...seriesFormatters, default: dataFormatter }
      )
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter()
      }
    },
    yAxis: {
      ...yAxisOptions(),
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: initalData.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data,
      type: 'line',
      silent: true,
      stack: 'Total',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 0 },
      areaStyle: { opacity: 1 }
    }))
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
