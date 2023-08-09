import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  RefCallback,
  useImperativeHandle,
  useMemo,
  MutableRefObject
} from 'react'

import {
  ECharts,
  EChartsOption,
  SeriesOption,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  TooltipComponentOption,
  connect
} from 'echarts'
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
  cssNumber,
  toolboxDataZoomOptions
} from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import type { TimeStampRange }        from '@acx-ui/types'
import { hasAccess }                  from '@acx-ui/user'

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
import * as UI                             from './styledComponents'
import { getQualityColor, labelFormatter } from './util'


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
  sharedChartName: string;
  chartRef?: RefCallback<ReactECharts>;
  hasXaxisLabel?: boolean;
  mapping: { key: string; label: string; chartType: string; series: string }[];
  showResetZoom?: boolean;
  onClick?: Function
  index?: React.Attributes['key'];
  popoverRef?: RefObject<HTMLDivElement>;
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
  popoverRef: RefObject<HTMLDivElement> | undefined,
  navigate: CallableFunction,
  basePath: string
) => {
  const handler = useCallback(
    function (params: { componentSubType: string; data: unknown }) {
      const typedParams = (params as
        { componentSubType: string; data: unknown, seriesName: string })

      if (params.componentSubType === 'scatter') {
        const data = params.data as [number, string, Event]
        const { clientX, clientY } = (params as unknown as
          { event: { event: PointerEvent } }).event.event
        const popoverChild = popoverRef && popoverRef.current
        if (!popoverChild) return
        const { x, y, width } = popoverChild.getBoundingClientRect()
        const calcX = clientX - (x + width / 2)
        const calcY = clientY - y
        onDotClick && onDotClick(({
          ...data[2],
          x: -calcX,
          y: -calcY
        }))
      }

      if (hasAccess() &&
        params.componentSubType === 'custom' &&
        typedParams.seriesName === 'incidents'
      ) {
        const typedIncidentParam = (params as { data: [number, string, number, IncidentDetails] })
        const { id } = typedIncidentParam.data[3]
        navigate(`${basePath}/analytics/incidents/${id}`)
      }
    },
    [onDotClick, navigate, basePath, popoverRef]
  )
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('click', handler)

    return () => {
      if (echartInstance && echartInstance.isDisposed && !echartInstance.isDisposed()) {
        if (echartInstance && echartInstance.off) {
          echartInstance.off('click', handler)
        }
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
  defaultWindow: [number, number],
  onDataZoom: (range: TimeStampRange) => void
): [boolean, () => void] => {
  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)

  const onDatazoomCallback = useCallback(
    (e: unknown) => {
      const event = e as unknown as OnDatazoomEvent
      const firstBatch = event.batch?.[0]
      firstBatch && onDataZoom([firstBatch.startValue, firstBatch.endValue])
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
    return () => {
      if (echartInstance && echartInstance.isDisposed && !echartInstance.isDisposed()) {
        if (echartInstance && echartInstance.off) {
          echartInstance.off('datazoom', onDatazoomCallback)
        }
      }
    }
  })

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
    onDataZoom(defaultWindow)
  }, [eChartsRef, onDataZoom, defaultWindow])

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

export function updateBoundary (window: TimeStampRange, ref: MutableRefObject<TimeStampRange>) {
  ref.current = window
}

export function TimelineChart ({
  data,
  chartBoundary,
  selectedData,
  onDotClick,
  chartRef,
  mapping,
  hasXaxisLabel,
  showResetZoom,
  onClick,
  index,
  sharedChartName,
  popoverRef,
  onChartReady,
  ...props
}: TimelineChartProps) {
  const { $t } = useIntl()
  const eChartsRef = useRef<ReactECharts>(null)
  const navigate = useNavigate()
  const currentPath = useTenantLink('/')
  const basePath = currentPath.pathname
  useImperativeHandle(chartRef, () => eChartsRef.current!)
  const chartPadding = 10
  const rowHeight = 22
  const placeholderRows = 2
  const legendWidth = 85
  const xAxisHeight = hasXaxisLabel ? 30 : 0

  const timewindowRef = useRef<TimeStampRange>(chartBoundary as [number, number])

  const [canResetZoom, resetZoomCallback] =
  useDataZoom(
    eChartsRef,
    true,
    chartBoundary as [number, number],
    (window: TimeStampRange) => updateBoundary(window, timewindowRef)
  )
  useDotClick(eChartsRef, onDotClick, popoverRef, navigate, basePath)

  const mappedData = useMemo(() => mapping
    .slice()
    .reverse()
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
          clip: true,
          cursor: 'pointer'
        })
        : ({
          type: 'custom',
          name: series,
          renderItem: renderCustomItem as unknown as CustomSeriesRenderItem,
          itemStyle: {
            color: getBarColor as unknown as string
          },
          animation: false,
          data: getSeriesData(data, key, series),
          clip: true,
          cursor: (key === 'incidents') ? 'pointer' : 'crosshair'
        })
    ) as SeriesOption[], [data, mapping])

  const hasData = useMemo(() => {
    const seriesDatas = mappedData
      .map(({ data }) => data as [number, string, number | Object, Object])
      .flat()
    return seriesDatas.length > 0
  }, [mappedData])

  const option: EChartsOption = useMemo(() => ({
    animation: false,
    grid: {
      show: false,
      top: 0,
      bottom: 0,
      left: chartPadding,
      right: 0,
      width: props.style?.width,
      height: (mapping.length + placeholderRows) * rowHeight
    },
    tooltip: {
      trigger: 'axis',
      triggerOn: 'mousemove',
      show: hasData,
      axisPointer: {
        axis: 'x',
        status: hasData ? 'show' : 'hide',
        show: hasData,
        snap: false,
        animation: false,
        lineStyle: {
          color: cssStr('--acx-neutrals-70'),
          type: 'solid',
          width: 1
        }
      },
      // disable default tooltip formatter
      formatter:
        /* istanbul ignore next */
        () => '',
      ...tooltipOptions(),
      position:
      /* istanbul ignore next */
        (point: [number, number]) => [point[0] + 10, mapping.length * 25]
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
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
        show: hasData,
        snap: false,
        triggerTooltip: false,
        label: {
          ...tooltipOptions() as Object,
          show: true,
          formatter:
            /* istanbul ignore next */
            (val) => {
            /* istanbul ignore next*/
              return labelFormatter(val, timewindowRef.current)
            },
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
    toolbox: toolboxDataZoomOptions,
    dataZoom: [
      {
        id: 'zoom',
        type: 'inside',
        zoomLock: true,
        minValueSpan: 60 * 1000 * 10,
        filterMode: 'none'
      }
    ],
    series: mappedData
  }), [chartBoundary, hasXaxisLabel, mapping, props.style?.width, mappedData, hasData])

  useEffect(() => {
    const chart = eChartsRef && eChartsRef.current
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.setOption(option)
      connect(sharedChartName)
    }
  }, [option, sharedChartName])

  return (
    <UI.ChartWrapper
      $selected={mapping[0].series === INCIDENTS}
      $hasAccess={hasAccess()} >
      <ReactECharts
        {...{
          ...props,
          style: {
            ...props.style,
            // WebkitUserSelect: 'none',
            marginBottom: 0,
            width: (props.style?.width as number) + legendWidth,
            height: (mapping.length + placeholderRows) * rowHeight + xAxisHeight
          }
        }}
        ref={eChartsRef}
        option={option}
        opts={{ renderer: 'svg' }}
        key={index}
        onChartReady={onChartReady}
      />
      {canResetZoom && showResetZoom
      && (<ResetButton
        size='small'
        onClick={resetZoomCallback}
        children={$t({ defaultMessage: 'Reset Zoom' })}
        $disableLegend={true}
        style={{ top: -24, right: 8 }}
      />
      )}
    </UI.ChartWrapper>
  )
}
