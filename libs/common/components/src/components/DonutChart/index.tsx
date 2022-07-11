import ReactECharts from 'echarts-for-react'
import _            from 'lodash'

import { cssNumber, cssStr }                          from '../../theme/helper'
import { tooltipOptions, donutChartTooltipFormatter } from '../Chart/helper'

import type { EChartsOption, TooltipComponentOption } from 'echarts'
import type { EChartsReactProps }                     from 'echarts-for-react'

export type DonutChartData = {
  value: number,
  name: string,
  color: string,
}

export interface DonutChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: Array<DonutChartData>
  title?: string,
  dataFormatter?: (value: unknown) => string | null
}

export function DonutChart ({
  data,
  dataFormatter,
  ...props
}: DonutChartProps) {

  const sum = data.reduce((acc, cur) => acc + cur.value, 0)
  const colors = data.map(series => series.color)
  const isEmpty = data.length === 0 || (data.length === 1 && data[0].name === '')

  if (data.length === 0) { // Adding empty data to show center label
    data.push({
      name: '',
      value: 0,
      color: cssStr('--acx-primary-white')
    })
  }

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
    color: colors,
    series: [
      {
        animation: !isEmpty,
        data,
        type: 'pie',
        center: ['32%', '50%'],
        radius: ['76%', '90%'],
        cursor: isEmpty ? 'auto' : 'pointer',
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return props.title ? `{title|${props.title}}\n\n{value|${sum}}` : `{value|${sum}}`
          },
          rich: {
            title: {
              fontFamily: cssStr('--acx-neutral-brand-font'),
              fontSize: cssNumber('--acx-subtitle-6-font-size'),
              lineHeight: cssNumber('--acx-subtitle-6-line-height'),
              fontWeight: cssNumber('--acx-subtitle-6-font-weight'),
              padding: [0, 0, -15, 0]
            },
            value: {
              ...commonStyles
            }
          }
        },
        tooltip: {
          ...tooltipOptions() as TooltipComponentOption,
          show: !isEmpty,
          formatter: donutChartTooltipFormatter(dataFormatter)
        },
        emphasis: {
          disabled: isEmpty,
          scaleSize: 6
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: isEmpty ? cssStr('--acx-neutrals-20') : cssStr('--acx-primary-white')
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
