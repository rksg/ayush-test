import { useRef } from 'react'

import ReactECharts                          from 'echarts-for-react'
import { renderToString }                    from 'react-dom/server'
import { RawIntlProvider, FormattedMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import {
  TooltipFormatterParams,
  tooltipOptions,
  defaultRichTextFormatValues,
  axisLabelOptions,
  yAxisOptions,
  xAxisOptions
} from '../Chart/helper'
import * as ChartUI from '../Chart/styledComponents'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export type VerticalStackedBarChartData = {
  name: string
  data: number[]
  color: string
}

export interface VerticalStackedBarChartProps
  <TChartData extends VerticalStackedBarChartData[]>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  categories: string[]
  dataFormatter?: (value: number) => string
  yAxisLabelFormatter?: (value: number) => string
}

export const tooltipFormatter = (
  dataFormatter?: (value: number) => string
) => (
  parameters: TooltipFormatterParams | TooltipFormatterParams[]
) => {
  const intl = getIntl()
  const params = Array.isArray(parameters) ? parameters : [parameters]
  const name = params[0].name
  const reversedParams = [...params].reverse()

  return renderToString(
    <RawIntlProvider value={intl}>
      <ChartUI.TooltipWrapper>
        <b>{name}</b>
        <ul>{
          reversedParams.map(({ seriesName, value, color }) => {
            const text = <FormattedMessage
              defaultMessage='{name}: <b>{value}</b>'
              description='Label before colon, value after colon'
              values={{
                ...defaultRichTextFormatValues,
                name: seriesName,
                value: dataFormatter ? dataFormatter(value as number) : String(value)
              }}
            />
            return <li key={seriesName}>
              <ChartUI.Badge
                className='acx-chart-tooltip'
                color={(color) as string}
                text={text}
              />
            </li>
          })
        }</ul>
      </ChartUI.TooltipWrapper>
    </RawIntlProvider>
  )
}

export function VerticalStackedBarChart<TChartData extends VerticalStackedBarChartData[]>
({
  data,
  categories,
  dataFormatter,
  yAxisLabelFormatter,
  ...props
}: VerticalStackedBarChartProps<TChartData>) {
  const eChartsRef = useRef<ReactECharts>(null)
  const option: EChartsOption = {
    grid: {
      top: 5,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true
    },
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      formatter: tooltipFormatter(dataFormatter)
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'category',
      data: categories,
      axisLabel: { ...axisLabelOptions(), interval: 0 },
      axisPointer: { type: 'none' }
    },
    yAxis: {
      ...yAxisOptions(),
      type: 'value',
      max: Math.max(...data.reduce((agg, set)=>
        agg.map((item, index)=> item + set.data[index]),
      new Array(categories.length).fill(0))),
      axisLabel: {
        ...axisLabelOptions(),
        formatter: yAxisLabelFormatter ? yAxisLabelFormatter : (value: number) => `${value}`
      },
      splitLine: { show: false }
    },
    series: data.map(sets=>({
      ...sets,
      type: 'bar',
      stack: 'summary',
      cursor: 'auto',
      barCategoryGap: '0%',
      itemStyle: {
        borderWidth: 2,
        borderColor: 'transparent'
      }
    }))
  }

  return (
    <ReactECharts
      ref={eChartsRef}
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
