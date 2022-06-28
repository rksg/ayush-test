import { TooltipComponentOption } from 'echarts'
import ReactECharts               from 'echarts-for-react'
import _                          from 'lodash'
import { renderToString }         from 'react-dom/server'

import { cssNumber, cssStr } from '../../theme/helper'
import { tooltipOptions }    from '../Chart/helper'
import * as UI               from '../Chart/styledComponents'

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
  barColors?: string[]
  showTotal?: boolean
  showTooltip?: boolean
}

const defaultProps: StackedBarOptionalProps = {
  animation: true,
  showLabels: true,
  barColors: [
    cssStr('--acx-semantics-yellow-40'), // P4
    cssStr('--acx-accents-orange-50'), //.. P3
    cssStr('--acx-semantics-red-50'), //... P2
    cssStr('--acx-semantics-red-70') //.... P1
  ],
  showTotal: true,
  showTooltip: true
}

StackedBarChart.defaultProps = { ...defaultProps }

export interface StackedBarChartProps
  <TChartData extends ChartData>
  extends StackedBarOptionalProps, Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData
  }

const computeChartData = ({ category, series }: ChartData) => {
  const values = _(series)
  const sum = values.sumBy('value')
  const firstIndex = values.findIndex(v => v.value !== 0)
  return series.map(({ name, value }, index) => {
    const data = {
      value: [value, category, name, sum] as Dimensions,
      itemStyle: { borderRadius: [0] }
    }
    if (firstIndex === index) {
      data.itemStyle.borderRadius = [0, 2, 2, 0]
    }
    return data
  })
}

const massageData = (
  data: ChartData[], showTotal: boolean = true): RegisteredSeriesOption['bar'][] => {
  const seriesCommonConfig: RegisteredSeriesOption['bar'] = {
    type: 'bar',
    dimensions: [
      { name: 'value', type: 'number' },
      'category',
      'name',
      { name: 'sum', type: 'number' }
    ],
    stack: 'Total',
    barWidth: 8,
    label: {
      position: 'right',
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-body-3-font-size'),
      lineHeight: cssNumber('--acx-body-3-line-height'),
      color: cssStr('--acx-primary-black'),
      fontWeight: 400,
      formatter: '{@sum}'
    }
  }

  return _(data)
    .map(computeChartData)
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
}

export function StackedBarChart <TChartData extends ChartData = ChartData> ({
  data,
  ...props
}: StackedBarChartProps<TChartData>) {
  const { animation, showTotal, showLabels, barColors, showTooltip } = props

  const option: EChartsOption = {
    animation,
    silent: !showTooltip,
    color: barColors,
    grid: {
      left: showLabels ? 10 : 0,
      right: showLabels ? 20 : 0,
      bottom: 0,
      top: 0,
      containLabel: showLabels
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
      axisLabel: {
        formatter: '{label|{value}}',
        rich: {
          label: {
            align: 'left',
            width: 75,
            fontFamily: cssStr('--acx-neutral-brand-font'),
            fontSize: cssNumber('--acx-body-4-font-size'),
            lineHeight: cssNumber('--acx-body-4-line-height'),
            fontWeight: 400
          }
        }
      }
    },
    tooltip: {
      ...tooltipOptions as TooltipComponentOption,
      trigger: 'item',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const { color, value } = params
        return renderToString(
          <UI.TooltipWrapper>
            <UI.Badge
              color={color!.toString()}
              text={value[0]}
            />
          </UI.TooltipWrapper>
        )
      },
      show: showTooltip
    },
    series: massageData(data, showTotal)
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option}
    />
  )
}
