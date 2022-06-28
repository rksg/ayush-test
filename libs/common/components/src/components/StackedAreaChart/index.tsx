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

interface ChartData extends Object {
  /**
   * Multi dimensional array which first item is timestamp and 2nd item is value
   * @example
   * [
   *   [1603900800000, 64.12186646508322],
   *   [1603987200000, 76]
   * ]
   */
  value: [TimeStamp, number][]
}

export interface StackedAreaChartProps
  <TChartData extends ChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: (value: unknown) => string | null
  }

export function StackedAreaChart <
  TChartData extends ChartData = { name: string, value: [TimeStamp, number][] }
> ({
  data,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  ...props
}: StackedAreaChartProps<TChartData>) {
  const option: EChartsOption = {
    color: props.lineColors || [
      cssStr('--acx-accents-blue-30'),
      cssStr('--acx-accents-blue-70'),
      cssStr('--acx-accents-blue-50')
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
      data: datum.value,
      type: 'line',
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
