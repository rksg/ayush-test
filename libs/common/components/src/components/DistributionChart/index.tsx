import ReactECharts                             from 'echarts-for-react'
import { GridOption, TooltipFormatterCallback } from 'echarts/types/dist/shared'

import type { BarChartData } from '@acx-ui/analytics/utils'

import { cssStr }    from '../../theme/helper'
import {
  gridOptions,
  barChartAxisLabelOptions,
  tooltipOptions,
  yAxisOptions,
  xAxisOptions,
  xAxisNameOptions
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
  xAxisName?: string
  tooltipFormatter?: string | TooltipFormatterCallback<TooltipComponentFormatterCallbackParams>
}

export function DistributionChart<TChartData extends BarChartData>
({
  data,
  grid: gridProps,
  barColors,
  barWidth,
  xAxisName,
  tooltipFormatter,
  ...props
}: DistributionChartProps<TChartData>) {
  const option: EChartsOption = {
    grid: { ...gridOptions(), ...gridProps },
    dataset: {
      dimensions: data.dimensions,
      source: data.source
    },
    barWidth: barWidth || 20,
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
      ...(xAxisName ? xAxisNameOptions(xAxisName) : {}),
      type: 'category',
      axisLabel: {
        ...barChartAxisLabelOptions(),
        formatter: function (value: string) {
          return value.trim()
        }
      },
      nameLocation: 'middle' // will have type error if nameLocation is set in xAxisNameOptions
    },
    yAxis: {
      ...yAxisOptions(),
      type: 'value'
    },
    series: data?.seriesEncode.map(encode => ({
      type: 'bar',
      silent: false,
      cursor: 'auto',
      colorBy: 'data',
      color: barColors || cssStr('--acx-accents-blue-50'),
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
