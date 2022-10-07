import ReactECharts from 'echarts-for-react'
import { isEmpty }  from 'lodash'

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
    tooltipTotalTitle?: string
  }

export function getSeriesTotal <DataType extends TimeSeriesChartData> (
  series: DataType[],
  tooltipTotalTitleTitle: string
) {
  return {
    key: 'total',
    name: tooltipTotalTitleTitle,
    show: false,
    data: series[0].data.map((point, index)=>{
      const total = series.reduce((sum, series)=>
        (typeof series.data[index][1] === 'number'
          ? sum + (series.data[index][1] as number)
          : sum ), 0)
      return [ point[0], total ]
    })
  } as DataType
}

export function StackedAreaChart <
  TChartData extends TimeSeriesChartData,
> ({
  data: initalData,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  seriesFormatters,
  tooltipTotalTitle,
  ...props
}: StackedAreaChartProps<TChartData>) {

  const data = tooltipTotalTitle && !isEmpty(initalData.length)
    ? initalData.concat(getSeriesTotal<TChartData>(initalData, tooltipTotalTitle))
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
