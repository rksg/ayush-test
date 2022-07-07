import ReactECharts from 'echarts-for-react'
import _            from 'lodash'

import { cssNumber, cssStr }                          from '../../theme/helper'
import { tooltipOptions, donutChartTooltipFormatter } from '../Chart/helper'

import type { EChartsOption, TooltipComponentOption } from 'echarts'
import type { EChartsReactProps }                     from 'echarts-for-react'

export interface DonutChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: Array<{ name: string, value: number }>
  title?: string,
  donutColors?: string[],
  dataFormatter?: (value: unknown) => string | null
}

export function DonutChart ({
  data,
  dataFormatter,
  ...props
}: DonutChartProps) {

  const sum = data.reduce((acc, cur) => acc + cur.value, 0)
  const commonStyles = {
    fontFamily: cssStr('--acx-chart-font'),
    fontSize: cssNumber('--acx-headline-3-font-size'),
    lineHeight: cssNumber('--acx-headline-3-line-height'),
    fontWeight: cssNumber('--acx-headline-3-font-weight')
  }

  const option: EChartsOption = {
    tooltip: {
      show: false
    },
    legend: {
      top: 'middle',
      left: '68%',
      orient: 'vertical',
      icon: 'circle',
      selectedMode: false,
      itemGap: 2,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        ...commonStyles
      },
      itemStyle: {
        borderWidth: 0
      },
      formatter: name => {
        return `${_.find(data, (row) => row.name === name)?.value || name}`
      }
    },
    color: props.donutColors || [
      cssStr('--acx-semantics-red-60'),
      cssStr('--acx-semantics-yellow-40'),
      cssStr('--acx-neutrals-50'),
      cssStr('--acx-semantics-green-50')
    ],
    series: [
      {
        data,
        type: 'pie',
        center: ['32%', '50%'],
        radius: ['68%', '80%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return props.title ? `{title|${props.title}}\n{value|${sum}}` : `{value|${sum}}`
          },
          rich: {
            title: {
              fontFamily: cssStr('--acx-neutral-brand-font'),
              fontSize: cssNumber('--acx-subtitle-6-font-size'),
              lineHeight: cssNumber('--acx-subtitle-6-line-height'),
              fontWeight: cssNumber('--acx-subtitle-6-font-weight'),
              padding: [20, 0]
            },
            value: {
              ...commonStyles
            }
          }
        },
        tooltip: {
          ...tooltipOptions() as TooltipComponentOption,
          show: true,
          formatter: donutChartTooltipFormatter(dataFormatter)
        },
        emphasis: {
          scaleSize: 4,
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            borderWidth: 0
          }
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: cssStr('--acx-primary-white')
        }
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
