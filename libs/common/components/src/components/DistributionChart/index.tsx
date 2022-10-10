import ReactECharts               from 'echarts-for-react'
import { GridOption }             from 'echarts/types/dist/shared'

import type { BarChartData } from '@acx-ui/analytics/utils'

import {
  gridOptions,
  barChartAxisLabelOptions,
  legendOptions,
  legendTextStyleOptions,
  EventParams,
  tooltipOptions
} from '../Chart/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export interface DistributionChartProps
  <TChartData extends BarChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  grid?: GridOption,
  barColors: string[]
  barWidth?: number
  onClick?: (params: EventParams) => void,
  title?: string
}

export function DistributionChart<TChartData extends BarChartData>
({
  data,
  grid: gridProps,
  barColors,
  barWidth,
  onClick,
  title,
  ...props
}: DistributionChartProps<TChartData>) {
  console.log('props', props)
  const option: EChartsOption = {
    title: title ? {
      textStyle: legendTextStyleOptions(),
      left: 'center',
      top: 'bottom',
      text: title
    } : {},
    grid: { ...gridOptions(), ...gridProps },
    dataset: {
      dimensions: data.dimensions,
      source: data.source
    },
    barWidth: barWidth || 12,
    color: barColors,
    tooltip: {
      ...tooltipOptions()
    },
    legend: {
      ...legendOptions(),
      textStyle: legendTextStyleOptions()
    },
    xAxis: {
      type: 'category',
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        ...barChartAxisLabelOptions(),
        formatter: function (value: string) {
          return value.trim()
        }
      }

    },
    yAxis: {
      type: 'value'
    },
    series: data?.seriesEncode.map(encode => ({
      type: 'bar',
      silent: false,
      cursor: 'auto',
      color: barColors,
      encode: encode
    }))
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
