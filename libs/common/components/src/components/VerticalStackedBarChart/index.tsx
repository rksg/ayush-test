import { useRef } from 'react'

import ReactECharts from 'echarts-for-react'

import {
  tooltipOptions,
  axisLabelOptions,
  yAxisOptions,
  xAxisOptions
} from '../Chart/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export type VerticalStackedBarChartData = {
  name: string
  data: number[]
  color: string
}

interface VerticalStackedBarChartProps
  <TChartData extends VerticalStackedBarChartData[]>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  categories: string[]
  dataFormatter?: (value: number) => string
}

export function VerticalStackedBarChart<TChartData extends VerticalStackedBarChartData[]>
({
  data,
  categories,
  dataFormatter,
  ...props
}: VerticalStackedBarChartProps<TChartData>) {
  const eChartsRef = useRef<ReactECharts>(null)
  const option: EChartsOption = {
    grid: {
      top: 5,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true
    },
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis'
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'category',
      data: categories,
      axisLabel: { ...axisLabelOptions(), interval: 0 },
      axisPointer: { type: 'none' }
    },
    yAxis: {
      ...yAxisOptions(),
      type: 'value',
      max: Math.max(...data.reduce((agg, set)=>
        agg.map((item, index)=> item + set.data[index]),
      new Array(categories.length).fill(0))),
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dataFormatter ? dataFormatter : (value: number) => `${value}`
      }
    },
    series: data.map(sets=>({
      ...sets,
      type: 'bar',
      stack: 'summary',
      cursor: 'auto',
      barCategoryGap: '0%',
      itemStyle: {
        borderWidth: 2,
        borderColor: 'transparent'
      }
    }))
  }

  return (
    <ReactECharts
      ref={eChartsRef}
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
