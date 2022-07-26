import { graphic }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { cssStr } from '../../theme/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export interface SparklineChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: number[]
  color?: string
}

export function SparklineChart ({
  data,
  ...props
}: SparklineChartProps) {
  // TODO:
  // come up with logic to know if current sparkline should be in red or green
  const { color=cssStr('--acx-semantics-green-50') } = props
  const colorLinearGradient = new graphic.LinearGradient(0, 0, 0, 1, [
    {
      offset: 0,
      color
    },
    {
      offset: 1,
      color: 'rgba(255, 255, 255, 20)'
    }]
  )
  const option: EChartsOption = {
    xAxis: {
      show: false,
      type: 'category'
    },
    yAxis: {
      type: 'value',
      show: false
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      top: '0%',
      containLabel: false
    },
    series: [
      {
        data,
        type: 'line',
        areaStyle: { color: colorLinearGradient },
        lineStyle: {
          color
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
