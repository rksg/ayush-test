import ReactECharts from 'echarts-for-react'
import { find }     from 'lodash'

import { cssNumber, cssStr }                          from '../../theme/helper'
import { tooltipOptions, donutChartTooltipFormatter } from '../Chart/helper'

import type { EChartsOption, TooltipComponentOption } from 'echarts'
import type { EChartsReactProps }                     from 'echarts-for-react'

export type DonutChartData = {
  value: number,
  name: string,
  color: string,
}

interface DonutChartOptionalProps {
  showLegend: boolean
}

const defaultProps: DonutChartOptionalProps = {
  showLegend: true
}

DonutChart.defaultProps = { ...defaultProps }

export interface DonutChartProps extends DonutChartOptionalProps,
  Omit<EChartsReactProps, 'option' | 'opts'> {
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
      show: props.showLegend,
      top: 'middle',
      left: '65%',
      orient: 'vertical',
      icon: 'circle',
      selectedMode: false,
      itemGap: 4,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        ...commonStyles
      },
      itemStyle: {
        borderWidth: 0
      },
      formatter: name => {
        return `${find(data, (pie) => pie.name === name)?.value}`
      }
    },
    color: colors,
    series: [
      {
        animation: !isEmpty,
        data,
        type: 'pie',
        center: [props.showLegend ? '32%' : '50%', '50%'],
        radius: ['78%', '90%'],
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
          scaleSize: 5
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
