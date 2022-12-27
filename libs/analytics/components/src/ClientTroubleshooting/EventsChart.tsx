import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState,RefCallback, useImperativeHandle } from 'react'

import { TooltipComponentOption }                             from 'echarts'
import ReactECharts                                           from 'echarts-for-react'
import {  TooltipFormatterCallback, TopLevelFormatterParams } from 'echarts/types/dist/shared'
import { useIntl }                                            from 'react-intl'

import { cssStr,cssNumber } from '@acx-ui/components'
import {

  xAxisOptions,
  useDataZoom,
  ResetButton
} from '@acx-ui/components'


import type { ECharts, EChartsOption, SeriesOption } from 'echarts'
import type { EChartsReactProps }                    from 'echarts-for-react'


export interface Event{
  timestamp: string,
  event: string,
  ttc: string,
  mac: string,
  apName: string,
  path: [],
  code: string,
  state: string,
  failedMsgId: string,
  messageIds: string,
  radio: string,
  ssid: string
  type: string
  key: string
  start: number,
  end: number,
  category: string,
  seriesKey: string
}

export interface ConfigChangeChartProps
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: Event[]
    chartBoundary: number[]
    selectedData?: number, // id
    brushWidth?: number, // default 1 day = 24 * 60 * 60 * 1000
    onDotClick?: (params: unknown) => void,
    chartRef?: RefCallback<ReactECharts>,
    title: string,
    tooltipFormatter: TooltipFormatterCallback<TopLevelFormatterParams>,
    mapping: { key: string, label: string, color: string }[]
  }



export const hexToRGB = (hex: string) =>
  `rgb(${hex.match(/[0-9A-F]{1,2}/g)?.map(hex => parseInt(hex, 16)).join(',')})`
export const getSelectedDot = (color: string) =>
// eslint-disable-next-line max-len
  `image://data:image/svg+xml;utf8,<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5.5C10 7.98528 7.98528 10 5.5 10C3.01472 10 1 7.98528 1 5.5C1 3.01472 3.01472 1 5.5 1C7.98528 1 10 3.01472 10 5.5ZM11 5.5C11 8.53757 8.53757 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0C8.53757 0 11 2.46243 11 5.5ZM5.5 9C7.433 9 9 7.433 9 5.5C9 3.567 7.433 2 5.5 2C3.567 2 2 3.567 2 5.5C2 7.433 3.567 9 5.5 9Z" fill="${color}"/></svg>`
// export const getSymbol = (selected: number) =>
//   (value: [number, string, Event]) => (value[2] !== selected)
//     ? 'circle'
//     : getSelectedDot(hexToRGB(mapping.filter(({ key }) => key === value[2].type)[0].color))

export const getDragPosition = (
  boundary: { min: number, max: number }, actualAreas: number[][], index: number
) => {
  const range = index === 0
    ? [boundary.min, Math.min(actualAreas[1][0], boundary.max)]
    : [Math.max(actualAreas[0][1],boundary.min), boundary.max]
  const width = actualAreas[index][1] - actualAreas[index][0]
  let newPosition = actualAreas[index].slice()
  if (newPosition[0] < range[0]) {
    newPosition = [ range[0], range[0] + width ]
  }
  if (newPosition[1] > range[1]) {
    newPosition = [ range[1] - width, range[1] ]
  }
  return newPosition
}
export const getDrawPosition = (
  xPosition: number,
  brushWidth: number,
  boundary: { min: number, max: number },
  actualAreas: number[][],
  index: number
) => {
  const newActualAreas = actualAreas.map((position, i) =>
    index === i ? [xPosition, xPosition + brushWidth] : position
  )
  const newShowAreas = actualAreas.map((position, i) =>
    index === i ? getDragPosition(boundary, newActualAreas, index) : position
  )
  return { actual: newShowAreas, show: newShowAreas }
}
export const getZoomPosition = (
  boundary: { min: number, max: number }, actualArea: number[][], index: number
) => {
  const range = index === 0
    ? [boundary.min, Math.min(actualArea[1][0], boundary.max)]
    : [Math.max(actualArea[0][1], boundary.min), boundary.max]
  return [
    actualArea[index][0] < range[0] ? range[0]: actualArea[index][0],
    actualArea[index][1] > range[1] ? range[1]: actualArea[index][1]
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
  onDotClick: ((param:unknown) => void) | undefined,
  setSelected: Dispatch<SetStateAction<number | undefined>>
) => {
  const handler = useCallback(function (params: {
    componentSubType: string
    data: unknown
  }) {
    if(params.componentSubType !== 'scatter') return
    const data = params.data as [number, string, Event]
    setSelected(data[2] as unknown as number)
    onDotClick && onDotClick(data[2])
  }, [setSelected, onDotClick])

  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('click', handler)
    return () => { echartInstance.off('click', handler) }
  }, [eChartsRef, handler])
}
export const useBoundaryChange = (
  boundary: { min: number, max: number },
  brushPositions: { actual: number[][], show: number[][] },
  setBrushPositions: Dispatch<SetStateAction<{ actual: number[][], show: number[][] }>>,
  getZoomPosition: (
    boundary: { min: number, max: number },
    actualArea: number[][], index: number
  ) => number[],
  draw: (areas: { actual: number[][], show:number[][] }) => void
) => {
  useEffect(() => {
    const newShowAreas = brushPositions.actual
      .map((_, index)=> getZoomPosition(boundary, brushPositions.actual, index))
    setBrushPositions({ ...brushPositions, show: newShowAreas })
    draw({ ...brushPositions, show: newShowAreas })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundary])
}

// export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
//   const [ time ] = (Array.isArray(params)
//     ? params[0].data : params.data) as [number]
//   return renderToString(
//     <TooltipWrapper>
//       <time dateTime={new Date(time).toJSON()}>{formatter('dateTimeFormat')(time) as string}</time>
//     </TooltipWrapper>
//   )
// }

export const useLegendSelectChanged = (
  setSelectedLegend: Dispatch<SetStateAction<Record<string, boolean>>>
) => {
  return useCallback((params: { selected: Record<string, boolean> }) => {
    if(Object.keys(params.selected).every(key => params.selected[key] === false)){
      setSelectedLegend(Object.keys(params.selected).reduce((selected, label) => {
        selected[label as string] = true
        return selected
      }, {} as Record<string, boolean>))
    }
    else{
      setSelectedLegend(params.selected)
    }
  }, [setSelectedLegend])
}
export const tooltipOptions = () => ({
  textStyle: {
    color: 'black',
    fontFamily: cssStr('--acx-neutral-brand-font'),
    fontSize: cssNumber('--acx-body-5-font-size'),
    lineHeight: cssNumber('--acx-body-5-line-height'),
    fontWeight: cssNumber('--acx-body-font-weight')
  },
  // backgroundColor: cssStr('--acx-primary-black'),
  borderRadius: 2,
  borderWidth: 0,
  padding: 8,
  confine: true,
  border: 'none',
  extraCssText: 'box-shadow: 0px 0px 0px rgba(51, 51, 51, 0.08); z-index: 0;'
} as TooltipComponentOption)
export function EventsChart ({
  data,
  chartBoundary,
  selectedData,
  onDotClick,
  chartRef,
  tooltipFormatter,
  mapping,
  ...props
}: ConfigChangeChartProps) {
  const { $t } = useIntl()

  useImperativeHandle(chartRef, () => eChartsRef.current!)
  const chartPadding = 10
  const rowHeight = 20
  const placeholderRows = 2 // for tracker
  const legendWidth = 85

  const eChartsRef = useRef<ReactECharts>(null)
  const [canResetZoom, resetZoomCallback] =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useDataZoom<any>(eChartsRef, true, data)
  const [_, setSelected] = useState<number|undefined>(selectedData)

  useDotClick(eChartsRef, onDotClick, setSelected)
  // useBoundaryChange(boundary, brushPositions, setBrushPositions, getZoomPosition, draw)

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
      // TODO: tooltip shows x-Position (https://github.com/apache/echarts/issues/16621)
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
      position: (point) => [point[0] + 10, mapping.length * 30], // 10 for gap between tooltip and tracker,
      enterable: true
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        // ...axisLabelOptions(),
        // formatter: dateAxisFormatter()
        show: false
      },
      min: chartBoundary[0],
      max: chartBoundary[1],
      splitLine: {
        show: false,
        // TODO: set interval for splitLine (https://github.com/apache/echarts/issues/16142)
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
            ...Array(placeholderRows).fill(0).map(() => cssStr('--acx-primary-white')),
            ...mapping.map(() => cssStr('--acx-neutrals-10'))
          ]
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [cssStr('--acx-primary-white')],
          width: 1
        }
      },
      data: [
        ...Array(placeholderRows).fill(0).map((_,index) => `placeholder${index}`),
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
    series: mapping.reverse().slice().map(
      ({ key, label }) =>
        ({
          type: 'scatter',
          name: label,
          symbol: 'circle',
          symbolSize: 8,
          colorBy: 'series',
          animation: false,
          data: data
            .filter((record) => (record.seriesKey === key && record.type === 'connectionEvents'))
            .map((record) => [record.start, record.seriesKey, record]),
          itemStyle: {
            color: function (params) {
              const eventObj = Array.isArray(params.data) ? params.data[2] : ''
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
            width: (props.style?.width as number) + legendWidth,
            height: (mapping.length + placeholderRows) * rowHeight // +1 for x-axis
          }
        }}
        ref={eChartsRef}
        option={option}
      />
      <ResetButton
        size='small'
        onClick={resetZoomCallback}
        children={$t({ defaultMessage: 'Reset Zoom' })}
        $disableLegend={true}
      />
    </>
  )
}
