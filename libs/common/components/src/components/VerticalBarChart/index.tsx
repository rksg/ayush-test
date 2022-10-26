import ReactECharts       from 'echarts-for-react'
import { renderToString } from 'react-dom/server'

import type { BarChartData } from '@acx-ui/analytics/utils'
import { formatter }         from '@acx-ui/utils'

import { cssStr }    from '../../theme/helper'
import {
  gridOptions,
  tooltipOptions,
  axisLabelOptions,
  yAxisOptions,
  xAxisOptions,
  xAxisNameOptions
} from '../Chart/helper'
import { TooltipWrapper } from '../Chart/styledComponents'

import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts'
import type { EChartsReactProps }                                      from 'echarts-for-react'

export interface VerticalBarChartProps
  <TChartData extends BarChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  barColors?: string[]
  barWidth?: number
  dataFormatter?: ReturnType<typeof formatter>
  yAxisProps?: {
    max?: number
    min?: number
  }
  xAxisName?: string
  xAxisOffset?: number
  showTooltipName?: Boolean
}

export const tooltipFormatter = (
  dataFormatter: ReturnType<typeof formatter>,
  showTooltipName: Boolean
) => {
  return (params: TooltipComponentFormatterCallbackParams) => {
    const value = Array.isArray(params)
      && Array.isArray(params[0].data) && params[0].data[1]
    const name = Array.isArray(params)
      && Array.isArray(params[0].data) && params[0].dimensionNames?.[1]
    return renderToString(
      <TooltipWrapper>
        {showTooltipName ? `${name}:` : ''} <b>{dataFormatter(value)}</b>
      </TooltipWrapper>
    )
  }
}

export function VerticalBarChart<TChartData extends BarChartData>
({
  data,
  barColors = [cssStr('--acx-viz-qualitative-1')],
  barWidth = 20,
  dataFormatter = formatter('countFormat'),
  yAxisProps,
  xAxisName,
  xAxisOffset,
  showTooltipName = true,
  ...props
}: VerticalBarChartProps<TChartData>) {
  const option: EChartsOption = {
    grid: { ...gridOptions({
      disableLegend: true,
      hasXAxisName: Boolean(xAxisName),
      xAxisOffset
    }) },
    dataset: {
      dimensions: data.dimensions,
      source: data.source
    },
    barWidth,
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      formatter: tooltipFormatter(dataFormatter, showTooltipName)
    },
    xAxis: {
      ...xAxisOptions(),
      ...(xAxisName ? xAxisNameOptions(xAxisName) : {}),
      offset: xAxisOffset,
      axisPointer: { type: 'shadow' },
      type: 'category',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: (value: string) => value.trim()
      }
    },
    yAxis: {
      ...yAxisOptions(),
      ...(yAxisProps || { minInterval: 1 }),
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: data?.seriesEncode.map(encode => ({
      type: 'bar',
      silent: false,
      cursor: 'auto',
      colorBy: 'data',
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
