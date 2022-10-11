import ReactECharts                             from 'echarts-for-react'
import { GridOption, TooltipFormatterCallback } from 'echarts/types/dist/shared'

import type { BarChartData } from '@acx-ui/analytics/utils'

import { cssStr } from '../../theme/helper'
import {
  gridOptions,
  barChartAxisLabelOptions,
  legendTextStyleOptions,
  tooltipOptions,
  yAxisOptions,
  xAxisOptions
} from '../Chart/helper'

import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts'
import type { EChartsReactProps }                                      from 'echarts-for-react'

export interface DistributionChartProps
  <TChartData extends BarChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  grid?: GridOption,
  barColors?: string[]
  barWidth?: number
  title?: string
  tooltipFormatter?: string | TooltipFormatterCallback<TooltipComponentFormatterCallbackParams>
}

export function DistributionChart<TChartData extends BarChartData>
({
  data,
  grid: gridProps,
  barColors,
  barWidth,
  title,
  tooltipFormatter,
  ...props
}: DistributionChartProps<TChartData>) {
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
    barWidth: barWidth || 20,
    color: barColors || cssStr('--acx-accents-blue-50'),
    tooltip: {
      show: tooltipFormatter !== undefined,
      ...tooltipOptions(),
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      formatter: tooltipFormatter
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'category',
      axisLabel: {
        ...barChartAxisLabelOptions(),
        formatter: function (value: string) {
          return value.trim()
        }
      }
    },
    yAxis: {
      ...yAxisOptions(),
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
