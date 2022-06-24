import ReactECharts               from 'echarts-for-react'
import { TooltipComponentOption } from 'echarts/components'
import { renderToString }         from 'react-dom/server'

import { TimeStamp } from '@acx-ui/types'
import { formatter } from '@acx-ui/utils'

import { cssStr, cssNumber } from '../../theme/helper'

import * as UI from './styledComponents'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

type Unified<T> = Exclude<T, T[]>
type TooltipFormatterCallback = Exclude<TooltipComponentOption['formatter'], string|undefined>
export type TooltipFormatterParams = Unified<Parameters<TooltipFormatterCallback>[0]>

export interface MultiLineTimeSeriesChartData extends Object {
  /**
   * Multi dimensional array which first item is timestamp and 2nd item is value
   * @example
   * [
   *   [1603900800000, 64.12186646508322],
   *   [1603987200000, 76]
   * ]
   */
  data: [TimeStamp, number][]
}

export const toolTipFormatter = (
  dataFormatter?: ((value: unknown) => string | null)
) => (
  parameters: TooltipFormatterParams | TooltipFormatterParams[]
) => {
  const [ time ] = (Array.isArray(parameters)
    ? parameters[0].data : parameters.data) as [TimeStamp, number]
  return renderToString(
    <>
      <UI.TimeWrapper>{formatter('dateTimeFormat')(time)}</UI.TimeWrapper>
      <UI.ListWrapper>{
        (Array.isArray(parameters) ? parameters : [parameters])
          .map((parameter: TooltipFormatterParams, index: number)=> {
            const [, value] = parameter.data as [TimeStamp, number]
            return <UI.ListItem key={index}>
              <UI.Dot $color={`${parameter.color}`}/>
              {`${parameter.seriesName}: `}
              <UI.ValueWrapper children={`${dataFormatter ? dataFormatter(value) : value}`}/>
            </UI.ListItem>
          })
      }</UI.ListWrapper>
    </>
  )
}

export interface MultiLineTimeSeriesChartProps
  <TChartData extends MultiLineTimeSeriesChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: (value: unknown) => string | null
  }

export function MultiLineTimeSeriesChart
  <TChartData extends MultiLineTimeSeriesChartData = { name: string, data: [TimeStamp, number][] }>
({
  data,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData>) {
  const option: EChartsOption = {
    color: props.lineColors || [
      cssStr('--acx-primary-black'),
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-accents-orange-50'),
      cssStr('--acx-semantics-yellow-40')
    ],
    grid: {
      left: '0%',
      right: '2%',
      bottom: '0%',
      top: '15%',
      containLabel: true
    },
    legend: {
      data: data.map(datum => datum[legendProp]) as unknown as string[],
      icon: 'square',
      right: 15,
      itemWidth: 15,
      itemGap: 15,
      textStyle: {
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-body-5-font-size'),
        lineHeight: cssNumber('--acx-body-5-line-height'),
        fontWeight: 400
      }
    },
    tooltip: {
      trigger: 'axis',
      textStyle: {
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-body-5-font-size'),
        lineHeight: cssNumber('--acx-body-5-line-height'),
        fontWeight: 400
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 2,
      padding: 8,
      extraCssText: `box-shadow: 0px 4px 8px ${cssStr('--acx-primary-black')}26;`,
      formatter: toolTipFormatter(dataFormatter)
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: {
          color: 'transparent'
        }
      },
      axisLabel: {
        color: cssStr('--acx-neutrals-50'),
        formatter: {
          // TODO:
          // handle smaller and larger time range
          month: '{label|{MMM}}', // Jan, Feb, ...
          day: '{label|{d}}' // 1, 2, ...
        },
        rich: {
          label: {
            fontFamily: cssStr('--acx-neutral-brand-font'),
            fontSize: cssNumber('--acx-body-5-font-size'),
            fontWeight: 400
          }
        }
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          type: 'solid',
          width: 1,
          color: cssStr('--acx-primary-black')
        }
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '10%'],
      axisLabel: {
        color: cssStr('--acx-neutrals-50'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-body-5-font-size'),
        fontWeight: 400,
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: data.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1 }
    }))
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option} />
  )
}
