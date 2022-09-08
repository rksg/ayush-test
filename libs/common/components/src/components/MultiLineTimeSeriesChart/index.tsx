import { useRef, useEffect } from 'react'

import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'

import { MultiLineTimeSeriesChartData } from '@acx-ui/analytics/utils'

import { cssStr }              from '../../theme/helper'
import {
  gridOptions,
  legendOptions,
  legendTextStyleOptions,
  xAxisOptions,
  yAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  tooltipOptions,
  timeSeriesTooltipFormatter
} from '../Chart/helper'

import type { EChartsOption, ECharts } from 'echarts'
import type { EChartsReactProps }      from 'echarts-for-react'

interface MultiLineTimeSeriesChartProps
  <TChartData extends MultiLineTimeSeriesChartData,
  ChartMarker extends { startTime: string, endTime: string }>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[],
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: (value: unknown) => string | null,
    // markers?: Partial<Incident>[],
    markers?: ChartMarker[],
    areaColor?: string,
    yAxisProps?: {
      max: number,
      min: number
    }
    disableLegend?: boolean,
    handleMarkedAreaClick?: (props: ChartMarker) => void
  }

export function MultiLineTimeSeriesChart
  <TChartData extends MultiLineTimeSeriesChartData,
  ChartMarker extends { startTime: string, endTime: string }>
({
  data,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  markers,
  areaColor,
  yAxisProps,
  disableLegend,
  handleMarkedAreaClick,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData, ChartMarker>) {
  const eChartsRef = useRef<ReactECharts>(null)

  const startEndTimes = data.map(datum => {
    return {
      start: datum.data[0][0],
      end: datum.data[datum.data.length - 1][0]
    }
  })

  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('click', 'series.line', function (params) {
      const markedAreaProps = (params.data as unknown as { data: ChartMarker }).data
      handleMarkedAreaClick?.(markedAreaProps)
    })
  }, [eChartsRef])
  
  const option: EChartsOption = {
    color: props.lineColors || [
      cssStr('--acx-accents-blue-30'),
      cssStr('--acx-accents-blue-50'),
      cssStr('--acx-accents-orange-50'),
      cssStr('--acx-semantics-yellow-40')
    ],
    grid: { ...gridOptions() },
    legend: {
      ...legendOptions(),
      textStyle: legendTextStyleOptions(),
      data: data.map(datum => datum[legendProp]) as unknown as string[]
    },
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      formatter: timeSeriesTooltipFormatter(dataFormatter)
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter
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
    dataZoom: [
      {
        id: 'zoom',
        type: 'inside',
        orient: 'horizontal',
        minValueSpan: 30 * moment.duration(
          moment(startEndTimes[0].end).diff(moment(startEndTimes[0].start))).asSeconds(),
        moveOnMouseMove: false,
        moveOnMouseWheel: false
      }
    ],
    series: data.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data,
      type: 'line',
      smooth: true,
      symbol: 'none',
      z: 1,
      zlevel: 1,
      lineStyle: { width: 1 },
      markArea: {
        itemStyle: {
          opacity: 0.4,
          color: areaColor
        },
        data: markers?.map(mark => {
          return [
            {
              xAxis: mark.startTime,
              data: mark
            },
            {
              xAxis: mark.endTime
            }
          ]
        })
      }
    }))
  }

  if (option && disableLegend === true) { delete(option.legend) }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option}
      ref={eChartsRef}  
    />
  )
}
