import { Space }             from 'antd'
import ReactECharts          from 'echarts-for-react'
import { find }              from 'lodash'
import { useIntl }           from 'react-intl'
import { MessageDescriptor } from 'react-intl'

import { cssNumber, cssStr } from '../../theme/helper'
import {
  tooltipOptions,
  donutChartTooltipFormatter,
  EventParams } from '../Chart/helper'

import { SubTitle } from './styledComponents'

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
  showLabel: boolean,
  showTotal: boolean,
  type: 'small' | 'large'
}

const defaultProps: DonutChartOptionalProps = {
  showLegend: true,
  animation: true,
  showLabel: false,
  showTotal: true,
  type: 'small'
}

DonutChart.defaultProps = { ...defaultProps }

export interface DonutChartProps extends DonutChartOptionalProps,
  Omit<EChartsReactProps, 'option' | 'opts' | 'style'> {
  data: Array<DonutChartData>
  title?: string,
  subTitle?: string,
  subTitleBlockHeight?: number
  tooltipFormat?: MessageDescriptor
  value?: string
  dataFormatter?: (value: unknown) => string | null
  onClick?: (params: EventParams) => void
  style: EChartsReactProps['style'] & { width: number, height: number }
}

export const onChartClick = (onClick: DonutChartProps['onClick']) =>
  (params: EventParams) => onClick && onClick(params)

export function DonutChart ({
  data,
  dataFormatter: _dataFormatter,
  ...props
}: DonutChartProps) {
  const dataFormatter = _dataFormatter ?? ((value: unknown) => String(value))

  const sum = data.reduce((acc, cur) => acc + cur.value, 0)
  const colors = data.map(series => series.color)
  const isEmpty = data.length === 0 || (data.length === 1 && data[0].name === '')
  const isSmall = props.type === 'small'

  if (data.length === 0) { // Adding empty data to show center label
    data.push({
      name: '',
      value: 0,
      color: cssStr('--acx-primary-white')
    })
  }

  const commonStyles = {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-chart-font'),
    fontSize: cssNumber('--acx-headline-3-font-size'),
    lineHeight: cssNumber('--acx-headline-3-line-height'),
    fontWeight: cssNumber('--acx-headline-3-font-weight')
  }

  const commonFontStyle = {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font')
  }

  const styles = {
    small: {
      title: {
        ...commonFontStyle,
        fontSize: cssNumber('--acx-subtitle-6-font-size'),
        lineHeight: cssNumber('--acx-subtitle-6-line-height'),
        fontWeight: cssNumber('--acx-subtitle-6-font-weight')
      },
      value: {
        ...commonStyles
      }
    },
    large: {
      title: {
        ...commonFontStyle,
        fontSize: cssNumber('--acx-body-2-font-size'),
        lineHeight: cssNumber('--acx-body-2-line-height'),
        fontWeight: cssNumber('--acx-body-font-weight')
      },
      value: {
        ...commonFontStyle,
        fontSize: cssNumber('--acx-subtitle-1-font-size'),
        lineHeight: cssNumber('--acx-subtitle-1-line-height'),
        fontWeight: cssNumber('--acx-subtitle-1-font-weight')
      }
    },
    label: {
      ...commonFontStyle,
      fontSize: cssNumber('--acx-body-4-font-size'),
      lineHeight: cssNumber('--acx-body-4-line-height'),
      fontWeight: cssNumber('--acx-body-font-weight')
    }
  }

  const option: EChartsOption = {
    animation: props.animation,
    tooltip: {
      show: false
    },
    title: {
      show: true,
      text: props.title,
      subtext: props.value
        ? props.value
        : props.showTotal ? `${dataFormatter(sum)}` : undefined,
      left: props.showLegend && !isEmpty ? '28%' : 'center',
      top: 'center',
      textVerticalAlign: 'top',
      textAlign: props.showLegend && !isEmpty ? 'center' : undefined,
      itemGap: 4,
      textStyle: styles[props.type].title,
      subtextStyle: styles[props.type].value
    },
    legend: {
      show: props.showLegend,
      top: 'middle',
      left: '60%',
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
        return `${dataFormatter(value)}`
      }
    },
    color: colors,
    series: [
      {
        animation: !isEmpty,
        data,
        type: 'pie',
        cursor: props.onClick ? 'pointer' : 'auto',
        center: [props.showLegend && !isEmpty ? '30%' : '50%', '50%'],
        radius: isEmpty
          ? ['82%', '92%']
          : props.showLabel ? ['62%', '78%'] : ['78%', '92%'],
        avoidLabelOverlap: true,
        label: {
          show: props.showLabel,
          ...styles.label
        },
        tooltip: {
          ...tooltipOptions(),
          show: !isEmpty,
          formatter: donutChartTooltipFormatter(
            useIntl(),
            dataFormatter,
            sum,
            props.tooltipFormat
          )
        },
        emphasis: {
          disabled: isEmpty,
          scaleSize: 5
        },
        labelLine: {
          show: props.showLabel,
          length: isSmall ? 10 : 15,
          length2: isSmall ? 5 : 10
        },
        itemStyle: {
          borderWidth: props.type === 'large' ? 2 : 1,
          borderColor: isEmpty ? cssStr('--acx-neutrals-25') : cssStr('--acx-primary-white')
        }
      }
    ]
  }

  return (
    <Space direction='vertical' size={0}>
      <ReactECharts
        {...{
          ...props,
          style: {
            ...props.style,
            height: props.style?.height - (props.subTitle ? props.subTitleBlockHeight || 30 : 0) }
        }}
        opts={{ renderer: 'svg' }}
        option={option}
        onEvents={{ click: onChartClick(props.onClick) }} />
      { props.subTitle && <SubTitle width={props.style.width}>{props.subTitle}</SubTitle> }
    </Space>
  )
}
