import ReactECharts from 'echarts-for-react'

import type { Incident, MultiLineTimeSeriesChartData } from '@acx-ui/analytics/utils'

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

import type { EChartsOption, ECharts }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'
import { useRef, useEffect, useCallback } from 'react'

interface MultiLineTimeSeriesChartProps
  <TChartData extends MultiLineTimeSeriesChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: TChartData[]
    /** @default 'name' */
    legendProp?: keyof TChartData,
    lineColors?: string[],
    dataFormatter?: (value: unknown) => string | null,
    marker?: Partial<Incident>[],
    areaColor?: string
  }

export function MultiLineTimeSeriesChart
  <TChartData extends MultiLineTimeSeriesChartData>
({
  data,
  legendProp = 'name' as keyof TChartData,
  dataFormatter,
  marker,
  areaColor,
  ...props
}: MultiLineTimeSeriesChartProps<TChartData>) {
  const eChartsRef = useRef<ReactECharts>(null)

  useCallback(() => {
    console.log('test1')
    if (!eChartsRef || !eChartsRef.current) return 
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts
    echartInstance.on('click', (e) => {
      console.log(e)
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
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return (dataFormatter && dataFormatter(value)) || `${value}`
        }
      }
    },
    series: data.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1 },
      markArea: {
        itemStyle: {
          opacity: 0.4,
          color: areaColor
        },
        data: marker?.map(mark => {
          return [
            {
              xAxis: mark.startTime
            },
            {
              xAxis: mark.endTime
            }
          ]
        })
      }
    }))
  }

  return (
    <ReactECharts
      {...props}
      opts={{ renderer: 'svg' }}
      option={option}
      ref={eChartsRef}  
    />
  )
}
