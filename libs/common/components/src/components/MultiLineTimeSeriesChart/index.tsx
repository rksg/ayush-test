import {
  RefObject,
  RefCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback
} from 'react'

import ReactECharts from 'echarts-for-react'
import { isEmpty }  from 'lodash'
import { useIntl }  from 'react-intl'

import type { TimeSeriesChartData } from '@acx-ui/analytics/utils'
import type { TimeStampRange }      from '@acx-ui/types'
import { formatter }                from '@acx-ui/utils'

import { cssStr }       from '../../theme/helper'
import {
  gridOptions,
  legendOptions,
  legendTextStyleOptions,
  xAxisOptions,
  yAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  tooltipOptions,
  timeSeriesTooltipFormatter,
  getTimeSeriesSymbol
} from '../Chart/helper'
import { useDataZoom } from '../Chart/useDataZoom'

import * as UI from './styledComponents'

import type { ECharts, EChartsOption, MarkAreaComponentOption } from 'echarts'
import type { EChartsReactProps }                               from 'echarts-for-react'

type OnBrushendEvent = { areas: { coordRange: TimeStampRange }[] }

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

export interface MultiLineTimeSeriesChartProps <
  TChartData extends TimeSeriesChartData,
  MarkerData
>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[],
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: ReturnType<typeof formatter>
    seriesFormatters?: Record<string, ReturnType<typeof formatter>>
    yAxisProps?: {
      max?: number
      min?: number
      minInterval?: number
    }
    disableLegend?: boolean
    chartRef?: RefCallback<ReactECharts>
    onDataZoom?: (range: TimeStampRange) => void
    brush?: TimeStampRange
    onBrushChange?: (range: TimeStampRange) => void
    markers?: Marker<MarkerData>[]
    onMarkedAreaClick?: (data: MarkerData) => void
  }

export function useBrush<TChartData extends TimeSeriesChartData> (
  eChartsRef: RefObject<ReactECharts>,
  data: TChartData[],
  brush?: TimeStampRange,
  onBrushChange?: (range: TimeStampRange) => void
): (params: OnBrushendEvent) => void {
  useEffect(() => {
    if (!eChartsRef?.current || isEmpty(brush)) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'brush',
      areas: [{ brushType: 'lineX', coordRange: brush, xAxisIndex: 0 }]
    })
  }, [eChartsRef, brush, data])

  const onBrushendCallback = useCallback((event: OnBrushendEvent) => {
    onBrushChange && onBrushChange(event.areas[0].coordRange)
  }, [onBrushChange])

  return onBrushendCallback
}

export function useOnMarkedAreaClick <MarkerData> (
  eChartsRef: RefObject<ReactECharts>,
  onMarkedAreaClick?: (data: MarkerData) => void
) {
  useEffect(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.on('click', 'series.line', function (params) {
      const markedAreaProps = (params.data as unknown as { data: MarkerData }).data
      onMarkedAreaClick?.(markedAreaProps)
    })
  }, [eChartsRef, onMarkedAreaClick])
}

export function MultiLineTimeSeriesChart <
  TChartData extends TimeSeriesChartData,
  MarkerData
>
({
  data,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  seriesFormatters,
  yAxisProps,
  disableLegend,
  onMarkedAreaClick,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData, MarkerData>) {
  const eChartsRef = useRef<ReactECharts>(null)
  useImperativeHandle(props.chartRef, () => eChartsRef.current!)

  const { $t } = useIntl()

  const zoomEnabled = !Boolean(props.brush)
  const [canResetZoom, onDatazoomCallback, resetZoomCallback] =
    useDataZoom<TChartData>(eChartsRef, zoomEnabled, data, props.onDataZoom)
  const onBrushendCallback = useBrush(eChartsRef, data, props.brush, props.onBrushChange)
  useOnMarkedAreaClick(eChartsRef, onMarkedAreaClick)

  const option: EChartsOption = {
    color: props.lineColors || [
      cssStr('--acx-accents-blue-30'),
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-accents-orange-50'),
      cssStr('--acx-semantics-yellow-40')
    ],
    grid: { ...gridOptions() },
    ...(disableLegend ? {} : {
      legend: {
        ...legendOptions(),
        textStyle: legendTextStyleOptions(),
        data: data.map(datum => datum[legendProp]) as unknown as string[]
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
      ...yAxisProps,
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
      .map(datum => ({
        name: datum[legendProp] as unknown as string,
        data: datum.data,
        type: 'line',
        smooth: true,
        symbol: getTimeSeriesSymbol(data),
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
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
            brushStyle: { color: 'rgba(0, 0, 0, 0.05)' },
            icon: { back: 'path://', zoom: 'path://' }
          },
          brush: { type: ['rect'], icon: { rect: 'path://' } }
        }
      },
      dataZoom: [
        {
          id: 'zoom',
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
          borderColor: '#123456' // special color code to target path of brush
        }
      }
    })
  }

  return (
    <UI.Wrapper>
      <ReactECharts
        {...props}
        ref={eChartsRef}
        opts={{ renderer: 'svg' }}
        option={option}
        onEvents={zoomEnabled ? {
          datazoom: onDatazoomCallback
        } : {
          brushend: onBrushendCallback
        }}
      />
      {canResetZoom && <UI.ResetButton
        size='small'
        onClick={resetZoomCallback}
        children={$t({ defaultMessage: 'Reset Zoom' })}
      />}
    </UI.Wrapper>
  )
}
