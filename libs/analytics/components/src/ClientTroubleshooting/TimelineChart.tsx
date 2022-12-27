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
  useDataZoom,
  ResetButton,
  axisLabelOptions,
  dateAxisFormatter
} from '@acx-ui/components'

import type { ECharts, EChartsOption, SeriesOption } from 'echarts'
import type { EChartsReactProps }                    from 'echarts-for-react'

export interface Event {
  timestamp: string;
  event: string;
  ttc: string;
  mac: string;
  apName: string;
  path: [];
  code: string;
  state: string;
  failedMsgId: string;
  messageIds: string;
  radio: string;
  ssid: string;
  type: string;
  key: string;
  start: number;
  end: number;
  category: string;
  seriesKey: string;
}

export interface TimelineChartProps
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: Event[];
  chartBoundary: number[];
  selectedData?: number; // id
  brushWidth?: number; // default 1 day = 24 * 60 * 60 * 1000
  onDotClick?: (params: unknown) => void;
  chartRef?: RefCallback<ReactECharts>;
  title: string;
  hasXaxisLabel?: boolean;
  tooltipFormatter: TooltipFormatterCallback<TopLevelFormatterParams>;
  mapping: { key: string; label: string; color: string }[];
  showResetZoom?: boolean
}

export const getDragPosition = (
  boundary: { min: number; max: number },
  actualAreas: number[][],
  index: number
) => {
  const range =
    index === 0
      ? [boundary.min, Math.min(actualAreas[1][0], boundary.max)]
      : [Math.max(actualAreas[0][1], boundary.min), boundary.max]
  const width = actualAreas[index][1] - actualAreas[index][0]
  let newPosition = actualAreas[index].slice()
  if (newPosition[0] < range[0]) {
    newPosition = [range[0], range[0] + width]
  }
  if (newPosition[1] > range[1]) {
    newPosition = [range[1] - width, range[1]]
  }
  return newPosition
}

export const getZoomPosition = (
  boundary: { min: number; max: number },
  actualArea: number[][],
  index: number
) => {
  const range =
    index === 0
      ? [boundary.min, Math.min(actualArea[1][0], boundary.max)]
      : [Math.max(actualArea[0][1], boundary.min), boundary.max]
  return [
    actualArea[index][0] < range[0] ? range[0] : actualArea[index][0],
    actualArea[index][1] > range[1] ? range[1] : actualArea[index][1]
  ]
}
export const SUCCESS = 'success'
export const SLOW = 'slow'
export const DISCONNECT = 'disconnect'
export const FAILURE = 'failure'
export const eventColorByCategory = {
  [DISCONNECT]: '--acx-neutrals-50',
  [SUCCESS]: '--acx-semantics-green-50',
  [FAILURE]: '--acx-semantics-red-50',
  [SLOW]: '--acx-semantics-yellow-50'
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

export const tooltipOptions = () =>
  ({
    textStyle: {
      color: 'black',
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
  const placeholderRows = 2 // for tracker
  const legendWidth = 85
  const xAxisHeight = hasXaxisLabel ? 30 : 0

  const eChartsRef = useRef<ReactECharts>(null)
  const [canResetZoom, resetZoomCallback] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useDataZoom<any>(eChartsRef, true, data)
  const [_, setSelected] = useState<number | undefined>(selectedData)

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
        animation: false,
        lineStyle: {
          color: cssStr('--acx-neutrals-70'),
          type: 'solid',
          width: 1
        }
      },
      formatter: tooltipFormatter,
      ...tooltipOptions(),
      position: (point) => [point[0] + 10, mapping.length * 30],
      enterable: true
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
              color: '#D4D4D4',
              width: 1,
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
        ({ key, label }) =>
          ({
            type: 'scatter',
            name: label,
            symbol: 'circle',
            symbolSize: 8,
            animation: false,
            data: data
              .filter(
                (record) =>
                  record.seriesKey === key && record.type === 'connectionEvents'
              )
              .map((record) => [record.start, record.seriesKey, record]),
            itemStyle: {
              color: function (params) {
                const eventObj = Array.isArray(params.data)
                  ? params.data[2]
                  : ''
                const { category } = eventObj as unknown as Event
                return cssStr(
                  eventColorByCategory[
                    category as keyof typeof eventColorByCategory
                  ]
                )
              },
              height: 20
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
