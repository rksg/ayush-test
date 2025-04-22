/* eslint-disable max-len */
import {
  RefObject,
  useRef,
  RefCallback,
  useImperativeHandle
} from 'react'

import ReactECharts    from 'echarts-for-react'
import {
  TooltipFormatterCallback,
  TopLevelFormatterParams,
  CustomSeriesRenderItem,
  LabelFormatterCallback,
  CallbackDataParams
} from 'echarts/types/dist/shared'
import { reverse } from 'lodash'

import {
  cssStr,
  xAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  ChartFormatterFn
}              from '@acx-ui/components'
import type { TimeStamp } from '@acx-ui/types'

import * as UI                                                           from './styledComponents'
import { NodeStatusData }                                                from './type'
import { tooltipOptions, defaultNodeStatusLabelFormatter, getChartData } from './utils'

import type {
  EChartsOption,
  SeriesOption,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams
} from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

const chartPadding = 10
const rowHeight = 10
const barHeight = 12
const seriesGap = 12
const actualRowHeight = rowHeight + seriesGap
const leftPadding = chartPadding

export interface NodeStatusTimeSeriesChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  nodes: NodeStatusData[];
  chartBoundary: number[]; // [startTime, endTime]
  selectedData?: number;
  chartRef?: RefCallback<ReactECharts> | RefObject<ReactECharts>;
  hasXaxisLabel?: boolean;
  dataFormatter?: ChartFormatterFn;
  tooltipFormatter?: TooltipFormatterCallback<TopLevelFormatterParams>;
  seriesFormatters?: Record<string, ChartFormatterFn>;
  labelFormatter?: LabelFormatterCallback<unknown>;
  showToolTip?: boolean;
}

export function NodeStatusTimeSeriesChart ({
  nodes,
  chartBoundary,
  selectedData,
  chartRef,
  tooltipFormatter,
  hasXaxisLabel = true,
  seriesFormatters,
  labelFormatter,
  showToolTip,
  ...props
}: NodeStatusTimeSeriesChartProps) {
  const eChartsRef = useRef<ReactECharts>(null)
  const chartWrapperRef = useRef(null)
  // since cannot get current xAxisPointer timestamp from tooltip formatter callback function
  const xAxisPointerRef = useRef(null)

  const xAxisHeight = hasXaxisLabel ? 30 : 0
  const totalHeight = nodes.length * actualRowHeight + xAxisHeight + 20 - seriesGap

  useImperativeHandle(chartRef, () => eChartsRef.current!)

  const renderItemWithSpacing = (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI
  ) => {
    const yValue = api?.value?.(1)
    const start = api?.coord?.([api?.value?.(0), yValue])
    const end = api?.coord?.([api?.value?.(2), yValue])
    const height = barHeight

    return {
      type: 'rect',
      shape: {
        x: start?.[0],
        y: start?.[1] - height / 2,
        width: end?.[0] - start?.[0],
        height: height
      },
      style: api?.style?.()
    }
  }

  const option: EChartsOption = {
    animation: false,
    grid: {
      top: 0,
      bottom: xAxisHeight,
      left: leftPadding,
      right: 0,
      height: totalHeight - xAxisHeight
    },
    tooltip: {
      show: true,
      alwaysShowContent: false,
      ...tooltipOptions(),
      formatter: function () {
        const timestamp = xAxisPointerRef.current
        if (!timestamp) return ''

        return defaultNodeStatusLabelFormatter(nodes, { value: timestamp } as unknown as CallbackDataParams)
      },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: 'transparent' },
        label: { show: false }
      }
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
            show: false
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
        show: false
      },
      axisPointer: {
        show: true,
        snap: false,
        triggerTooltip: true,
        handle: {
          show: false
        },
        value: selectedData,
        status: selectedData ? 'show' : 'hide',
        label: {
          ...(tooltipOptions() as Object),
          backgroundColor: cssStr('--acx-neutrals-80'),
          show: false,
          formatter: labelFormatter
            ? labelFormatter
            : function (params) {
              const currentTimestamp = params.value instanceof Array ? params.value[0] : params.value
              xAxisPointerRef.current = currentTimestamp
              return ''
            }
        },
        lineStyle: {
          color: cssStr('--acx-neutrals-70'),
          type: 'solid',
          width: 1
        }
      }
    },
    yAxis: {
      type: 'category',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: false
      },
      splitArea: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [cssStr('--acx-primary-white')],
          width: 1
        }
      },
      boundaryGap: true
    },
    toolbox: { show: false },
    series: reverse(nodes).map((node) => {
      return {
        type: 'custom',
        name: node.nodeName,
        renderItem: renderItemWithSpacing as unknown as CustomSeriesRenderItem,
        itemStyle: {
          color: function (params: { data: [TimeStamp, string, TimeStamp, number | null, string] }) {
            return params.data[4]
          },
          opacity: 1
        },
        data: getChartData(node, chartBoundary as [TimeStamp, TimeStamp])
      }
    }) as SeriesOption
  }

  return (
    <UI.Wrapper ref={chartWrapperRef} data-testid='NodeStatusTimeSeriesChart'>
      <ReactECharts
        {...{
          ...props,
          style: {
            ...props.style,
            WebkitUserSelect: 'none',
            marginBottom: 0,
            width: props.style?.width as number,
            height: totalHeight
          }
        }}
        ref={eChartsRef}
        option={option}
      />
    </UI.Wrapper>
  )
}
