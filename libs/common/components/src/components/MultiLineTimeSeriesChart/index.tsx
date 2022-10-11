import { RefObject, useEffect, useImperativeHandle, useRef } from 'react'

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

import type { ECharts, EChartsOption, MarkAreaComponentOption } from 'echarts'
import type { EChartsReactProps }                               from 'echarts-for-react'

const Chart = styled(ReactECharts)`
  svg path[stroke="#123456"] {
    stroke-dasharray: 2;
    stroke: var(--acx-accents-blue-50);
    clip-path: inset(0 round 5px);
  }`

type MarkAreaOption = Extract<
  Exclude<MarkAreaComponentOption['data'], undefined>[number],
  Array<unknown>
>[number]

type Marker <MarkerData> = {
  startTime: Exclude<MarkAreaOption['xAxis'], undefined>
  endTime: Exclude<MarkAreaOption['xAxis'], undefined>
  data: MarkerData
  itemStyle?: MarkAreaOption['itemStyle']
}

type LegendEventData = {
  type: string,
  name: string
  selected: {
      [name: string]: boolean
  }
}

export interface MultiLineTimeSeriesChartProps <
  TChartData extends MultiLineTimeSeriesChartData,
  MarkerData
>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[],
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: (value: unknown) => string | null,
    yAxisProps?: {
      max: number,
      min: number
    }
    disableLegend?: boolean,
    onMarkedAreaClick?: (data: MarkerData) => void,
    markers?: Marker<MarkerData>[]
    brush?: [TimeStamp, TimeStamp]
    onBrushChange?: (range: TimeStamp[]) => void
    chartRef?: RefObject<ReactECharts>
  }

export function useBrush<T> (
  eChartsRef: RefObject<ReactECharts>,
  brush?: [TimeStamp, TimeStamp],
  data?: T[]
) {
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
  }, [eChartsRef, brush, data])
}

export const useOnBrushChange = (
  onBrushChange?: (range: TimeStamp[]) => void
) => {
  return (params: { areas: { coordRange: [TimeStamp, TimeStamp] }[] }) => {
    onBrushChange && onBrushChange(params.areas[0].coordRange)
  }
}

export function useOnMarkedAreaClick <MarkerData> (
  eChartsRef: RefObject<ReactECharts>,
  onMarkedAreaClick?: (data: MarkerData) => void
) {
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('click', 'series.line', function (params) {
      const markedAreaProps = (params.data as unknown as { data: MarkerData }).data
      onMarkedAreaClick?.(markedAreaProps)
    })
  }, [eChartsRef, onMarkedAreaClick])
}

export function useLegendSelectChanged (
  eChartsRef: RefObject<ReactECharts>
) {
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('legendselectchanged', function (params: unknown) {
      const { selected } = params as unknown as LegendEventData
      const areFalsy = Object.values(selected).every(value => !value)
      if (areFalsy)
        echartInstance.dispatchAction({
          type: 'legendAllSelect'
        })
    })
  }, [eChartsRef])
}

export function MultiLineTimeSeriesChart <
  TChartData extends MultiLineTimeSeriesChartData,
  MarkerData
>
({
  data,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  yAxisProps,
  disableLegend,
  onMarkedAreaClick,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData, MarkerData>) {
  const zoomEnabled = !Boolean(props.brush)

  const eChartsRef = useRef<ReactECharts>(null)
  useImperativeHandle(props.chartRef, () => eChartsRef.current!)
  useBrush(eChartsRef, props.brush, data)
  useOnMarkedAreaClick(eChartsRef, onMarkedAreaClick)
  useLegendSelectChanged(eChartsRef)

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
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter()
      }
    },
    yAxis: {
      ...yAxisOptions(),
      ...yAxisProps,
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
      smooth: true,
      symbol: 'none',
      z: 1,
      zlevel: 1,
      lineStyle: { width: 1 },
      markArea: props.markers ? {
        data: props.markers?.map(marker => [
          { xAxis: marker.startTime, itemStyle: marker.itemStyle, data: marker.data },
          { xAxis: marker.endTime }
        ])
      } : undefined
    })),
    ...(zoomEnabled ? {
      toolbox: {
        top: '15%',
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
            brushStyle: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          brush: { type: ['rect'], icon: { rect: 'path://' } }
        }
      },
      dataZoom: [
        {
          type: 'inside',
          zoomLock: true
        }
      ]
    } : {
      toolbox: { show: false },
      brush: {
        xAxisIndex: 'all',
        brushStyle: {
          borderWidth: 4,
          color: 'rgba(0, 0, 0, 0.05)',
          borderColor: '#123456' // special color code to identify path of brush
        }
      }
    })
  }
  if (option && disableLegend === true) { delete(option.legend) }

  return (
    <Chart
      {...props}
      ref={eChartsRef}
      opts={{ renderer: 'svg' }}
      option={option}
      onEvents={{ brushend: useOnBrushChange(props.onBrushChange) }}
    />
  )
}
