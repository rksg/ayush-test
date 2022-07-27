import { LabelFormatterCallback, RegisteredSeriesOption } from 'echarts'
import ReactECharts                                       from 'echarts-for-react'
import { CallbackDataParams, GridOption }                 from 'echarts/types/dist/shared'

import { cssNumber, cssStr } from '../../theme/helper'
import {
  gridOptions,
  barChartAxisLabelOptions,
  legendOptions
} from '../Chart/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

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
  source: [string, ...number[]][]

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

export interface BarChartProps
  <TChartData extends BarChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  grid?: GridOption,
  barColors: string[]
  barWidth?: number
  labelFormatter?: string | LabelFormatterCallback<CallbackDataParams> 
  labelRichStyle?: object
}

const getSeries = (
  data: BarChartData,
  barColors: string[],
  labelFormatter: string | LabelFormatterCallback<CallbackDataParams> | undefined,
  labelRichStyle: object | undefined): RegisteredSeriesOption['bar'][] => {

  return data?.seriesEncode.map(encode => ({
    type: 'bar',
    colorBy: data?.seriesEncode?.length === 1 ? 'data' : undefined,
    color: data?.seriesEncode?.length === 1 ? barColors : undefined,
    encode: encode,
    itemStyle: {
      borderRadius: [0, 4, 4, 0]
    },
    label: {
      show: true,
      position: 'right',
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-body-3-font-size'),
      lineHeight: cssNumber('--acx-body-3-line-height'),
      color: cssStr('--acx-primary-black'),
      fontWeight: cssNumber('--acx-body-font-weight'),
      formatter: labelFormatter,
      // Rich Type is not exported from ECharts lib.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rich: labelRichStyle as any
    }
  }))
}

export function BarChart<TChartData extends BarChartData>
({
  data,
  grid: gridProps,
  labelFormatter,
  labelRichStyle,
  barColors,
  barWidth,
  ...props
}: BarChartProps<TChartData>) {
  const option: EChartsOption = {
    grid: { ...gridOptions(), ...gridProps },
    dataset: {
      dimensions: data.dimensions,
      source: data.source
    },
    barWidth: barWidth || 12,
    color: barColors,
    legend: { ...legendOptions() },
    xAxis: {
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        ...barChartAxisLabelOptions()
      }
    },

    series: getSeries(data, barColors, labelFormatter, labelRichStyle)
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
