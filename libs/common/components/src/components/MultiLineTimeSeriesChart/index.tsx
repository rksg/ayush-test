import {
  XAXisComponentOption,
  YAXisComponentOption,
  TooltipComponentOption
} from 'echarts'
import ReactECharts from 'echarts-for-react'

import { TimeStamp } from '@acx-ui/types'

import { cssStr }              from '../../theme/helper'
import {
  gridOptions,
  legendOptions,
  xAxisOptions,
  yAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  tooltipOptions,
  timeSeriesTooltipFormatter
} from '../Chart/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export interface MultiLineTimeSeriesChartData extends Object {
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

export interface MultiLineTimeSeriesChartProps
  <TChartData extends MultiLineTimeSeriesChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: (value: unknown) => string | null
  }

export function MultiLineTimeSeriesChart
  <TChartData extends MultiLineTimeSeriesChartData = { name: string, data: [TimeStamp, number][] }>
({
  data,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData>) {
  const option: EChartsOption = {
    color: props.lineColors || [
      cssStr('--acx-primary-black'),
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-accents-orange-50'),
      cssStr('--acx-semantics-yellow-40')
    ],
    grid: { ...gridOptions },
    legend: {
      ...legendOptions,
      data: data.map(datum => datum[legendProp]) as unknown as string[]
    },
    tooltip: {
      ...tooltipOptions as TooltipComponentOption,
      trigger: 'axis',
      formatter: timeSeriesTooltipFormatter(dataFormatter)
    },
    xAxis: {
      ...xAxisOptions as XAXisComponentOption,
      type: 'time',
      axisLabel: {
        ...axisLabelOptions,
        formatter: dateAxisFormatter
      }
    },
    yAxis: {
      ...yAxisOptions as YAXisComponentOption,
      type: 'value',
      axisLabel: {
        ...axisLabelOptions,
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: data.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1 }
    }))
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
