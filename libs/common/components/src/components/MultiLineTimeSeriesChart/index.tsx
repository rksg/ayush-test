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
import _, { isEmpty } from 'lodash'
import { useIntl }    from 'react-intl'

import type { TimeSeriesChartData, YAxisData } from '@acx-ui/analytics/utils'
import { formatter }                           from '@acx-ui/formatter'
import type { TimeStamp, TimeStampRange }      from '@acx-ui/types'

import { cssNumber, cssStr } from '../../theme/helper'
import {
  gridOptions,
  legendOptions,
  legendTextStyleOptions,
  dataZoomOptions,
  xAxisOptions,
  yAxisOptions,
  yAxisNameOptions,
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

import type { ECharts,
  EChartsOption,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  LineSeriesOption,
  YAXisComponentOption
} from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

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

type TimeMarker = {
  timestamp: TimeStamp
  label: string
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
    lineStyles?: (undefined | LineSeriesOption['lineStyle'])[]
    dataFormatter?: ChartFormatterFn
    seriesFormatters?: Record<string, ChartFormatterFn>
    yAxisProps?: {
      max?: number
      min?: number
    }
    yAxisConfig?: YAxisData[]
    seriesYAxisIndexes?: number[]
    seriesChartTypes?: string[]
    disableLegend?: boolean
    chartRef?: RefCallback<ReactECharts>
    zoom?: TimeStampRange
    onDataZoom?: (range: TimeStampRange, isReset: boolean) => void
    brush?: TimeStampRange
    onBrushChange?: (range: TimeStampRange) => void
    markers?: Marker<MarkerData>[]
    timeMarkers?: TimeMarker[]
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

export function useTimeMarkers (
  eChartsRef: RefObject<ReactECharts>,
  timeMarkers?: TimeMarker[]
) {
  useEffect(() => {
    if (!eChartsRef?.current || !timeMarkers?.length) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    const [charSize, gap, joinGap] = [5.05, 10, 10]

    let data = { lines: [], labels: [] } as {
      lines: number[][]
      labels: Array<{ coords: number[][], strings: string[] }>
    }
    data = timeMarkers
      .map(({ timestamp, label }) => ({ timestamp: new Date(timestamp), label }))
      .sort((a, b) => +a.timestamp - +b.timestamp)
      .reduce((data, { timestamp, label }) => {
        const coord = echartInstance.convertToPixel('grid', [+timestamp, 0])
        const prev = data.labels.at(-1)
        const isLabelOverlap = prev && (
          prev.coords[0][0] +
          prev.strings.reduce((sum, s) => sum + s.length, 0) * charSize +
          (prev.strings.length - 1) * joinGap > coord[0])

        if (isLabelOverlap) {
          prev.coords.push(coord)
          prev.strings.push(label)
        } else data.labels.push({ coords: [coord], strings: [label] })

        data.lines.push(coord)

        return data
      }, data)
    const lines = data.lines.map((coord) => ({
      type: 'line',
      silent: true,
      z: 100,
      shape: {
        x1: coord[0], y1: coord[1],
        x2: coord[0], y2: 0
      }
    }))
    const labels = data.labels.flatMap(({ coords, strings }) => {
      const labelWidth = strings.reduce((sum, s) => sum + s.length, 0) * charSize
        + (strings.length - 1) * joinGap
      const label = strings.join('\u00A0\u00A0\u00A0')
      const coord = coords.length > 1
        // get midpoint of first and last coords
        ? [(coords.at(0)![0] + coords.at(-1)![0]) / 2, coords.at(0)![1]]
        : coords.at(0)!
      return [{
        type: 'rect',
        silent: true,
        z: 100,
        shape: {
          x: coord[0] - labelWidth / 2 - gap / 2,
          y: coord[1] - cssNumber('--acx-body-5-font-size') - gap,
          width: labelWidth + gap,
          height: cssNumber('--acx-body-5-line-height')
        },
        style: {
          fill: cssStr('--acx-primary-white'),
          opacity: .9
        }
      }, {
        type: 'text',
        silent: true,
        z: 100,
        x: coord[0] - labelWidth / 2,
        y: coord[1] - gap * 2
          + (cssNumber('--acx-body-5-line-height') - cssNumber('--acx-body-5-font-size')) / 2,
        style: {
          text: label,
          font: `${cssStr('--acx-body-5-font-size')} ${cssStr('--acx-neutral-brand-font')}`
        }
      }]
    })

    echartInstance.setOption({ graphic: [...lines, ...labels] })
  }, [eChartsRef, timeMarkers])
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
  yAxisConfig,
  seriesYAxisIndexes,
  seriesChartTypes,
  yAxisProps,
  disableLegend,
  onMarkAreaClick,
  grid: gridProps,
  echartOptions,
  lineStyles = [],
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
  useTimeMarkers(eChartsRef, props.timeMarkers)

  const baseYaxisOptions = {
    ...yAxisOptions(),
    ...(yAxisProps || { minInterval: 1 }),
    type: 'value',
    axisLabel: {
      ...axisLabelOptions(),
      formatter: function (value: number) {
        return (dataFormatter && dataFormatter(value)) || `${value}`
      }
    }
  } as YAXisComponentOption

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
        formatter: dateAxisFormatter(),
        hideOverlap: true
      }
    },
    yAxis: yAxisConfig && yAxisConfig.length
      ? yAxisConfig.map(({
        axisName, color, nameRotate, showLabel
      }) => ({
        ...baseYaxisOptions,
        ...(showLabel
          ? { ...yAxisNameOptions(axisName, color), nameRotate }: {})
      }))
      : {
        ...baseYaxisOptions
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
        lineStyle: _.merge({ width: 1.2 }, lineStyles[i] ?? {}),
        yAxisIndex: seriesYAxisIndexes ? seriesYAxisIndexes[i] : 0,
        ...(seriesChartTypes && seriesChartTypes[i] === 'area'
          ? { areaStyle: { opacity: 0.2 }, lineStyle: { width: 1 } }
          : {}),
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
