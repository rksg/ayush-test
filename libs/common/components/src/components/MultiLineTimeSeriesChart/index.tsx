import { forwardRef, RefObject, useEffect, useImperativeHandle, useRef } from 'react'

import ReactECharts from 'echarts-for-react'
import { isEmpty }  from 'lodash'
import styled       from 'styled-components/macro'

import type { MultiLineTimeSeriesChartData } from '@acx-ui/analytics/utils'
import type { TimeStamp }                    from '@acx-ui/types'

import { cssStr }              from '../../theme/helper'
import {
  gridOptions,
  legendOptions,
  legendTextStyleOptions,
  xAxisOptions,
  yAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  tooltipOptions,
  timeSeriesTooltipFormatter
} from '../Chart/helper'

import type { ECharts, EChartsOption } from 'echarts'
import type { EChartsReactProps }      from 'echarts-for-react'

const Chart = styled(ReactECharts)`
  svg path[stroke="#123456"] {
    stroke-dasharray: 2;
    stroke: var(--acx-accents-blue-50);
    clip-path: inset(0 round 5px);
  }`

interface MultiLineTimeSeriesChartProps
  <TChartData extends MultiLineTimeSeriesChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: (value: unknown) => string | null,
    brush?: [TimeStamp, TimeStamp]
    onBrushChange?: (range: TimeStamp[]) => void
  }

export const useBrush = (
  eChartsRef: RefObject<ReactECharts>,
  brush?: [TimeStamp, TimeStamp] 
) => {
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current || isEmpty(brush)) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'brush',
      areas: [{
        brushType: 'lineX',
        coordRange: brush,
        xAxisIndex: 0
      }]
    })
  }, [eChartsRef, brush])
}

export const useOnBrushChange = (
  onBrushChange?: (range: TimeStamp[]) => void
) => {
  return (params: { 
    areas: { coordRange: [TimeStamp, TimeStamp] }[]
  }) => {
    if (
      isEmpty(params) ||
      isEmpty(params.areas) ||
      isEmpty(params.areas[0]) ||
      isEmpty(params.areas[0].coordRange) 
    )
    {
      return
    }
    onBrushChange && onBrushChange(params.areas[0].coordRange)
  }
}

export const MultiLineTimeSeriesChart = forwardRef<
  ReactECharts,
  MultiLineTimeSeriesChartProps<MultiLineTimeSeriesChartData> & {
    data: MultiLineTimeSeriesChartData[]
  }
>
((props, ref) => {
  const {
    data,
    legendProp = 'name' as keyof MultiLineTimeSeriesChartData,
    dataFormatter,
    ...rest
  } = props

  const eChartsRef = useRef<ReactECharts | null>(null)
  useImperativeHandle(ref, () => eChartsRef.current!)
  useBrush(eChartsRef, props.brush)

  const option: EChartsOption = {
    color: props.lineColors || [
      cssStr('--acx-accents-blue-30'),
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-accents-orange-50'),
      cssStr('--acx-semantics-yellow-40')
    ],
    grid: { ...gridOptions() },
    legend: {
      ...legendOptions(),
      textStyle: legendTextStyleOptions(),
      data: data.map(datum => datum[legendProp]) as unknown as string[]
    },
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      formatter: timeSeriesTooltipFormatter(dataFormatter)
    },
    toolbox: { show: false },
    brush: {
      xAxisIndex: 'all',
      brushStyle: {
        borderWidth: 4,
        color: 'rgba(0, 0, 0, 0.05)',
        borderColor: '#123456' // special color code to identify path of brush
      }
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter
      }
    },
    yAxis: {
      ...yAxisOptions(),
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: data.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data,
      type: 'line',
      silent: true,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1 }
    }))
  }

  return (
    <Chart
      {...rest}
      ref={eChartsRef}
      opts={{ renderer: 'svg' }}
      option={option}
      onEvents={{ brushEnd: useOnBrushChange(props.onBrushChange) }}/>
  )
})
