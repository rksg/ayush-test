import { LabelFormatterCallback, RegisteredSeriesOption } from 'echarts'
import ReactECharts                                       from 'echarts-for-react'
import { CallbackDataParams, GridOption }                 from 'echarts/types/dist/shared'

import type { BarChartData } from '@acx-ui/analytics/utils'

import {
  gridOptions,
  barChartAxisLabelOptions,
  barChartSeriesLabelOptions,
  legendOptions,
  legendTextStyleOptions
} from '../Chart/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

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
    silent: true,
    colorBy: data?.seriesEncode?.length === 1 ? 'data' : undefined,
    color: data?.seriesEncode?.length === 1 ? barColors : undefined,
    encode: encode,
    itemStyle: {
      borderRadius: [0, 4, 4, 0]
    },
    label: {
      ...barChartSeriesLabelOptions(),
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
    barGap: '50%',
    color: barColors,
    legend: {
      ...legendOptions(),
      textStyle: legendTextStyleOptions()
    },
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
