import ReactECharts from 'echarts-for-react'
import _            from 'lodash'

import { cssNumber, cssStr } from '../../theme/helper'

import type { EChartsOption, RegisteredSeriesOption } from 'echarts'
import type { EChartsReactProps }                     from 'echarts-for-react'

type ChartData = {
  category: string
  series: Array<{ name: string, value: number }>
}

type Dimensions = [
  number, // value
  string, // category
  string, // category
  number  // sum
]

export interface StackedBarChartProps
  <TChartData extends ChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData
  }

const computeChartData = ({ category, series }: ChartData) => {
  const values = _(series)
  const sum = values.sumBy('value')
  const [firstIndex, lastIndex] = [
    values.findIndex(v => v.value !== 0),
    values.findLastIndex(v => v.value !== 0)
  ]
  return series.map(({ name, value }, index) => {
    const data = {
      value: [value, category, name, sum] as Dimensions,
      itemStyle: { borderRadius: [0] }
    }
    if (firstIndex === lastIndex && firstIndex === index) {
      data.itemStyle.borderRadius = [50]
    } else if (firstIndex === index) {
      data.itemStyle.borderRadius = [0, 50, 50, 0]
    } else if(lastIndex === index) {
      data.itemStyle.borderRadius = [50, 0, 0, 50]
    }
    return data
  })
}

const massageData = (data: ChartData[]): RegisteredSeriesOption['bar'][] => {
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
    emphasis: {
      focus: 'series'
    },
    label: {
      show: false,
      position: 'right',
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: 12,
      lineHeight: 16,
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
        show: index === sets.length - 1
      }
    }))
    .value()
}

export function StackedBarChart <TChartData extends ChartData = ChartData> ({
  data,
  ...props
}: StackedBarChartProps<TChartData>) {
  const option: EChartsOption = {
    silent: true,
    color: [
      // TODO:
      // enable custom list of colors
      cssStr('--acx-semantics-yellow-50'),
      cssStr('--acx-semantics-yellow-70'),
      cssStr('--acx-semantics-red-50'),
      cssStr('--acx-semantics-violet-50')
    ],
    grid: {
      left: 10,
      right: 20,
      bottom: 0,
      top: 0,
      containLabel: true
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
    series: massageData(data)
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option}
    />
  )
}
