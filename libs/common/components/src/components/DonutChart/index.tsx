import ReactECharts from 'echarts-for-react'
import { find }     from 'lodash'
import { useIntl }  from 'react-intl'

import { cssNumber, cssStr }                                       from '../../theme/helper'
import { tooltipOptions, donutChartTooltipFormatter, EventParams } from '../Chart/helper'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export type DonutChartData = {
  value: number,
  name: string,
  color: string,
}

interface DonutChartOptionalProps {
  showLegend: boolean,
  animation: boolean,
}

const defaultProps: DonutChartOptionalProps = {
  showLegend: true,
  animation: true
}

DonutChart.defaultProps = { ...defaultProps }

export interface DonutChartProps extends DonutChartOptionalProps,
  Omit<EChartsReactProps, 'option' | 'opts'> {
  data: Array<DonutChartData>
  title?: string,
  subTitle?: string | {
    defaultMessage: string,
    values: Record<string, string|number|undefined>
  }
  unit?: string
  dataFormatter?: (value: unknown) => string | null,
  onClick?: (params: EventParams) => void
}

export const onChartClick = (onClick: DonutChartProps['onClick']) =>
  (params: EventParams) => onClick && onClick(params)

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

  const { $t } = useIntl()
  const toolTipIntlFormat = {
    id: `${props.title}-tooltip`,
    defaultMessage: `{formattedValue} ${props.unit}{isPlural}`
  }
  const option: EChartsOption = {
    animation: props.animation,
    title: [{
      subtext: (() => {
        const intlProps = {
          id: props.title,
          defaultMessage: (
            props.subTitle &&
            typeof props.subTitle !== 'string' &&
            props.subTitle.defaultMessage) as string }
        return (props.subTitle && typeof props.subTitle !== 'string')
          ? `{a|${$t(intlProps, props.subTitle.values)}}`
          : props.subTitle
            ? `{a|${props.subTitle}}`
            : undefined
      })(),
      subtextStyle: {
        width: 200,
        overflow: 'break',
        rich: { a: { align: 'center' } }
      },
      top: '75%'
    }],
    tooltip: {
      show: false
    },
    legend: {
      show: props.showLegend,
      top: 10,
      left: '55%',
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
        const value = find(data, (pie) => pie.name === name)?.value
        return `${dataFormatter ? dataFormatter(value) : value}`
      }
    },
    color: colors,
    series: [
      {
        animation: !isEmpty,
        data,
        type: 'pie',
        center: [
          props.showLegend && !isEmpty ? '26%' : '50%', 60],
        radius: props.subTitle ? ['58%', '68%'] : ['76%', '90%'],
        cursor: isEmpty ? 'auto' : 'pointer',
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            const value = dataFormatter ? dataFormatter(sum) : sum
            return props.title
              ? `{title|${props.title}}\n\n{value|${value}}`
              : `{value|${value}}`
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
          ...tooltipOptions(),
          show: !isEmpty,
          formatter: donutChartTooltipFormatter(
            dataFormatter,
            props.unit
              ? (value: number, formattedValue: string) =>
                $t(toolTipIntlFormat, {
                  unit: props.unit,
                  isPlural: value > 1 ? 's' : '',
                  formattedValue
                })
              : undefined
          )
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
          borderColor: isEmpty ? cssStr('--acx-neutrals-25') : cssStr('--acx-primary-white')
        }
      }
    ]
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option}
      onEvents={{ click: onChartClick(props.onClick) }} />
  )
}
