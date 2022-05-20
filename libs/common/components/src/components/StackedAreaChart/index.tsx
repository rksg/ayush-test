import ReactECharts from 'echarts-for-react'

import { cssStr } from '../../theme/helper'

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
  value: number[][]
}

export interface StackedAreaChartProps
  <TChartData extends ChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData
  }

export function StackedAreaChart <
  TChartData extends ChartData = { name: string, value: number[][] }
> ({
  data,
  legendProp = 'name' as keyof TChartData,
  ...props
}: StackedAreaChartProps<TChartData>) {
  const option: EChartsOption = {
    color: [
      cssStr('--acx-accents-blue-30'),
      cssStr('--acx-accents-blue-70'),
      cssStr('--acx-accents-blue-50')
    ],
    grid: {
      left: '0%',
      right: '2%',
      bottom: '0%',
      top: '15%',
      containLabel: true
    },
    legend: {
      data: data.map(datum => datum[legendProp]) as unknown as string[],
      icon: 'square',
      right: 15,
      itemWidth: 15,
      itemGap: 15,
      textStyle: {
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontWeight: 400,
        fontSize: 10,
        lineHeight: 20
      }
    },
    tooltip: {
      trigger: 'axis',
      textStyle: {
        fontFamily: cssStr('--acx-accent-brand-font'),
        fontSize: 10,
        fontStyle: 'normal'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: cssStr('--acx-neutrals-50'),
      borderWidth: 1,
      borderRadius: 0,
      padding: 12
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: {
          // TODO:
          // handle smaller and larger time range
          month: '{label|{MMM}}', // Jan, Feb, ...
          day: '{label|{d}}' // 1, 2, ...
        },
        rich: {
          label: {
            fontFamily: cssStr('--acx-neutral-brand-font'),
            fontSize: 10,
            fontWeight: 400
          }
        }
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '10%'],
      axisLabel: {
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: 10,
        fontStyle: 'normal'
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
