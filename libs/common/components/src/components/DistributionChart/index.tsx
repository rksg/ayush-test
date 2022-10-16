import ReactECharts                             from 'echarts-for-react'
import { GridOption, TooltipFormatterCallback } from 'echarts/types/dist/shared'

import type { BarChartData } from '@acx-ui/analytics/utils'

import { cssStr }    from '../../theme/helper'
import {
  gridOptions,
  tooltipOptions,
  yAxisOptions,
  xAxisOptions,
  xAxisNameOptions,
  axisLabelOptions
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
  tooltipFormatter?: string | TooltipFormatterCallback<TooltipComponentFormatterCallbackParams>,
  xAxisOffset?: number,
  dataXFormatter?: (value: unknown) => string | null,
  dataYFormatter?: (value: unknown) => string | null,
  yAxisProps?: {
    max: number,
    min: number
  }
}

export function DistributionChart<TChartData extends BarChartData>
({
  data,
  grid: gridProps,
  barColors,
  barWidth,
  title,
  tooltipFormatter,
  xAxisOffset,
  yAxisProps,
  dataXFormatter,
  dataYFormatter,
  ...props
}: DistributionChartProps<TChartData>) {
  const option: EChartsOption = {
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
      ...(title ? xAxisNameOptions(title) : {}),
      type: 'category',
      offset: xAxisOffset ? xAxisOffset : 0,
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: string) {
          return (dataXFormatter && dataXFormatter(value)) || value.trim()
        }
      },
      nameLocation: 'middle' // will have type error if nameLocation is set in xAxisNameOptions
    },
    yAxis: {
      ...yAxisOptions(),
      ...yAxisProps,
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return (dataYFormatter && dataYFormatter(value)) || `${value}`
        }
      }
    },
    series: data?.seriesEncode.map(encode => ({
      type: 'bar',
      silent: false,
      cursor: 'auto',
      colorBy: data?.seriesEncode?.length === 1 ? 'data' : undefined,
      color: data?.seriesEncode?.length === 1 ? barColors : undefined,
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
