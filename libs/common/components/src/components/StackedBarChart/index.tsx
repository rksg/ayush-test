import { useRef } from 'react'

import { TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                from 'echarts-for-react'
import { CallbackDataParams, GridOption }          from 'echarts/types/dist/shared'
import _                                           from 'lodash'
import { renderToString }                          from 'react-dom/server'
import {
  MessageDescriptor,
  defineMessage,
  FormattedMessage,
  RawIntlProvider
} from 'react-intl'

import { incidentSeverities } from '@acx-ui/analytics/utils'
import { getIntl }            from '@acx-ui/utils'

import { cssStr }              from '../../theme/helper'
import {
  TooltipFormatterParams,
  tooltipOptions,
  defaultRichTextFormatValues,
  barChartAxisLabelOptions,
  barChartSeriesLabelOptions
} from '../Chart/helper'
import * as ChartUI            from '../Chart/styledComponents'
import { useOnAxisLabelClick } from '../Chart/useOnAxisLabelClick'

import type { EChartsOption, RegisteredSeriesOption } from 'echarts'
import type { EChartsReactProps }                     from 'echarts-for-react'

type ChartData = {
  category: string
  series: Array<{ name: string, value: number }>
}

type Dimensions = [
  number, // value
  string, // category
  string, // name
  number  // sum
]

// Optional props
interface StackedBarOptionalProps {
  animation: boolean
  showLabels: boolean
  barWidth: number
  barColors?: string[]
  showTotal: boolean
  showTooltip: boolean
  setBarColor?: object
  axisLabelWidth?: number
  total?: number
}

const defaultProps: StackedBarOptionalProps = {
  animation: false,
  showLabels: true,
  showTotal: true,
  showTooltip: true,
  barWidth: 10
}

StackedBarChart.defaultProps = { ...defaultProps }

export interface StackedBarChartProps
  <TChartData extends ChartData>
  extends StackedBarOptionalProps, Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData
    dataFormatter?: (value: unknown) => string | null,
    tooltipFormat?: MessageDescriptor
    onAxisLabelClick?: (name: string) => void
    formatTotal?: boolean
    grid?: GridOption
}

const computeChartData = ({ category, series }: ChartData, isPercent:boolean) => {
  const values = _(series)
  const total = values.sumBy('value')
  const firstIndex = values.findIndex(v => v.value !== 0)
  return series.map(({ name, value }, index) => {
    let seriesValue = value
    if(isPercent){
      seriesValue = value/total
    }
    const data = {
      value: [seriesValue, category, name, total] as Dimensions,
      itemStyle: { borderRadius: [0] }
    }
    if (firstIndex === index) {
      data.itemStyle.borderRadius = [0, 2, 2, 0]
    }
    return data
  })
}

const massageData = (
  data: ChartData[],
  showTotal: boolean,
  barWidth: number,
  isPercent:boolean,
  formatTotal?:boolean,
  dataFormatter?:((value: unknown) => string | null)
)
  : RegisteredSeriesOption['bar'][] => {
  const seriesCommonConfig: RegisteredSeriesOption['bar'] = {
    type: 'bar',
    cursor: 'default',
    dimensions: [
      { name: 'value', type: 'number' },
      'category',
      'name',
      { name: 'sum', type: 'number' }
    ],
    stack: 'Total',
    barWidth,
    label: {
      ...barChartSeriesLabelOptions(),
      formatter: (params : CallbackDataParams) =>
      ((formatTotal && dataFormatter)
        ? dataFormatter((params.value as string[])?.[3]) :
        '@sum') as string
    }
  }

  return _(data)
    .map(chartData=>computeChartData(chartData,isPercent))
    .flatMap(items => items)
    .groupBy('value.2') // name
    .toPairs()
    .sort(([a], [b]) => a < b ? 1 : -1)
    .map(([name, data], index, sets) => ({
      ...seriesCommonConfig,
      name,
      data,
      label: {
        ...seriesCommonConfig.label,
        show: showTotal ? index === sets.length - 1 : false
      }
    }))
    .value()
    .map((datum) => {
      const dataWithColor = datum.data.map(val => {
        const isValidColor = Object.keys(incidentSeverities).includes(val.value[2])
        if (isValidColor) {
          return {
            ...val,
            itemStyle: {
              ...val.itemStyle,
              color:
                cssStr(incidentSeverities[val.value[2] as keyof typeof incidentSeverities].color)
            }
          }
        }
        return val
      })
      return {
        ...datum,
        data: dataWithColor
      }
    })
}

export const tooltipFormatter = (
  dataFormatter?: ((value: unknown) => string | null),
  format?: MessageDescriptor,
  total?: number
) => (
  parameters: TooltipComponentFormatterCallbackParams
) => {
  const intl = getIntl()
  const param = parameters as TooltipFormatterParams
  const value = param.value as string[]
  /*
  Below replace method is required to remove weightage mentioned in between angle brackets `<` `>`
  Like: <2> Operational, <1> Requires Attention
  */
  const name = param.seriesName?.replace(/<\d+>/,'')
  let toolTipValue = value[0]
  if(total){
    toolTipValue = (Number(value[0]) * total).toString()
  }
  const formattedValue = dataFormatter ? dataFormatter(toolTipValue) : toolTipValue
  const tooltipFormat = format ?? defineMessage({
    defaultMessage: '{name} <space><b>{formattedValue}</b></space>',
    description: 'StackedBarChart: default tooltip format for stacked bar chart'
  })
  const text = <FormattedMessage {...tooltipFormat}
    values={{
      ...defaultRichTextFormatValues,
      name,
      formattedValue,
      value: value[0]
    }}
  />

  return renderToString(
    <RawIntlProvider value={intl}>
      <ChartUI.TooltipWrapper>
        <ChartUI.Badge
          className='acx-chart-tooltip'
          color={param.color?.toString()}
          text={text}
        />
      </ChartUI.TooltipWrapper>
    </RawIntlProvider>
  )
}

export function StackedBarChart <TChartData extends ChartData = ChartData> ({
  data,
  dataFormatter,
  onAxisLabelClick,
  formatTotal,
  grid: gridProps,
  ...props
}: StackedBarChartProps<TChartData>) {
  const eChartsRef = useRef<ReactECharts>(null)
  const { animation, showTotal, showLabels, showTooltip, barWidth } = props
  const barColors = props.barColors ??
    Object.values(incidentSeverities).map(({ color }) => cssStr(color))

  useOnAxisLabelClick(eChartsRef, onAxisLabelClick)
  const triggerAxisLabelEvent : boolean = typeof onAxisLabelClick === 'function'
  let option: EChartsOption = {
    animation,
    silent: !showTooltip,
    color: barColors,
    grid: {
      left: showLabels ? 5 : 0,
      right: showLabels ? 25 : 0,
      bottom: 0,
      top: 0,
      containLabel: showLabels,
      ...gridProps
    },
    xAxis: {
      type: 'value',
      show: false
    },
    yAxis: {
      type: 'category',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      triggerEvent: triggerAxisLabelEvent,
      axisLabel: {
        show: showLabels,
        formatter: '{label|{value}}',
        rich: {
          label: {
            ...barChartAxisLabelOptions(),
            ...(triggerAxisLabelEvent && { color: cssStr('--acx-accents-blue-50') }),
            align: 'left',
            width: props.axisLabelWidth || 75
          }
        }
      }
    },
    tooltip: {
      ...tooltipOptions(),
      trigger: 'item',
      position: 'top',
      formatter: tooltipFormatter(
        dataFormatter,
        props.tooltipFormat,
        props.total),
      show: showTooltip
    },
    series: massageData(data, showTotal, barWidth, !!props.total, formatTotal, dataFormatter)
  }
  return (
    <ReactECharts
      ref={eChartsRef}
      {...props}
      opts={{ renderer: 'svg' }}
      option={option}
    />
  )
}
