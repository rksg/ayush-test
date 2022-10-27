import { graphic }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { cssStr } from '../../theme/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export interface SparklineChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: number[]
  lineColor?: string
  areaBaseColor?: string
  isTrendLine?: boolean
}

SparklineChart.defaultProps = {
  isTrendLine: false
}

export function SparklineChart ({
  data,
  ...props
}: SparklineChartProps) {

  const trendLineColors = {
    red: {
      lineColor: cssStr('--acx-semantics-red-50'),
      areaBaseColor: cssStr('--acx-semantics-red-30')
    },
    green: {
      lineColor: cssStr('--acx-semantics-green-50'),
      areaBaseColor: cssStr('--acx-semantics-green-30')
    },
    blue: {
      lineColor: cssStr('--acx-accents-blue-50'),
      areaBaseColor: cssStr('--acx-accents-blue-40')
    }
  }

  const { isTrendLine } = props
  let { lineColor, areaBaseColor } = props
  lineColor = trendLineColors.blue.lineColor
  areaBaseColor = trendLineColors.blue.areaBaseColor

  if(data.length && isTrendLine){
    const first = data[0]
    const last = data[data.length - 1]
    const colorGroup = first > last ? trendLineColors.red : trendLineColors.green
    lineColor = colorGroup.lineColor
    areaBaseColor = colorGroup.areaBaseColor
  }

  const colorLinearGradient = new graphic.LinearGradient(0, 0, 0, 1, [
    {
      offset: 0,
      color: areaBaseColor!
    },
    {
      offset: 1,
      color: cssStr('--acx-primary-white')
    }]
  )
  const option: EChartsOption = {
    animation: false,
    xAxis: {
      show: false,
      type: 'category'
    },
    yAxis: {
      type: 'value',
      show: false
    },
    grid: {
      left: 0,
      right: 0,
      bottom: 2,
      top: 2,
      containLabel: false
    },
    series: [
      {
        data,
        type: 'line',
        silent: true,
        areaStyle: { color: colorLinearGradient },
        lineStyle: {
          color: lineColor,
          width: 1
        },
        smooth: true,
        showSymbol: false
      }
    ]
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
