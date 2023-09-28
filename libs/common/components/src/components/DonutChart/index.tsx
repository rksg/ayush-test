import { Space }          from 'antd'
import ReactECharts       from 'echarts-for-react'
import { find }           from 'lodash'
import { renderToString } from 'react-dom/server'
import {
  MessageDescriptor,
  defineMessage,
  FormattedMessage,
  RawIntlProvider
} from 'react-intl'

import { intlFormats } from '@acx-ui/formatter'
import { getIntl }     from '@acx-ui/utils'

import { cssNumber, cssStr } from '../../theme/helper'
import {
  TooltipFormatterParams,
  tooltipOptions,
  defaultRichTextFormatValues,
  EventParams
} from '../Chart/helper'
import * as ChartUI from '../Chart/styledComponents'

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
  legend: 'value' | 'name' | 'name-value',
  size: 'small' | 'medium' | 'large' | 'x-large'
}

const defaultProps: DonutChartOptionalProps = {
  showLegend: false,
  animation: false,
  showLabel: false,
  showTotal: true,
  legend: 'value',
  size: 'small'
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

export const tooltipFormatter = (
  dataFormatter: ((value: unknown) => string | null),
  total: number,
  format?: MessageDescriptor
) => (
  parameters: TooltipFormatterParams
) => {
  const intl = getIntl()
  const { name, value } = parameters
  let percent = (parameters.percent ?? 0)
  if (percent) percent = percent / 100
  const formattedValue = dataFormatter(parameters.value)
  const formattedTotal = dataFormatter(total)
  const formattedPercent = intl.$t(intlFormats.percentFormat, { value: percent })
  const tooltipFormat = format ?? defineMessage({
    defaultMessage: '{name} <space><b>{formattedValue}</b></space>',
    description: 'DonutChart: default tooltip format for donut chart'
  })

  const text = <FormattedMessage {...tooltipFormat}
    values={{
      ...defaultRichTextFormatValues,
      name, value, percent, total,
      formattedPercent, formattedValue, formattedTotal
    }}
  />

  return renderToString(
    <RawIntlProvider value={intl}>
      <ChartUI.TooltipWrapper>
        <ChartUI.Badge
          className='acx-chart-tooltip'
          color={parameters.color?.toString()}
          text={text}
        />
      </ChartUI.TooltipWrapper>
    </RawIntlProvider>
  )
}

export function DonutChart ({
  data,
  dataFormatter: _dataFormatter,
  ...props
}: DonutChartProps) {
  const dataFormatter = _dataFormatter ?? ((value: unknown) => String(value))

  const sum = data.reduce((acc, cur) => acc + cur.value, 0)
  const colors = data.map(series => series.color)
  const isEmpty = data.length === 0 || (data.length === 1 && data[0].name === '')
  const isSmall = props.size === 'small'
  const isCustomEmptyStatus = isEmpty && !!props.value

  if (data.length === 0) { // Adding empty data to show center label
    data.push({
      name: '',
      value: 0,
      color: cssStr('--acx-primary-white')
    })
  }

  const legendStyles = {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-5-font-weight')
  }

  const commonStyles = {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-chart-font'),
    fontSize: cssNumber('--acx-headline-3-font-size'),
    lineHeight: cssNumber('--acx-headline-3-line-height'),
    fontWeight: cssNumber('--acx-headline-3-font-weight')
  }

  const customStyles = {
    color: cssStr('--acx-neutrals-60'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-subtitle-6-font-size'),
    lineHeight: cssNumber('--acx-subtitle-5-line-height'),
    fontWeight: cssNumber('--acx-subtitle-6-font-weight')
  }

  const commonFontStyle = {
    color: cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font')
  }

  const styles = {
    'small': {
      title: {
        ...commonFontStyle,
        fontSize: cssNumber('--acx-subtitle-5-font-size'),
        lineHeight: cssNumber('--acx-subtitle-5-line-height'),
        fontWeight: cssNumber('--acx-subtitle-6-font-weight')
      },
      value: {
        ...(isCustomEmptyStatus ? customStyles : commonStyles)
      }
    },
    'medium': {
      title: {
        ...commonFontStyle,
        fontFamily: cssStr('--acx-chart-font'),
        fontSize: cssNumber('--acx-headline-2-font-size'),
        lineHeight: cssNumber('--acx-headline-2-line-height'),
        fontWeight: cssNumber('--acx-headline-2-font-weight-bold')
      },
      value: {
        ...commonFontStyle,
        fontSize: cssNumber('--acx-subtitle-1-font-size'),
        lineHeight: cssNumber('--acx-subtitle-1-line-height'),
        fontWeight: cssNumber('--acx-subtitle-1-font-weight')
      }
    },
    'large': {
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
    'x-large': {
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
    'label': {
      ...commonFontStyle,
      fontSize: cssNumber('--acx-body-4-font-size'),
      lineHeight: cssNumber('--acx-body-4-line-height'),
      fontWeight: cssNumber('--acx-body-font-weight')
    }
  }

  const getDonutRadius = () => {
    switch(true) {
      case isEmpty:
        return ['82%', '92%']
      case props.showLabel:
        return ['62%', '78%']
      case props.size === 'medium':
        return ['76%', '92%']
      case props.size === 'x-large':
        return ['58%', '82%']
      default:
        return ['78%', '92%']
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
      textStyle: styles[props.size].title,
      subtextStyle: styles[props.size].value
    },
    legend: {
      show: props.showLegend,
      top: 'middle',
      left: props.size === 'x-large' ? '55%' : '60%',
      orient: 'vertical',
      icon: 'circle',
      selectedMode: false,
      itemGap: props.size === 'x-large'? 16 : 4,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        ...legendStyles
      },
      itemStyle: {
        borderWidth: 0
      },
      formatter: name => {
        const value = find(data, (pie) => pie.name === name)?.value
        switch(props.legend) {
          case 'name': return name
          case 'name-value': return `${name} - ${dataFormatter(value)}`
          case 'value':
          default:
            return `${dataFormatter(value)}`
        }
      }
    },
    color: colors,
    series: [
      {
        animation: false,
        data,
        type: 'pie',
        cursor: props.onClick ? 'pointer' : 'auto',
        center: [props.showLegend && !isEmpty ? '30%' : '50%', '50%'],
        radius: getDonutRadius(),
        avoidLabelOverlap: true,
        label: {
          show: props.showLabel,
          ...styles.label
        },
        tooltip: {
          ...tooltipOptions(),
          show: !isEmpty,
          formatter: tooltipFormatter(
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
          borderWidth: props.size === 'large' || props.size === 'x-large' ? 2 : 1,
          borderColor: isCustomEmptyStatus
            ? cssStr('--acx-neutrals-40')
            : isEmpty ? cssStr('--acx-neutrals-25') : cssStr('--acx-primary-white')
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
