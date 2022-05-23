import { useEffect, useRef } from 'react'

import ReactECharts from 'echarts-for-react'

import { cssStr } from '../../theme/helper'

import type { ECharts, EChartsOption } from 'echarts'
import type { EChartsReactProps }      from 'echarts-for-react'

export interface DonutChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: Array<{ name: string, value: number }>
  title?: string
}

export function DonutChart ({
  data,
  ...props
}: DonutChartProps) {
  const sum = data.reduce((acc, cur) => acc + cur.value, 0)

  const commonStyles = {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-chart-font'),
    fontWeight: 700
  }

  const option: EChartsOption = {
    tooltip: {
      show: false
    },
    legend: {
      top: 'middle',
      right: 0,
      orient: 'vertical',
      icon: 'circle',
      selectedMode: false,
      textStyle: {
        fontFamily: cssStr('--acx-accent-brand-font'),
        fontSize: 12,
        fontWeight: 400
      }
    },
    color: [
      cssStr('--acx-semantics-red-50'),
      cssStr('--acx-accents-orange-50'),
      cssStr('--acx-semantics-yellow-30')
    ],
    series: [
      {
        data,
        type: 'pie',
        silent: true,
        center: ['32%', '50%'],
        radius: ['80%', '90%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return props.title ? `{title|${props.title}}\n{value1|${sum}}` : `{value2|${sum}}`
          },
          rich: {
            title: {
              ...commonStyles,
              fontSize: 9,
              padding: [0, 0, 5, 0]
            },
            value1: {
              ...commonStyles,
              fontSize: 18
            },
            value2: {
              ...commonStyles,
              fontSize: 24
            }
          }
        },
        emphasis: {
          scaleSize: 6
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: cssStr('--acx-primary-white')
        }
      }
    ]
  }

  const eChartsRef = useRef(null as any)
  useEffect(() => {
    if (eChartsRef && eChartsRef.current) {
      const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
      echartInstance.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: 0 })
    }
  })

  return (
    <ReactECharts
      {...props}
      ref={eChartsRef}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
