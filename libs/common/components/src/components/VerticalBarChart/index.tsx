import { useRef, useEffect, RefObject } from 'react'

import ReactECharts           from 'echarts-for-react'
import { GridOption }         from 'echarts/types/dist/shared'
import { renderToString }     from 'react-dom/server'
import { IntlShape, useIntl } from 'react-intl'

import type { BarChartData } from '@acx-ui/analytics/utils'
import { formatter }         from '@acx-ui/formatter'

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
  xAxisValues?: string[] | number[]
  xAxisName?: string
  xAxisOffset?: number
  showTooltipName?: Boolean
  showNameAndValue?: string[]
  grid?: GridOption
  showXaxisLabel?: boolean
  onBarAreaClick?: (data: BarData) => void
}

export const tooltipFormatter = (
  dataFormatter: ReturnType<typeof formatter>,
  showTooltipName: Boolean,
  showNameAndValue: string[],
  $t: IntlShape['formatMessage']
) => {
  return (params: TooltipComponentFormatterCallbackParams) => {
    const yValue = Array.isArray(params)
      && Array.isArray(params[0].data) && params[0].data[1]
    const xValue = Array.isArray(params)
      && Array.isArray(params[0].data) && params[0].data[0]
    const name = Array.isArray(params)
      && Array.isArray(params[0].data) && params[0].dimensionNames?.[1]

    const [xAxisLabel = '', yAxisLabel = ''] = showNameAndValue

    const yAxisText =
      yAxisLabel &&
      $t(
        {
          defaultMessage: `{count, plural,
            one {{single}}
            other {{plural}}
          }`
        },
        {
          count: yValue,
          single: yAxisLabel,
          plural: `${yAxisLabel}s`
        }
      )

    return renderToString(
      <TooltipWrapper>
        {showNameAndValue.length > 0 ? (
          <>
            {xAxisLabel} <b>{dataFormatter(xValue)}</b>: <b>{dataFormatter(yValue)}</b>{' '}
            {yAxisText}
          </>
        ) : (
          <>
            {showTooltipName && name
              ? `${name.charAt(0).toUpperCase() + name.slice(1)}: `
              : ''}
            <b>{dataFormatter(yValue)}</b>
          </>
        )}
      </TooltipWrapper>
    )
  }
}

export function useOnBarAreaClick <BarData> (
  eChartsRef: RefObject<ReactECharts>, onBarAreaClick?: (data: BarData) => void
) {
  useEffect(() => {
    if (!eChartsRef?.current || !onBarAreaClick) return
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
  barColors = [cssStr('--acx-viz-qualitative-1')],
  barWidth = 20,
  dataFormatter = formatter('countFormat'),
  yAxisProps,
  xAxisValues,
  xAxisName,
  xAxisOffset,
  yAxisOffset,
  showTooltipName = true,
  showNameAndValue = [],
  grid: gridProps,
  showXaxisLabel = true,
  onBarAreaClick,
  ...props
}: VerticalBarChartProps<TChartData>) {
  const { $t } = useIntl()
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
      formatter: tooltipFormatter(dataFormatter, showTooltipName, showNameAndValue, $t)
    },
    xAxis: {
      ...xAxisOptions(),
      ...(xAxisName ? xAxisNameOptions(xAxisName) : {}),
      offset: xAxisOffset,
      axisPointer: { type: 'shadow' },
      type: 'category',
      data: xAxisValues,
      axisLabel: {
        ...axisLabelOptions(),
        formatter: (value: string) => value.trim(),
        show: showXaxisLabel
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
