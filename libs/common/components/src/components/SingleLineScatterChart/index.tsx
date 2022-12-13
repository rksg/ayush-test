import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState, RefCallback, useImperativeHandle } from 'react'

import { Row, Col }                                           from 'antd'
import ReactECharts                                           from 'echarts-for-react'
import {  TooltipFormatterCallback, TopLevelFormatterParams } from 'echarts/types/dist/shared'

import { cssStr }     from '../../theme/helper'
import {
  tooltipOptions,
  axisLabelOptions,
  xAxisOptions,
  dateAxisFormatter
} from '../Chart/helper'

import type { ECharts, EChartsOption, SeriesOption } from 'echarts'
import type { EChartsReactProps }                    from 'echarts-for-react'

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
export interface ConfigChange{
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
  category: string
}
export interface ConfigChangeChartProps
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: ConfigChange[]
    chartBoundary: number[]
    selectedData?: number, // id
    brushWidth?: number, // default 1 day = 24 * 60 * 60 * 1000
    onDotClick?: (params: unknown) => void,
    title: string,
    count: number,
    chartRef?: RefCallback<ReactECharts>,
    tooltopEnabled : boolean,
    mapping: { key: string, label: string, color: string }[],
    tooltipFormatter: TooltipFormatterCallback<TopLevelFormatterParams>
  }

export const mapping1 = [
  { key: 'ap', label: 'AP', color: cssStr('--acx-viz-qualitative-4') }
] as { key: string, label: string, color: string }[]

export const hexToRGB = (hex: string) =>
  `rgb(${hex.match(/[0-9A-F]{1,2}/g)?.map(hex => parseInt(hex, 16)).join(',')})`
export const getSelectedDot = (color: string) =>
// eslint-disable-next-line max-len
  `image://data:image/svg+xml;utf8,<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5.5C10 7.98528 7.98528 10 5.5 10C3.01472 10 1 7.98528 1 5.5C1 3.01472 3.01472 1 5.5 1C7.98528 1 10 3.01472 10 5.5ZM11 5.5C11 8.53757 8.53757 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0C8.53757 0 11 2.46243 11 5.5ZM5.5 9C7.433 9 9 7.433 9 5.5C9 3.567 7.433 2 5.5 2C3.567 2 2 3.567 2 5.5C2 7.433 3.567 9 5.5 9Z" fill="${color}"/></svg>`

// change this to correct check
// export const getSymbol = (selected: number) =>
//   (value: [number, string, ConfigChange]) => (value[2].start !== selected)
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
    const data = params.data as [number, string, ConfigChange]
    setSelected(data[2].mac as unknown as number)
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

// const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
//   const [ time ] = (Array.isArray(params)
//     ? params[0].data : params.data) as [number]
//   return renderToString(
//     <TooltipWrapper>
//       <time dateTime={new Date(time).toJSON()}>{formatter('dateTimeFormat')(time) as string}</time>
//     </TooltipWrapper>
//   )
// }

export const useDatazoom = (
  chartBoundary: number[], setBoundary: Dispatch<SetStateAction<{ min: number, max: number }>>
) => {
  return useCallback((params: { batch: [{ start: number, end: number }] }) => {
    const min = chartBoundary[0]
    const inverval = chartBoundary[1] - min
    setBoundary({
      min: min + inverval * (params.batch[0].start / 100),
      max: min + inverval * (params.batch[0].end / 100)
    })
  }, [chartBoundary, setBoundary])
}
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

export function SingleLineScatterChart ({
  data,
  chartBoundary,
  selectedData,
  onDotClick,
  chartRef,
  tooltopEnabled,
  mapping,
  tooltipFormatter,
  ...props
}: ConfigChangeChartProps) {

  const chartPadding = 10
  const rowHeight = 20
  const eChartsRef = useRef<ReactECharts>(null)
  useImperativeHandle(chartRef, () => eChartsRef.current!)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selected, setSelected] = useState<number|undefined>(selectedData)
  useDotClick(eChartsRef, onDotClick, setSelected)

  const option: EChartsOption = {
    animation: false,
    grid: {
      top: 0,
      bottom: 0,
      left: chartPadding,
      right: 0,
      width: props.style?.width

    },
    // toolbox: { show: true },
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
    ...(tooltopEnabled ? {
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
        formatter: tooltipFormatter ,
        ...tooltipOptions(),
        position: (point) => [point[0] + 10, 0]
      }
    } : {
      tooltip: { show: false }
    }),

    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter() },
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
            cssStr('--acx-neutrals-10')
          ]
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [cssStr('--acx-primary-white')],
          width: 1
        }
      }
    },
    dataZoom: [
      {
        id: 'zoom',
        type: 'inside',
        minValueSpan: 60 * 60 * 1000 // hour
      }
    ],

    series: [
      {
        type: 'scatter',
        name: 'series 1',
        // symbol: getSymbol(selected as number),
        symbolSize: 10,
        animation: false,
        data: data.length > 1 ? data
          .map((record) => [record.start, 'series 1', record]) : [0,0],
        itemStyle: {
          color: function (params) {
            return cssStr(
              eventColorByCategory[
              // @ts-ignore: Unreachable code error
                params.data[2].category as keyof typeof eventColorByCategory
              ]
            )
          }
        }
      } as SeriesOption
    ]

  }
  return (
    <Row gutter={[16, 16]}>
      <Col span={4} >
        {props.title}
      </Col>
      <Col span={1} >
        {props.count}
      </Col>
      <Col span={19}>
        <ReactECharts
          {...{
            ...props,
            style: {
              ...props.style,
              WebkitUserSelect: 'none',
              width: 'auto',
              height: 1 * rowHeight  // +1 for x-axis
            }
          }}
          ref={eChartsRef}
          option={option}
        />
      </Col>
    </Row>
  )
}
