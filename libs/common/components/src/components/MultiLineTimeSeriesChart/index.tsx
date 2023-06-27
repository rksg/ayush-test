import {
  RefObject,
  RefCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback
} from 'react'

import ReactECharts   from 'echarts-for-react'
import { GridOption } from 'echarts/types/dist/shared'
import { isEmpty }    from 'lodash'
import { useIntl }    from 'react-intl'

import type { TimeSeriesChartData }       from '@acx-ui/analytics/utils'
import { formatter }                      from '@acx-ui/formatter'
import type { TimeStamp, TimeStampRange } from '@acx-ui/types'

import {
  gridOptions,
  legendOptions,
  legendTextStyleOptions,
  dataZoomOptions,
  xAxisOptions,
  yAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  tooltipOptions,
  timeSeriesTooltipFormatter,
  handleSingleBinData,
  ChartFormatterFn,
  qualitativeColorSet,
  toolboxDataZoomOptions
}                       from '../Chart/helper'
import { ResetButton }            from '../Chart/styledComponents'
import { useDataZoom }            from '../Chart/useDataZoom'
import { useLegendSelectChanged } from '../Chart/useLegendSelectChanged'

import * as UI from './styledComponents'

import type { ECharts, EChartsOption, MarkAreaComponentOption, MarkLineComponentOption  } from 'echarts'
import type { EChartsReactProps }                                                         from 'echarts-for-react'


type OnBrushendEvent = { areas: { coordRange: TimeStampRange }[] }

type MarkAreaOption = Extract<
  Exclude<MarkAreaComponentOption['data'], undefined>[number],
  Array<unknown>
>[number]

type MarkLineOption = Extract<
  Exclude<MarkLineComponentOption['data'], undefined>[number],
  Array<unknown>
>[number]

type Marker <MarkerData> = {
  startTime: Exclude<MarkAreaOption['xAxis'], undefined>
  endTime: Exclude<MarkAreaOption['xAxis'], undefined>
  data: MarkerData
  itemStyle?: MarkAreaOption['itemStyle']
}

type MarkerArea = {
  itemStyle?: MarkAreaOption['itemStyle'],
  start: number,
  end?: number
}

type MarkerLine = {
  threshold: number,
  label?: MarkLineOption['label'],
  lineStyle?: MarkLineOption['lineStyle']
}

export interface MultiLineTimeSeriesChartProps <
  TChartData extends TimeSeriesChartData,
  MarkerData
>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    legendProp?: keyof TChartData /** @default 'name' */
    legendFormatter?: string | ((name: string) => string)
    lineColors?: string[]
    dataFormatter?: ChartFormatterFn
    seriesFormatters?: Record<string, ChartFormatterFn>
    yAxisProps?: {
      max?: number
      min?: number
    }
    disableLegend?: boolean
    chartRef?: RefCallback<ReactECharts>
    zoom?: TimeStampRange
    onDataZoom?: (range: TimeStampRange, isReset: boolean) => void
    brush?: TimeStampRange
    onBrushChange?: (range: TimeStampRange) => void
    markers?: Marker<MarkerData>[]
    markerAreas?: MarkerArea[]
    markerLines?: MarkerLine[]
    onMarkAreaClick?: (data: MarkerData) => void
    grid?: GridOption,
    echartOptions?: EChartsOption
  }

export function useBrush (
  eChartsRef: RefObject<ReactECharts>,
  brush?: TimeStampRange,
  onBrushChange?: (range: TimeStampRange) => void
) {
  const copiedRef = eChartsRef.current
  const onBrushendCallback = useCallback((e: unknown) => {
    const event = e as unknown as OnBrushendEvent
    onBrushChange && onBrushChange(event.areas[0].coordRange)
  }, [onBrushChange])

  useEffect(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.on('brushend', onBrushendCallback)
    return () => {
      copiedRef && copiedRef.forceUpdate()
    }
  }, [copiedRef, eChartsRef, onBrushendCallback])

  useEffect(() => {
    if (!eChartsRef?.current || isEmpty(brush)) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'brush',
      areas: [{ brushType: 'lineX', coordRange: brush, xAxisIndex: 0 }]
    })
    echartInstance.getZr().on('mousemove', function (event) {
      if (event.target?.type === 'ec-polyline') {
        echartInstance.getZr().setCursorStyle('default')
      }
    })

    return () => {
      copiedRef && copiedRef.forceUpdate()
    }
  }, [brush, copiedRef, eChartsRef])
}

export function useOnMarkAreaClick <MarkerData> (
  eChartsRef: RefObject<ReactECharts>,
  markers?: Marker<MarkerData>[],
  onMarkAreaClick?: (data: MarkerData) => void
) {
  useEffect(() => {
    if (!eChartsRef?.current || isEmpty(markers)) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.on('mousemove', 'series.line', function () {
      echartInstance.getZr().setCursorStyle('pointer')
    })
    echartInstance.on('click', 'series.line', function (event) {
      const markAreaProps = (event.data as unknown as { data: MarkerData }).data
      onMarkAreaClick?.(markAreaProps)
    })
  }, [eChartsRef, markers, onMarkAreaClick])
}

export function MultiLineTimeSeriesChart <
  TChartData extends TimeSeriesChartData,
  MarkerData
>
({
  data,
  legendProp = 'name' as keyof TChartData,
  legendFormatter,
  dataFormatter = formatter('countFormat'),
  seriesFormatters,
  yAxisProps,
  disableLegend,
  onMarkAreaClick,
  grid: gridProps,
  echartOptions,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData, MarkerData>) {
  const eChartsRef = useRef<ReactECharts>(null)
  useImperativeHandle(props.chartRef, () => eChartsRef.current!)

  const { $t } = useIntl()

  disableLegend = Boolean(disableLegend)
  const zoomEnabled = !Boolean(props.brush)
  const [canResetZoom, resetZoomCallback] =
    useDataZoom<TChartData>(eChartsRef, zoomEnabled, data, props.zoom, props.onDataZoom)
  useBrush(eChartsRef, props.brush, props.onBrushChange)
  useOnMarkAreaClick(eChartsRef, props.markers, onMarkAreaClick)
  useLegendSelectChanged(eChartsRef)

  const defaultOption: EChartsOption = {
    animation: false,
    color: props.lineColors || qualitativeColorSet(),
    grid: { ...gridOptions({ disableLegend, rightGridOffset: 5 }), ...gridProps },
    ...(disableLegend ? {} : {
      legend: {
        ...legendOptions(),
        textStyle: legendTextStyleOptions(),
        formatter: legendFormatter || '{name}' ,
        data: data
          .filter(datum=> datum.show !== false )
          .map(datum => datum[legendProp]) as unknown as string[]
      }
    }),
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      formatter: timeSeriesTooltipFormatter(
        data,
        { ...seriesFormatters, default: dataFormatter }
      )
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
      ...(yAxisProps || { minInterval: 1 }),
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: data
      .filter(datum=> datum.show !== false )
      .map((datum, i) => ({
        name: datum[legendProp] as unknown as string,
        data: handleSingleBinData(datum.data) as [TimeStamp, number][],
        type: 'line',
        smooth: true,
        symbol: 'none',
        z: 1,
        zlevel: 1,
        lineStyle: { width: 1.2 },
        ...(i === 0 ? {
          markArea: props.markers ? {
            data: props.markers?.map(marker => [
              { xAxis: marker.startTime,
                itemStyle: marker.itemStyle,
                data: marker.data },
              { xAxis: marker.endTime }
            ])
          } : props.markerAreas ? {
            data: props.markerAreas?.map(markerArea => [
              {
                yAxis: markerArea.start,
                itemStyle: markerArea.itemStyle
              },
              { ...(markerArea.end ? { yAxis: markerArea.end } : {}) }
            ])
          } : undefined
        } : {}),
        ...(i === 0 ? {
          markLine: props.markerLines ? {
            symbol: 'none',
            animation: false,
            emphasis: {
              disabled: true
            },
            label: {
              show: false
            },
            data: props.markerLines?.map(line => (
              { yAxis: line.threshold,
                lineStyle: line.lineStyle }
            ))
          } : undefined
        } : {})
      })),
    ...(zoomEnabled ? {
      toolbox: toolboxDataZoomOptions,
      dataZoom: dataZoomOptions(data)
    } : {
      toolbox: { show: false },
      brush: {
        xAxisIndex: 'all',
        brushStyle: {
          borderWidth: 4,
          color: 'rgba(0, 0, 0, 0.05)',
          borderColor: '#123456' // special color code to target path of brush
        }
      }
    })
  }
  const option = echartOptions ? { ...defaultOption, ...echartOptions } : defaultOption
  return (
    <UI.Wrapper>
      <ReactECharts
        {...props}
        ref={eChartsRef}
        opts={{ renderer: 'svg' }}
        option={option}
      />
      {canResetZoom && <ResetButton
        size='small'
        onClick={resetZoomCallback}
        children={$t({ defaultMessage: 'Reset Zoom' })}
        $disableLegend={disableLegend}
      />}
    </UI.Wrapper>
  )
}
