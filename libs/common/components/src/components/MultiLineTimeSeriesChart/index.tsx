import ReactECharts from 'echarts-for-react'

import { cssStr } from '../../theme/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

type TimeStamp = string | number

export interface MultiLineTimeSeriesChartData extends Object {
  /**
   * Multi dimensional array which first item is timestamp and 2nd item is value
   * @example
   * [
   *   [1603900800000, 64.12186646508322],
   *   [1603987200000, 76]
   * ]
   */
  data: [TimeStamp, number][]
}

export interface MultiLineTimeSeriesChartProps
  <TChartData extends MultiLineTimeSeriesChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[]
  }

export function MultiLineTimeSeriesChart
  <TChartData extends MultiLineTimeSeriesChartData = { name: string, data: [TimeStamp, number][] }>
({
  data,
  legendProp = 'name' as keyof TChartData,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData>) {
  const option: EChartsOption = {
    color: props.lineColors || [
      cssStr('--acx-accents-blue-70'),
      cssStr('--acx-semantics-green-40'),
      cssStr('--acx-primary-black')
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
        fontWeight: 300,
        lineHeight: 16
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
        fontWeight: 400
      }
    },
    series: data.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2 }
    }))
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
