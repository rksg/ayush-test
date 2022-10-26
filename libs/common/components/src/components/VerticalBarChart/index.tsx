import { useRef, useEffect,   RefObject } from 'react'

import ReactECharts       from 'echarts-for-react'
import { GridOption }     from 'echarts/types/dist/shared'
import { renderToString } from 'react-dom/server'

import type { BarChartData } from '@acx-ui/analytics/utils'
import { formatter }         from '@acx-ui/utils'

import { cssStr }    from '../../theme/helper'
import {
  gridOptions,
  tooltipOptions,
  axisLabelOptions,
  yAxisOptions,
  xAxisOptions,
  xAxisNameOptions
} from '../Chart/helper'
import { TooltipWrapper } from '../Chart/styledComponents'

import type { EChartsOption, TooltipComponentFormatterCallbackParams, ECharts  } from 'echarts'
import type { EChartsReactProps }                                                from 'echarts-for-react'


type BarData = [number, number]
export interface VerticalBarChartProps
  <TChartData extends BarChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: TChartData,
  barColors?: string[]
  barWidth?: number,
  yAxisOffset?: number,
  dataFormatter?: ReturnType<typeof formatter>
  yAxisProps?: {
    max?: number
    min?: number
  }
  xAxisName?: string
  xAxisOffset?: number
  showTooltipName?: Boolean
  grid?: GridOption
  onBarAreaClick?: (data: BarData) => void
}

export const tooltipFormatter = (
  dataFormatter: ReturnType<typeof formatter>,
  showTooltipName: Boolean
) => {
  return (params: TooltipComponentFormatterCallbackParams) => {
    const value = Array.isArray(params)
      && Array.isArray(params[0].data) && params[0].data[1]
    const name = Array.isArray(params)
      && Array.isArray(params[0].data) && params[0].dimensionNames?.[1]
    return renderToString(
      <TooltipWrapper>
        {showTooltipName
          ? `${(name as string)?.charAt(0).toUpperCase() + (name as string)?.slice(1)}:`
          : ''}{' '}
        <b>{dataFormatter(value)}</b>
      </TooltipWrapper>
    )
  }
}
export function useOnBarAreaClick <BarData> (
  eChartsRef: RefObject<ReactECharts>, onBarAreaClick?: (data: BarData) => void
) {
  useEffect(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.on('mousemove', 'series.bar', function () {
      echartInstance.getZr().setCursorStyle('pointer')
    })
    echartInstance.on('click','series.bar', function (event) {
      const barData = event?.data as unknown as BarData
      onBarAreaClick?.(barData)
    })
  }, [eChartsRef, onBarAreaClick])
}


export function VerticalBarChart<TChartData extends BarChartData>
({
  data,
  barColors = [cssStr('--acx-accents-blue-50')],
  barWidth = 20,
  dataFormatter = formatter('countFormat'),
  yAxisProps,
  xAxisName,
  xAxisOffset,
  yAxisOffset,
  showTooltipName = true,
  grid: gridProps,
  onBarAreaClick,
  ...props
}: VerticalBarChartProps<TChartData>) {

  const eChartsRef = useRef<ReactECharts>(null)
  useOnBarAreaClick(eChartsRef, onBarAreaClick)
  const option: EChartsOption = {
    grid: { ...gridOptions({
      disableLegend: true,
      hasXAxisName: Boolean(xAxisName),
      xAxisOffset,
      yAxisOffset
    }),
    ...gridProps },
    dataset: {
      dimensions: data.dimensions,
      source: data.source
    },
    barWidth,
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      formatter: tooltipFormatter(dataFormatter, showTooltipName)
    },
    xAxis: {
      ...xAxisOptions(),
      ...(xAxisName ? xAxisNameOptions(xAxisName) : {}),
      offset: xAxisOffset,
      axisPointer: { type: 'shadow' },
      type: 'category',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: (value: string) => value.trim()
      }
    },
    yAxis: {
      ...yAxisOptions(),
      ...(yAxisProps || { minInterval: 1 }),
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: data?.seriesEncode.map(encode => ({
      type: 'bar',
      silent: false,
      cursor: 'auto',
      colorBy: 'data',
      color: barColors,
      encode: encode
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
