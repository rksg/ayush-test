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

import { TooltipComponentOption } from 'echarts'
import ReactECharts               from 'echarts-for-react'
import {
  TooltipFormatterCallback,
  TopLevelFormatterParams
} from 'echarts/types/dist/shared'
import { useIntl } from 'react-intl'

import { cssStr, cssNumber } from '@acx-ui/components'
import {
  xAxisOptions,
  ResetButton,
  axisLabelOptions,
  dateAxisFormatter
} from '@acx-ui/components'
import type { TimeStampRange } from '@acx-ui/types'

import { eventColorByCategory } from './config'

import type { Event }                                from './EventsTimeline'
import type { ECharts, EChartsOption, SeriesOption } from 'echarts'
import type { EChartsReactProps }                    from 'echarts-for-react'


type OnDatazoomEvent = {
  batch?: {
    startValue: number, endValue: number
  }[],
  start?: number,
  end?: number
}

export interface TimelineChartProps
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: Event[];
  chartBoundary: number[];
  selectedData?: number;
  onDotClick?: (params: unknown) => void;
  chartRef?: RefCallback<ReactECharts>;
  hasXaxisLabel?: boolean;
  tooltipFormatter: TooltipFormatterCallback<TopLevelFormatterParams>;
  mapping: { key: string; label: string; chartType: string }[];
  showResetZoom?: boolean
}
export const getSeriesData = (data : Event[], key : string) =>
  data
    .filter(
      (record) =>
        record.seriesKey === key
    )
    .map((record) => [record.start, record.seriesKey, record])

export function getSeriesItemColor (params: { data: Event[] }) {
  const eventObj = Array.isArray(params.data)
    ? params.data[2]
    : null
  return eventObj ? cssStr(
    eventColorByCategory[
      eventObj?.category as keyof typeof eventColorByCategory
    ]
  ) : cssStr('--acx-neutrals-50')
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
      echartInstance.off('click', handler)
    }
  }, [eChartsRef, handler])
}
export const useDataZoom = (
  eChartsRef: RefObject<ReactECharts>,
  zoomEnabled: boolean,
  onDataZoom?: (range: TimeStampRange, isReset: boolean) => void
): [boolean, () => void] => {

  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)

  const onDatazoomCallback = useCallback((e: unknown) => {
    const event = e as unknown as OnDatazoomEvent
    const firstBatch = event.batch?.[0]
    firstBatch && onDataZoom && onDataZoom([firstBatch.startValue, firstBatch.endValue], false)
    if (event.start === 0 && event.end === 100) {
      setCanResetZoom(false)
    } else {
      setCanResetZoom(true)
    }
  }, [onDataZoom])
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
  const [canResetZoom, resetZoomCallback] =
    useDataZoom(eChartsRef, true)
  // use selected event on dot click to show popover
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selected, setSelected] = useState<number | undefined>(selectedData)

  useDotClick(eChartsRef, onDotClick, setSelected)

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
      axisPointer: {
        axis: 'x',
        status: 'show',
        animation: false,
        lineStyle: {
          color: cssStr('--acx-neutrals-70'),
          type: 'solid',
          width: 1
        }
      },
      formatter: tooltipFormatter,
      ...tooltipOptions(),
      // Need to address test coverage for the postion
      position: /* istanbul ignore next */ (point) => [point[0] + 10, mapping.length * 30]
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
              color: cssStr('--acx-neutrals-30') ,
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
        ...mapping.map(({ label }) => label)
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
        minValueSpan: 60
      }
    ],
    series: mapping
      .reverse()
      .slice()
      .map(
        ({ key, label, chartType }) =>
          ({
            type: chartType,
            name: label,
            symbol: chartType=== 'scatter' ? 'circle' : null,
            symbolSize: 8,
            animation: false,
            data: getSeriesData(data, key),
            itemStyle: {
              color: getSeriesItemColor
            }
          } as SeriesOption)
      )
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
            height:
              (mapping.length + placeholderRows) * rowHeight + xAxisHeight
          }
        }}
        ref={eChartsRef}
        option={option}
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
