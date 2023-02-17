import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
  RefCallback,
  useImperativeHandle
} from 'react'


import ReactECharts        from 'echarts-for-react'
import {
  CustomSeriesRenderItem
} from 'echarts/types/dist/shared'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { categoryCodeMap, IncidentCode } from '@acx-ui/analytics/utils'
import {
  xAxisOptions,
  ResetButton,
  axisLabelOptions,
  dateAxisFormatter,
  cssStr,
  cssNumber
} from '@acx-ui/components'
import type { TimeStampRange } from '@acx-ui/types'

import {
  eventColorByCategory,
  LabelledQuality,
  connectionQualityLabels,
  IncidentDetails,
  Event,
  RoamingTimeSeriesData,
  EVENTS,
  QUALITY,
  ROAMING,
  INCIDENTS,
  ALL
} from './config'
import { getQualityColor, useLabelFormatter } from './util'

import type {
  ECharts,
  EChartsOption,
  SeriesOption,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  TooltipComponentOption
} from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

type OnDatazoomEvent = {
  batch?: {
    startValue: number;
    endValue: number;
  }[];
  start?: number;
  end?: number;
}

export interface TimelineChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: (Event | LabelledQuality | IncidentDetails | RoamingTimeSeriesData)[]; // https://github.com/microsoft/TypeScript/issues/44373
  chartBoundary: number[];
  selectedData?: number;
  onDotClick?: (params: unknown) => void;
  chartRef?: RefCallback<ReactECharts>;
  hasXaxisLabel?: boolean;
  tooltipFormatter: CallableFunction;
  mapping: { key: string; label: string; chartType: string; series: string }[];
  showResetZoom?: boolean;
  index?: React.Attributes['key'];
}

export const getSeriesData = (
  data: (Event | LabelledQuality | IncidentDetails | RoamingTimeSeriesData)[],
  key: string,
  series: string
) => {
  if (series === EVENTS)
    return data
      .filter((record) => record.seriesKey === key)
      .map((record) => [record.start, record.seriesKey, record])
  if (series === QUALITY)
    return data.map((record) => [
      record.start,
      key,
      moment(record.end).valueOf(),
      { ...record, icon: '' }
    ])
  if (series === INCIDENTS) {
    if (key === ALL)
      return data.map((record) => [
        record.start,
        key,
        moment(record.end).valueOf(),
        { ...record, icon: '' }
      ])
    return data
      .filter((record) =>
        categoryCodeMap[key as keyof typeof categoryCodeMap]?.codes.includes(
          (record as IncidentDetails)?.code as IncidentCode
        )
      )
      .map((record) => [record.start, key, moment(record.end).valueOf(), { ...record, icon: '' }])
  }
  if (series === ROAMING) {
    if (key === ALL) {
      return (data as unknown as { [key: string]: RoamingTimeSeriesData[] })[key]
        .map((record) => [record.start, key, record])
    }
    return (data as unknown as { [key: string]: { events: RoamingTimeSeriesData[] } })[
      key
    ]?.events.map((record: RoamingTimeSeriesData) => [
      moment(record.start).valueOf(),
      key,
      moment(record.end).valueOf(),
      record
    ])
  }
  return []
}

export function getSeriesItemColor (params: { data: (Event | LabelledQuality)[] }) {
  const obj = Array.isArray(params.data) ? params.data[2] : ''
  const { category } = obj as Event
  return obj
    ? cssStr(eventColorByCategory[category as keyof typeof eventColorByCategory])
    : cssStr('--acx-neutrals-50')
}
export function getBarColor (params: {
  data: (LabelledQuality | IncidentDetails | RoamingTimeSeriesData)[];
  seriesName: string;
}) {
  const seriesName = params.seriesName
  if (seriesName === QUALITY) {
    const obj = Array.isArray(params.data) ? params.data[3] : ''
    const key = params?.data?.[1] as unknown as string
    return cssStr(
      getQualityColor(
        (obj as LabelledQuality)[key as keyof typeof connectionQualityLabels]?.quality
      ) as string
    )
  }
  if (seriesName === INCIDENTS) {
    const obj = Array.isArray(params.data) ? params.data[3] : ''
    return cssStr((obj as IncidentDetails).color as string)
  }
  if (seriesName === ROAMING) {
    const obj = Array.isArray(params.data) ? params.data[3] : ''
    return (obj as RoamingTimeSeriesData)?.color
  }
  return ''
}
export const useDotClick = (
  eChartsRef: RefObject<ReactECharts>,
  onDotClick: ((param: unknown) => void) | undefined,
  setSelected: Dispatch<SetStateAction<number | undefined>>
) => {
  const handler = useCallback(
    function (params: { componentSubType: string; data: unknown }) {
      if (params.componentSubType !== 'scatter') return
      const data = params.data as [number, string, Event]
      setSelected(data[2] as unknown as number)
      onDotClick && onDotClick(data[2])
    },
    [setSelected, onDotClick]
  )
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('click', handler)
    return () => {
      if (echartInstance && echartInstance.isDisposed && echartInstance.isDisposed()) {
        echartInstance.off('click', handler)
        echartInstance.dispose()
      }
    }
  }, [eChartsRef, handler])
}
export const renderCustomItem = (
  params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI
) => {
  const yValue = api?.value?.(1)
  const start = api?.coord?.([api?.value?.(0), yValue])
  const end = api?.coord?.([api?.value?.(2), yValue])
  const height = (api?.size as CallableFunction)?.([0, 1])?.[1] * 0.8
  return {
    type: 'rect',
    shape: {
      x: start?.[0],
      y: start?.[1] - 9,
      width: end?.[0] - start?.[0],
      height: height
    },
    style: api?.style?.()
  }
}
export const useDataZoom = (
  eChartsRef: RefObject<ReactECharts>,
  zoomEnabled: boolean,
  onDataZoom?: (range: TimeStampRange, isReset: boolean) => void
): [boolean, () => void] => {
  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)

  const onDatazoomCallback = useCallback(
    (e: unknown) => {
      const event = e as unknown as OnDatazoomEvent
      const firstBatch = event.batch?.[0]
      firstBatch && onDataZoom && onDataZoom([firstBatch.startValue, firstBatch.endValue], false)
      if (event.start === 0 && event.end === 100) {
        setCanResetZoom(false)
      } else {
        setCanResetZoom(true)
      }
    },
    [onDataZoom]
  )
  useEffect(() => {
    if (!eChartsRef?.current || !zoomEnabled) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
    echartInstance.on('datazoom', onDatazoomCallback)
  })

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
  }, [eChartsRef])

  return [canResetZoom, resetZoomCallback]
}
const tooltipOptions = () =>
  ({
    textStyle: {
      color: cssStr('--acx-primary-black'),
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-body-5-font-size'),
      lineHeight: cssNumber('--acx-body-5-line-height'),
      fontWeight: cssNumber('--acx-body-font-weight')
    },
    borderRadius: 2,
    borderWidth: 0,
    padding: 8,
    confine: true,
    border: 'none',
    backgroundColor: 'transparent',
    extraCssText: 'box-shadow: 0px 0px 0px rgba(51, 51, 51, 0.08); z-index: 0;'
  } as TooltipComponentOption)

export function TimelineChart ({
  data,
  chartBoundary,
  selectedData,
  onDotClick,
  chartRef,
  tooltipFormatter,
  mapping,
  hasXaxisLabel,
  showResetZoom,
  index,
  ...props
}: TimelineChartProps) {
  const { $t } = useIntl()
  useImperativeHandle(chartRef, () => eChartsRef.current!)
  const chartPadding = 10
  const rowHeight = 22
  const placeholderRows = 2
  const legendWidth = 85
  const xAxisHeight = hasXaxisLabel ? 30 : 0

  const eChartsRef = useRef<ReactECharts>(null)
  const [canResetZoom, resetZoomCallback] = useDataZoom(eChartsRef, true)
  // use selected event on dot click to show popover
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selected, setSelected] = useState<number | undefined>(selectedData)
  useDotClick(eChartsRef, onDotClick, setSelected)

  const seriesData = mapping
    .reverse()
    .slice()
    .map(({ key, series, chartType }) =>
      chartType === 'scatter'
        ? ({
          type: chartType,
          name: series,
          symbol: 'circle',
          symbolSize: 8,
          animation: false,
          data: getSeriesData(data, key, series),
          itemStyle: {
            color: getSeriesItemColor
          },
          connectNulls: true
        } as SeriesOption)
        : {
          type: 'custom',
          name: series,
          renderItem: renderCustomItem as unknown as CustomSeriesRenderItem,
          itemStyle: {
            color: getBarColor as unknown as string
          },
          data: getSeriesData(data, key, series),
          connectNulls: true
        }
    ) as SeriesOption[]

  const option: EChartsOption = {
    animation: false,
    grid: {
      top: 0,
      bottom: 0,
      left: chartPadding,
      right: 0,
      width: props.style?.width,
      height: (mapping.length + placeholderRows) * rowHeight
    },
    tooltip: {
      trigger: 'axis',
      zlevel: 10,
      triggerOn: 'mousemove',
      show: seriesData.length > 0,
      axisPointer: {
        axis: 'x',
        status: seriesData.length > 0 ? 'show' : 'hide',
        snap: false,
        animation: false,
        lineStyle: {
          color: cssStr('--acx-neutrals-70'),
          type: 'solid',
          width: 1
        }
      },
      // use this formatter to add popover content
      formatter: /* istanbul ignore next */ () => '',
      ...tooltipOptions(),
      // Need to address test coverage for the postion
      position: /* istanbul ignore next */ (point) => [point[0] + 10, mapping.length * 25]
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      boundaryGap: false,
      ...(hasXaxisLabel
        ? {
          axisLabel: {
            ...axisLabelOptions(),
            formatter: dateAxisFormatter()
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: cssStr('--acx-neutrals-30'),
              type: 'solid'
            }
          }
        }
        : {
          axisLabel: {
            show: false
          }
        }),
      min: chartBoundary[0],
      max: chartBoundary[1],
      splitLine: {
        show: false,
        lineStyle: { color: cssStr('--acx-neutrals-20') }
      },
      axisPointer: {
        show: true,
        snap: false,
        triggerTooltip: false,
        label: {
          ...tooltipOptions() as Object,
          show: true,
          formatter: useLabelFormatter as unknown as string,
          margin: -35
        },
        type: 'line',
        lineStyle: {
          type: 'solid',
          width: 1,
          color: cssStr('--acx-primary-black')
        }
      }
    },
    yAxis: {
      type: 'category',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitArea: {
        show: true,
        areaStyle: {
          color: [
            ...Array(placeholderRows)
              .fill(0)
              .map(() => cssStr('--acx-primary-white')),
            ...mapping.map(() => cssStr('--acx-neutrals-10'))
          ]
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [cssStr('--acx-primary-white')],
          width: 4
        }
      },
      data: [
        ...Array(placeholderRows)
          .fill(0)
          .map((_, index) => `placeholder${index}`),
        ...mapping.map(({ key }) => key)
      ]
    },
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
        zoomLock: true,
        minValueSpan: 60,
        start: 0,
        end: 100
      }
    ],
    series: seriesData
  }
  return (
    <>
      <ReactECharts
        {...{
          ...props,
          style: {
            ...props.style,
            WebkitUserSelect: 'none',
            marginBottom: 0,
            width: (props.style?.width as number) + legendWidth,
            height: (mapping.length + placeholderRows) * rowHeight + xAxisHeight
          }
        }}
        ref={eChartsRef}
        option={option}
        key={index}
      />
      {canResetZoom && showResetZoom && (
        <ResetButton
          size='small'
          onClick={resetZoomCallback}
          children={$t({ defaultMessage: 'Reset Zoom' })}
          $disableLegend={true}
          style={{ top: -24, right: 8 }}
        />
      )}
    </>
  )
}
