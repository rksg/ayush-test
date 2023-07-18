import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'

import ReactECharts, { EChartsReactProps } from 'echarts-for-react'
import { debounce }                        from 'lodash'
import { renderToString }                  from 'react-dom/server'

import { get }                       from '@acx-ui/config'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { getIntl }                   from '@acx-ui/utils'

import { cssNumber, cssStr }   from '../../theme/helper'
import { qualitativeColorSet } from '../Chart/helper'
import { TooltipWrapper }      from '../Chart/styledComponents'

import type { ECharts, TooltipComponentFormatterCallbackParams } from 'echarts'

export type ConfigChange = {
  id?: number
  timestamp: string
  type: string
  name: string
  key: string
  oldValues: string[]
  newValues: string[]
}

export interface ConfigChangeChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: ConfigChange[]
  chartBoundary: [ number, number],
  selectedData?: number,
  onDotClick?: (params: unknown) => void,
  onBrushPositionsChange?: (params: number[][]) => void
}

type OnDatazoomEvent = { batch: { startValue: number, endValue: number }[] }

type ChartRowMappingType = { key: string, label: string, color: string }
export function getConfigChangeEntityTypeMapping () : ChartRowMappingType[] {
  const { $t } = getIntl()
  const colors = qualitativeColorSet()
  const R1Map = [
    { key: 'zone', label: $t({ defaultMessage: 'Venue' }) },
    { key: 'wlan', label: $t({ defaultMessage: 'WLAN' }) },
    { key: 'apGroup', label: $t({ defaultMessage: 'AP Group' }) },
    { key: 'ap', label: $t({ defaultMessage: 'AP' }) }
  ]
  const RAMap = [
    { key: 'zone', label: $t({ defaultMessage: 'Zone' }) },
    { key: 'wlanGroup', label: $t({ defaultMessage: 'WLAN Group' }) },
    { key: 'wlan', label: $t({ defaultMessage: 'WLAN' }) },
    { key: 'apGroup', label: $t({ defaultMessage: 'AP Group' }) },
    { key: 'ap', label: $t({ defaultMessage: 'AP' }) }
  ]
  return (get('IS_MLISA_SA') ? RAMap : R1Map)
    .slice(0).map((rec, index) => ({ ...rec, color: colors[index] })).reverse()
}

const rowHeight = 16, rowGap = 4
export const getChartLayoutConfig = (
  chartWidth: number, chartRowMapping: ChartRowMappingType[]
) => ({
  chartWidth,
  chartPadding: 10,
  rowHeight,
  rowGap,
  xAxisHeight: 30,
  brushHeight: chartRowMapping.length * (rowHeight + rowGap),
  brushWidth: 24 * 60 * 60 * 1000,
  brushTextHeight: 12,
  legendHeight: 24,
  symbolSize: 12
})

export const getInitBoundary = (
  chartBoundary: ConfigChangeChartProps['chartBoundary']
) => ({ min: chartBoundary[0], max: chartBoundary[1] })

export const getInitBrushPositions = (
  chartBoundary: ConfigChangeChartProps['chartBoundary'],
  brushWidth: ReturnType<typeof getChartLayoutConfig>['brushWidth']
) => {
  const brushes = [
    [ chartBoundary[0], chartBoundary[0] + brushWidth! ],
    [ chartBoundary[1] - brushWidth!, chartBoundary[1] ]
  ]
  return { actual: brushes, show: brushes }
}

// TODO: when window is smaller than width of 2 brushes, brushes will be rendered outside of the window,
//       might need to fix when we decide how to show this case
export const adjustAfterBoundaryChanged = (
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

export const adjuestDrawPosition = (
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

export const getDrawDragPosition = (
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
    index === i ? adjuestDrawPosition(boundary, newActualAreas, index) : position
  )
  return { actual: newShowAreas, show: newShowAreas }
}

export const draw = (
  eChartsRef: RefObject<ReactECharts>,
  chartLayoutConfig: Record<string, number>,
  areas: { actual: number[][], show:number[][] },
  boundary: { min: number, max: number },
  setBrushPositions: Dispatch<SetStateAction<{ actual: number[][], show: number[][] }>>
) => {
  const { $t } = getIntl()
  if (!eChartsRef || !eChartsRef.current) return
  const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts

  const {
    chartWidth, chartPadding, legendHeight, brushTextHeight, rowHeight, rowGap,
    brushHeight, brushWidth
  } = chartLayoutConfig

  echartInstance.setOption({
    graphic: {
      elements: [
        {
          type: 'rect',
          id: 'brush-bar',
          slient: true,
          x: chartPadding, // gap between contianer and grid
          y: legendHeight + brushTextHeight,
          z: 1,
          shape: { width: (chartWidth as number) - 2 * chartPadding, height: rowHeight, r: 3 },
          style: { fill: cssStr('--acx-neutrals-20') }
        },
        {
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
                  y: legendHeight + brushTextHeight,
                  z: 100,
                  shape: { width, height: rowHeight },
                  draggable: width <= 0 ? false : 'horizontal',
                  ondrag: function () {
                    const [xPosition] = echartInstance.convertFromPixel('grid', [this.x])
                    const newAreas = getDrawDragPosition(
                      xPosition, brushWidth, boundary, areas.actual, index)
                    setBrushPositions(newAreas)
                    draw(eChartsRef, chartLayoutConfig, newAreas, boundary, setBrushPositions)
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
                      text: index === 0
                        ? $t({ defaultMessage: 'BEFORE' })
                        : $t({ defaultMessage: 'AFTER' }),
                      fill: cssStr('--acx-accents-blue-50'),
                      fontSize: cssNumber('--acx-body-6-font-size'),
                      fontWeight: cssNumber('--acx-body-font-weight-bold')
                    },
                    cursor: 'default'
                  },
                  textConfig: { position: 'insideBottom' },
                  x: position[0],
                  y: legendHeight,
                  z: 100,
                  shape: { width, height: brushTextHeight, r: 3 },
                  style: {
                    fill: 'transparent',
                    stroke: 'transparent'
                  },
                  cursor: 'default'
                },
                {
                  type: 'rect',
                  id: `top-box-${index}`,
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
                    z: 1
                  },
                  textConfig: { position: 'inside' },
                  x: position[0],
                  y: legendHeight + brushTextHeight,
                  z: 1,
                  shape: { width, height: rowHeight, r: 3 },
                  style: {
                    fill: cssStr('--acx-accents-blue-50'),
                    stroke: cssStr('--acx-accents-blue-50')
                  }
                },
                {
                  type: 'rect',
                  id: `bottom-box-${index}`,
                  slient: true,
                  invisible: width <= 0,
                  x: position[0],
                  y: legendHeight + brushTextHeight + (rowHeight + rowGap),
                  z: 1,
                  shape: { width, height: brushHeight, r: 3 },
                  style: {
                    fill: 'rgba(0, 0, 0, 0.05)', // --acx-primary-white 5%
                    stroke: cssStr('--acx-accents-blue-50'),
                    lineDash: 2,
                    lineDashOffset: 2,
                    lineWidth: 2
                  }
                }
              ]
            }
          })
        }
      ]
    }
  })
}

export function useDataZoom (
  eChartsRef: RefObject<ReactECharts>,
  chartBoundary: number[],
  setBoundary: Dispatch<SetStateAction<{ min: number, max: number }>>
) {
  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)

  const onDatazoomCallback = useCallback((e: unknown) => {
    const event = e as unknown as OnDatazoomEvent
    if (event.batch[0].startValue === chartBoundary[0] &&
      event.batch[0].endValue === chartBoundary[1]) {
      setCanResetZoom(false)
    } else {
      setCanResetZoom(true)
    }
    setBoundary({
      min: event.batch[0].startValue,
      max: event.batch[0].endValue
    })
  }, [chartBoundary, setBoundary])

  useEffect(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
    echartInstance.on('datazoom', onDatazoomCallback)
    return () => {
      if (echartInstance && !echartInstance.isDisposed?.() && echartInstance.off) {
        echartInstance.off('datazoom', onDatazoomCallback)
      }
    }
  }, [eChartsRef, onDatazoomCallback])

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'dataZoom',
      batch: [{ startValue: chartBoundary[0], endValue: chartBoundary[1] }]
    })
  }, [eChartsRef, chartBoundary ])

  useEffect(() => { resetZoomCallback() }, [resetZoomCallback])

  return { canResetZoom, resetZoomCallback }
}

export function useDotClick (
  eChartsRef: RefObject<ReactECharts>,
  setSelected: Dispatch<SetStateAction<number | undefined>>,
  onDotClick: ((param:unknown) => void) | undefined
){
  const onDotClickCallback = useCallback(function (params: {
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
    echartInstance.on('click', onDotClickCallback)
    return () => {
      if (echartInstance && !echartInstance.isDisposed?.() && echartInstance.off) {
        echartInstance.off('click', onDotClickCallback)
      }
    }
  }, [eChartsRef, onDotClickCallback])
}

export function useLegendSelectChanged (
  eChartsRef: RefObject<ReactECharts>,
  setSelectedLegend: Dispatch<SetStateAction<Record<string, boolean>>>
){
  const onLegendChangedCallback = useCallback((e: unknown) => {
    const event = e as unknown as { selected: Record<string, boolean> }
    if(Object.keys(event.selected).every(key => event.selected[key] === false)){
      setSelectedLegend(Object.keys(event.selected).reduce((selected, label) => {
        selected[label as string] = true
        return selected
      }, {} as Record<string, boolean>))
    }
    else{
      setSelectedLegend(event.selected)
    }
  }, [setSelectedLegend])

  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('legendselectchanged', onLegendChangedCallback)
    return () => {
      if (echartInstance && !echartInstance.isDisposed?.() && echartInstance.off) {
        echartInstance.off('legendselectchanged', onLegendChangedCallback)
      }
    }
  }, [eChartsRef, onLegendChangedCallback])
}

export const useBoundaryChange = (
  eChartsRef: RefObject<ReactECharts>,
  chartLayoutConfig: Record<string, number>,
  chartBoundary: ConfigChangeChartProps['chartBoundary'],
  brushWidth: number,
  onBrushPositionsChange?: (params: number[][]) => void
) => {
  const debouncedBrushChange = useRef(debounce((brush)=>{
    onBrushPositionsChange?.(brush)
  }, 1000))

  useEffect(()=>{
    debouncedBrushChange.current = debounce((brush)=>{
      onBrushPositionsChange?.(brush)
    }, 1000)
  }, [ onBrushPositionsChange ])

  const [boundary, setBoundary] = useState(getInitBoundary(chartBoundary))
  const [brushPositions, setBrushPositions] =
    useState(getInitBrushPositions(chartBoundary, brushWidth))

  useEffect(()=>{
    if(chartBoundary[0] === boundary.min &&
      chartBoundary[1] === boundary.max ) return
    setBoundary(getInitBoundary(chartBoundary))
    setBrushPositions(getInitBrushPositions(chartBoundary, brushWidth))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartBoundary, brushWidth])

  useEffect(() => {
    const newShowAreas = brushPositions.actual
      .map((_, index)=> adjustAfterBoundaryChanged(boundary, brushPositions.actual, index))
    const newBrushPositions = { ...brushPositions, show: newShowAreas }
    setBrushPositions(newBrushPositions)
    draw(eChartsRef, chartLayoutConfig, newBrushPositions, boundary, setBrushPositions )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundary])

  useEffect(() => {
    debouncedBrushChange.current(brushPositions.actual)
  }, [brushPositions])

  return { boundary, brushPositions, setBoundary, setBrushPositions }
}

export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
  const [ time ] = (Array.isArray(params)
    ? params[0].data : params.data) as [number]
  return renderToString(
    <TooltipWrapper>
      <time dateTime={new Date(time).toJSON()}>{
        formatter(DateFormatEnum.DateTimeFormat)(time) as string}</time>
    </TooltipWrapper>
  )
}

export const getTooltipCoordinate = (y: number) =>
  (point: [number, number]) => [point[0] + 12, y] // 12 for gap between tooltip and tracker

export const hexToRGB = (hex: string) =>
  `rgb(${hex.match(/[0-9A-F]{1,2}/g)?.map(hex => parseInt(hex, 16)).join(',')})`
export const getSelectedDot = (color: string) =>
  // eslint-disable-next-line max-len
  `image://data:image/svg+xml;utf8,<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 5.5C10 7.98528 7.98528 10 5.5 10C3.01472 10 1 7.98528 1 5.5C1 3.01472 3.01472 1 5.5 1C7.98528 1 10 3.01472 10 5.5ZM11 5.5C11 8.53757 8.53757 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0C8.53757 0 11 2.46243 11 5.5ZM5.5 9C7.433 9 9 7.433 9 5.5C9 3.567 7.433 2 5.5 2C3.567 2 2 3.567 2 5.5C2 7.433 3.567 9 5.5 9Z" fill="${color}"/></svg>`
export const getSymbol = (selected: number) =>
  (value: [number, string, ConfigChange]) => (value[2].id !== selected)
    ? 'circle'
    : getSelectedDot(hexToRGB(getConfigChangeEntityTypeMapping()
      .filter(({ key }) => key === value[2].type)[0].color))