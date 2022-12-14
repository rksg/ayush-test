import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'

import { TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                from 'echarts-for-react'
import { renderToString }                          from 'react-dom/server'

import { formatter } from '@acx-ui/utils'

import { cssStr }     from '../../theme/helper'
import {
  legendTextStyleOptions,
  tooltipOptions,
  axisLabelOptions,
  xAxisOptions,
  dateAxisFormatter
} from '../Chart/helper'
import { TooltipWrapper } from '../Chart/styledComponents'

import type { ECharts, EChartsOption, SeriesOption } from 'echarts'
import type { EChartsReactProps }                    from 'echarts-for-react'

export interface ConfigChange {
  id: number;
  timestamp: string;
  type: string;
  name: string;
  key: string;
  oldValues: unknown;
  newValues: unknown;
}

export interface ConfigChangeChartProps
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: ConfigChange[]
    chartBoundary: number[]
    selectedData?: number, // id
    brushWidth?: number, // default 1 day = 24 * 60 * 60 * 1000
    onDotClick?: (params: unknown) => void
  }

export const mapping = [
  { key: 'ap', label: 'AP', color: cssStr('--acx-viz-qualitative-4') },
  { key: 'apGroup', label: 'AP Group', color: cssStr('--acx-viz-qualitative-3') },
  { key: 'wlan', label: 'WLAN', color: cssStr('--acx-viz-qualitative-2') },
  { key: 'venue', label: 'Venue', color: cssStr('--acx-viz-qualitative-1') }
] as { key: string, label: string, color: string }[]

export const hexToRGB = (hex: string) =>
  `rgb(${hex.match(/[0-9A-F]{1,2}/g)?.map(hex => parseInt(hex, 16)).join(',')})`
export const getSelectedDot = (color: string) =>
// eslint-disable-next-line max-len
  `image://data:image/svg+xml;utf8,<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5.5C10 7.98528 7.98528 10 5.5 10C3.01472 10 1 7.98528 1 5.5C1 3.01472 3.01472 1 5.5 1C7.98528 1 10 3.01472 10 5.5ZM11 5.5C11 8.53757 8.53757 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0C8.53757 0 11 2.46243 11 5.5ZM5.5 9C7.433 9 9 7.433 9 5.5C9 3.567 7.433 2 5.5 2C3.567 2 2 3.567 2 5.5C2 7.433 3.567 9 5.5 9Z" fill="${color}"/></svg>`
export const getSymbol = (selected: number) =>
  (value: [number, string, ConfigChange]) => (value[2].id !== selected)
    ? 'circle'
    : getSelectedDot(hexToRGB(mapping.filter(({ key }) => key === value[2].type)[0].color))

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
    setSelected(data[2].id)
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

export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
  const [ time ] = (Array.isArray(params)
    ? params[0].data : params.data) as [number]
  return renderToString(
    <TooltipWrapper>
      <time dateTime={new Date(time).toJSON()}>{formatter('dateTimeFormat')(time) as string}</time>
    </TooltipWrapper>
  )
}

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

export function ConfigChangeChart ({
  data,
  chartBoundary,
  brushWidth = 24 * 60 * 60 * 1000,
  selectedData,
  onDotClick,
  ...props
}: ConfigChangeChartProps) {

  const chartPadding = 10
  const rowHeight = 20
  const placeholderRows = 3 // for tracker
  const legendWidth = 85
  const brushHeight = mapping.length * rowHeight
  const xAxisHeight = 30

  const eChartsRef = useRef<ReactECharts>(null)

  const [selected, setSelected] = useState<number|undefined>(selectedData)
  const [brushPositions, setBrushPositions] = useState(() => {
    const brushes = [
      [ chartBoundary[0], chartBoundary[0] + brushWidth ],
      [ chartBoundary[1] - brushWidth, chartBoundary[1] ]
    ]
    return { actual: brushes, show: brushes }
  })
  const [boundary, setBoundary] = useState({
    min: chartBoundary[0],
    max: chartBoundary[1]
  })
  const [selectedLegend, setSelectedLegend] =
    useState(mapping.map(({ label }) => label).reduce((selected, label) => {
      selected[label as string] = true
      return selected
    }, {} as Record<string, boolean>))

  const draw =(areas: { actual: number[][], show:number[][] }) => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts

    echartInstance.setOption({
      graphic: {
        elements: [
          // For why line height can't be customized:
          // Ref: https://github.com/apache/echarts/issues/17163
          {
            type: 'rect',
            id: 'background',
            slient: true,
            x: 0,
            y: 0,
            z: -1,
            shape: {
              width: (props.style?.width as number) + legendWidth,
              height: (mapping.length + placeholderRows + 1) * rowHeight // +1 for x-axis
            },
            style: { fill: cssStr('--acx-primary-white') },
            cursor: 'default'
          },
          {
            type: 'rect',
            id: 'background-hide-tracker',
            slient: true,
            x: chartPadding, // gap between contianer and grid
            y: 0,
            z: 0,
            shape: {
              width: (props.style?.width as number) + legendWidth,
              height: placeholderRows * rowHeight
            },
            style: { fill: cssStr('--acx-primary-white') },
            cursor: 'default'
          },
          {
            type: 'rect',
            id: 'brush-bar',
            slient: true,
            x: chartPadding, // gap between contianer and grid
            y: (placeholderRows-1) * rowHeight,
            z: 1,
            shape: { width: (props.style?.width as number), height: rowHeight, r: 3 },
            style: { fill: cssStr('--acx-neutrals-20') },
            cursor: 'default'
          },{
            type: 'group',
            id: 'main',
            children: areas.show.map((showArea: number[], index: number) => {
              const position = showArea
                .map((point) => echartInstance.convertToPixel('grid', [point]))
                .map(([x]) => x)
              const width = position[1] - position[0]
              return {
                type: 'group',
                id: `brush-${index}`,
                children: [
                  {
                    type: 'rect',
                    id: `invisible-${index}`,
                    invisible: true,
                    slient: width <= 0,
                    x: position[0],
                    y: (placeholderRows - 1) * rowHeight,
                    z: 100,
                    shape: { width, height: rowHeight },
                    draggable: width <= 0 ? false : 'horizontal',
                    cursor: width <= 0 ? 'default' : 'all-scroll',
                    ondrag: function () {
                      const [xPosition] = echartInstance.convertFromPixel('grid', [this.x])
                      const newAreas = getDrawPosition(
                        xPosition, brushWidth, boundary, areas.actual, index)
                      draw(newAreas)
                      setBrushPositions(newAreas)
                    }
                  },
                  {
                    type: 'rect',
                    id: `text-box-${index}`,
                    slient: true,
                    invisible: width <= 0,
                    textContent: {
                      type: 'text',
                      id: `text-box-inside-${index}`,
                      slient: true,
                      invisible: width <= 0,
                      style: {
                        text: index === 0 ? 'BEFORE' : 'AFTER',
                        fill: cssStr('--acx-accents-blue-50'),
                        fontSize: 9,
                        fontWeight: 700
                      }
                    },
                    textConfig: { position: 'insideBottom' },
                    x: position[0],
                    y: (placeholderRows - 2) * rowHeight,
                    z: 100,
                    shape: { width, height: rowHeight, r: 3 },
                    style: {
                      fill: 'transparent',
                      stroke: 'transparent'
                    },
                    cursor: 'default'
                  },
                  {
                    type: 'rect',
                    id: `first-box-${index}`,
                    slient: true,
                    invisible: width <= 0,
                    textContent: {
                      type: 'text',
                      id: `text-inside-${index}`,
                      slient: true,
                      invisible: width <= 0,
                      style: {
                        text: '|||',
                        fill: cssStr('--acx-accents-blue-60')
                      },
                      cursor: 'default',
                      z: 1
                    },
                    textConfig: { position: 'inside' },
                    x: position[0],
                    y: (placeholderRows - 1) * rowHeight,
                    z: 1,
                    shape: { width, height: rowHeight, r: 3 },
                    style: {
                      fill: cssStr('--acx-accents-blue-50'),
                      stroke: cssStr('--acx-accents-blue-50')
                    }
                  },
                  {
                    type: 'rect',
                    id: `second-box-${index}`,
                    slient: true,
                    invisible: width <= 0,
                    x: position[0],
                    y: (placeholderRows) * rowHeight + 3, // 3 px for gap between boxes
                    z: 1,
                    shape: { width, height: brushHeight, r: 3 },
                    style: {
                      fill: 'rgba(0, 0, 0, 0.05)', // --acx-primary-white 5%
                      stroke: cssStr('--acx-accents-blue-50'),
                      lineDash: 2,
                      lineDashOffset: 2,
                      lineWidth: 2
                    },
                    cursor: 'default'
                  }
                ]
              }
            })
          }]
      }
    })
  }

  useDotClick(eChartsRef, onDotClick, setSelected)
  useBoundaryChange(boundary, brushPositions, setBrushPositions, getZoomPosition, draw)

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
    toolbox: { show: false },
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
      position: (point) => [point[0] + 10, 0] // 10 for gap between tooltip and tracker
    },
    legend: {
      orient: 'vertical',
      right: chartPadding,
      top: (placeholderRows - 1) * rowHeight,
      icon: 'circle',
      itemWidth: 8,
      itemGap: 3,
      padding: 0,
      textStyle: legendTextStyleOptions(),
      selected: selectedLegend
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter()
      },
      min: chartBoundary[0],
      max: chartBoundary[1],
      splitLine: {
        show: true,
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
            ...mapping.map(() => cssStr('--acx-neutrals-10')),
            ...Array(placeholderRows).fill(0).map(() => cssStr('--acx-primary-white'))
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
        ...mapping.map(({ label }) => label),
        ...Array(placeholderRows).fill(0).map((_,index) => `placeholder${index}`)
      ]
    },
    dataZoom: [
      {
        id: 'zoom',
        type: 'inside',
        orient: 'horizontal',
        // TODO: set zoom limitation if supported (https://github.com/apache/echarts/issues/12907)
        minValueSpan: 60 * 60 * 1000, // hour
        moveOnMouseMove: false,
        moveOnMouseWheel: false
      }
    ],
    series: mapping.slice().reverse().map(
      ({ key, label }) =>
        ({
          type: 'scatter',
          name: label,
          symbol: getSymbol(selected as number),
          symbolSize: 10,
          colorBy: 'series',
          animation: false,
          data: data
            .filter((record) => record.type === key)
            .map((record) => [parseInt(record.timestamp, 10), label, record])
        } as SeriesOption)
    ),
    color: mapping.map(({ color }) => color).slice().reverse()
  }

  return (
    <ReactECharts
      {...{
        ...props,
        style: {
          ...props.style,
          WebkitUserSelect: 'none',
          width: (props.style?.width as number) + legendWidth,
          height: (mapping.length + placeholderRows) * rowHeight + xAxisHeight // +1 for x-axis
        }
      }}
      ref={eChartsRef}
      option={option}
      onEvents={{
        datazoom: useDatazoom(chartBoundary, setBoundary),
        legendselectchanged: useLegendSelectChanged(setSelectedLegend)
      }}
    />
  )
}
