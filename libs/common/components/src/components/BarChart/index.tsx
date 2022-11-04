import { useRef } from 'react'

import { LabelFormatterCallback, RegisteredSeriesOption }           from 'echarts'
import { TooltipComponentFormatterCallbackParams }                  from 'echarts'
import ReactECharts                                                 from 'echarts-for-react'
import { CallbackDataParams, GridOption, TooltipFormatterCallback } from 'echarts/types/dist/shared'

import type { BarChartData } from '@acx-ui/analytics/utils'

import {
  gridOptions,
  barChartAxisLabelOptions,
  barChartSeriesLabelOptions,
  legendOptions,
  legendTextStyleOptions,
  tooltipOptions,
  EventParams,
  qualitativeColorSet
}                 from '../Chart/helper'
import { useLegendSelectChanged } from '../Chart/useLegendSelectChanged'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export interface BarChartProps
  <TChartData extends BarChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  grid?: GridOption,
  barColors?: string[]
  barWidth?: number
  labelFormatter?: string | LabelFormatterCallback<CallbackDataParams>
  tooltipFormatter?: string | TooltipFormatterCallback<TooltipComponentFormatterCallbackParams>
  labelRichStyle?: object,
  onClick?: (params: EventParams) => void
}

const getSeries = (
  data: BarChartData,
  barColors: string[],
  labelFormatter: string | LabelFormatterCallback<CallbackDataParams> | undefined,
  labelRichStyle: object | undefined,
  clickable?: boolean
): RegisteredSeriesOption['bar'][] => {
  return data?.seriesEncode.map(encode => ({
    type: 'bar',
    silent: !clickable,
    cursor: clickable ? 'pointer' : 'auto',
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

export const handleOnClick = (onClick: BarChartProps<BarChartData>['onClick']) =>
  (params: EventParams) => onClick && onClick(params)

export function BarChart<TChartData extends BarChartData>
({
  data,
  grid: gridProps,
  labelFormatter,
  tooltipFormatter,
  labelRichStyle,
  barColors = qualitativeColorSet(),
  barWidth,
  onClick,
  ...props
}: BarChartProps<TChartData>) {
  const eChartsRef = useRef<ReactECharts>(null)
  useLegendSelectChanged(eChartsRef)

  const option: EChartsOption = {
    animation: false,
    grid: { ...gridOptions(), ...gridProps },
    dataset: {
      dimensions: data.dimensions,
      source: data.source
    },
    barWidth: barWidth || 12,
    barGap: '50%',
    color: barColors,
    tooltip: {
      show: tooltipFormatter !== undefined,
      ...tooltipOptions(),
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      formatter: tooltipFormatter
    },
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
        ...barChartAxisLabelOptions(),
        formatter: function (value: string) {
          return value.trim()
        }
      }
    },
    series: getSeries(data, barColors, labelFormatter, labelRichStyle, !!onClick)
  }

  return (
    <ReactECharts
      ref={eChartsRef}
      {...props}
      opts={{ renderer: 'svg' }}
      option={option}
      onEvents={{ click: handleOnClick(onClick!) }} />
  )
}
