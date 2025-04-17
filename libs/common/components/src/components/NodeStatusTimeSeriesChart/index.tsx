import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
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
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { DateFormatEnum, formatter }      from '@acx-ui/formatter'
import type { TimeStampRange, TimeStamp } from '@acx-ui/types'
import { getIntl }                        from '@acx-ui/utils'

import { cssNumber, cssStr } from '../../theme/helper'
import { ResetButton }       from '../Chart'
import {
  xAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  ChartFormatterFn
} from '../Chart/helper'
import { useBarchartZoom, tooltipOptions, renderCustomItem } from '../MultiBarTimeSeriesChart'

import * as UI from './styledComponents'

import type {
  ECharts,
  EChartsOption,
  SeriesOption,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  TooltipComponentOption
} from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

type OnDatazoomEvent = {
  batch?: {
    startValue: number;
    endValue: number;
  }[];
  start?: number;
  end?: number;
}

export interface NodeStatusData {
  nodeId: string;
  nodeName: string;
  nodeLink?: string; // Optional URL for node navigation
  data: [TimeStamp, string, TimeStamp, number | null, string][];
}

export interface NodeStatusTimeSeriesChartProps extends Omit<EChartsReactProps, 'option' | 'opts'> {
  nodes: NodeStatusData[];
  chartBoundary: number[]; // [startTime, endTime]
  zoomEnabled?: boolean;
  selectedData?: number;
  chartRef?: RefCallback<ReactECharts> | RefObject<ReactECharts>;
  hasXaxisLabel?: boolean;
  dataFormatter?: ChartFormatterFn;
  tooltipFormatter?: TooltipFormatterCallback<TopLevelFormatterParams>;
  seriesFormatters?: Record<string, ChartFormatterFn>;
  labelFormatter?: LabelFormatterCallback<unknown>;
  showToolTip?: boolean;
  yAxisLabelMaxWidth?: number; // Add configurable max width for y-axis labels
}

export function defaultNodeStatusLabelFormatter (
  nodes: NodeStatusData[],
  params: CallbackDataParams
) {
  const { $t } = getIntl()
  const nodeStatuses: Record<string, string> = {}
  // Get timestamp from params - this will be the xAxisPointer position
  const currentTimestamp = params.value instanceof Array ? params.value[0] : params.value

  nodes.forEach(node => {
    let status = $t({ defaultMessage: 'Not Available' })

    for (const dataPoint of node.data) {
      const startTime = moment(dataPoint[0])
      const endTime = moment(dataPoint[2])

      if (moment(currentTimestamp).isBetween(startTime, endTime, null, '[]')) {
        status = dataPoint[3] === 1
          ? $t({ defaultMessage: 'Connected' })
          : $t({ defaultMessage: 'Disconnected' })
        break
      }
    }

    nodeStatuses[node.nodeName] = status
  })

  let formattedTooltip = formatter(DateFormatEnum.DateTimeFormat)(currentTimestamp) + '\n'

  Object.entries(nodeStatuses).forEach(([nodeName, status]) => {
    formattedTooltip += `${nodeName}: ${status}\n`
  })

  return formattedTooltip.trim()
}

export function NodeStatusTimeSeriesChart ({
  nodes,
  chartBoundary,
  selectedData,
  chartRef,
  tooltipFormatter,
  hasXaxisLabel = true,
  zoomEnabled = false,
  seriesFormatters,
  labelFormatter,
  showToolTip,
  yAxisLabelMaxWidth = 120, // Default max width is 120px
  ...props
}: NodeStatusTimeSeriesChartProps) {
  const { $t } = useIntl()
  const eChartsRef = useRef<ReactECharts>(null)
  const chartWrapperRef = useRef(null)

  useImperativeHandle(chartRef, () => eChartsRef.current!)

  const chartPadding = 10
  const rowHeight = 18
  const barHeight = 12 // Actual height of the bar
  const seriesGap = 10 // Gap between series
  const actualRowHeight = rowHeight + seriesGap // Total height including gap
  const xAxisHeight = hasXaxisLabel ? 30 : 0
  const totalHeight = nodes.length * actualRowHeight + xAxisHeight + 20 - seriesGap // Subtract last gap

  // Add left padding to accommodate the Y-axis labels with the specified max width
  const leftPadding = yAxisLabelMaxWidth + 8 // Add a little extra space for better visual appearance

  const [canResetZoom, resetZoomCallback] = useBarchartZoom(eChartsRef, zoomEnabled)

  // Custom render item function to handle the spacing between bars
  const renderItemWithSpacing = (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI
  ) => {
    const yValue = api?.value?.(1)
    const start = api?.coord?.([api?.value?.(0), yValue])
    const end = api?.coord?.([api?.value?.(2), yValue])
    const height = barHeight // Fixed bar height

    return {
      type: 'rect',
      shape: {
        x: start?.[0],
        y: start?.[1] - height / 2, // Center the bar in the row
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
      left: leftPadding, // Use the calculated left padding
      right: 0,
      height: totalHeight - xAxisHeight
    },
    tooltip: {
      show: false,//showToolTip,
      alwaysShowContent: showToolTip,
      ...tooltipOptions(),
      // formatter: tooltipFormatter,
      // formatter: function (params) {
      //   // For array params (multiple series), use the first one
      //   const param = Array.isArray(params) ? params[0] : params

      //   // Get the xAxisPointer value from the axis component
      //   // If the chart instance is available, you can get the current axis pointer value
      //   const chart = eChartsRef.current?.getEchartsInstance()
      //   const axisPointerValue = chart?.getOption()?.xAxis?.[0]?.axisPointer?.value

      //   // Use axisPointerValue if available, otherwise fall back to the param value
      //   const timestamp = axisPointerValue || param.value instanceof Array ? param.value[0] : param.value
      //   console.log(new Date(timestamp))
      //   // Create a modified param object with the correct timestamp for the defaultNodeStatusLabelFormatter
      //   const modifiedParam = {
      //     ...param,
      //     value: timestamp
      //   }

      //   return defaultNodeStatusLabelFormatter(nodes, modifiedParam as unknown as CallbackDataParams)
      // },
      // position: 'top',
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        snap: true
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
            show: true,
            lineStyle: { color: cssStr('--acx-neutrals-40') }
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
        show: true,
        snap: false,
        triggerTooltip: false,
        handle: {
          show: false
        },
        value: selectedData,
        status: selectedData ? 'show' : 'hide',
        label: {
          // ...(tooltipOptions() as Object),
          textStyle: {
            color: cssStr('--acx-primary-white'),
            fontFamily: cssStr('--acx-neutral-brand-font'),
            fontSize: cssNumber('--acx-body-5-font-size'),
            lineHeight: cssNumber('--acx-body-5-line-height'),
            fontWeight: cssNumber('--acx-body-font-weight')
          },
          backgroundColor: cssStr('--acx-neutrals-80'),
          padding: [4, 28],
          borderRadius: 4,
          show: true,
          confine: false,
          overflow: 'breakAll',
          formatter: labelFormatter
            ? labelFormatter
            : function (params) {
              return defaultNodeStatusLabelFormatter(nodes, params as unknown as CallbackDataParams)
            },
          verticalAlign: 'center',
          // align: 'center',

          // margin: -30,
          position: function (pos, params, dom, rect, size) {
            // Get chart dimensions
            const chartWidth = size.viewSize[0]
            const labelWidth = size.contentSize[0]

            // Calculate preferred position (centered above pointer)
            const preferredLeft = pos[0] - labelWidth / 2

            // Check if label would extend beyond chart boundaries with some margin
            const margin = -50 // Margin from edge

            // If not enough space on left, align left edge with chart left edge + margin
            if (preferredLeft < margin) {
              return [margin, pos[1]]  // Remove the gap by setting y to pos[1]
            }

            // If not enough space on right, align right edge with chart right edge - margin
            if (preferredLeft + labelWidth > chartWidth - margin) {
              return [chartWidth - labelWidth - margin, pos[1]]  // Remove the gap by setting y to pos[1]
            }

            // Otherwise use default centered position
            return [preferredLeft, pos[1]]  // Remove the gap by setting y to pos[1]
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
        show: true,
        formatter: (value: string) => {
          const node = nodes.find(n => n.nodeId === value)
          if (!node) return value

          // If nodeLink exists, create a hyperlink with the node name
          if (node.nodeLink) {
            // eslint-disable-next-line max-len
            return `<a href="${node.nodeLink}" style="color: var(--acx-theme-primary-color); text-decoration: underline;">${node.nodeName}</a>`
          }

          // Otherwise return just the node name
          return node.nodeName
        },
        color: cssStr('--acx-neutrals-100'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-body-4-font-size'),
        lineHeight: cssNumber('--acx-body-4-line-height'),
        fontWeight: cssNumber('--acx-body-font-weight'),
        margin: seriesGap / 2, // Add margin to labels for better alignment
        overflow: 'break', // Changed from 'truncate' to 'break' to handle long text better
        width: yAxisLabelMaxWidth, // Set the max width for y-axis labels
        rich: {
          // Add rich text formatter for better text handling
          text: {
            lineHeight: 16,
            align: 'left'
          }
        },
        padding: [0, 8, 0, 0], // Add padding to prevent text from being cut off at edges
        hideOverlap: true, // Hide labels that would overlap
        backgroundColor: 'transparent',
        renderMode: 'richText' // Enable rich text rendering for HTML
      },
      splitArea: {
        show: false // Changed from true to false to remove the gray background
      },
      splitLine: {
        show: false, // Changed from true to false to remove horizontal gridlines between series
        lineStyle: {
          color: [cssStr('--acx-neutrals-20')],
          width: 1
        }
      },
      data: nodes.map(node => node.nodeId),
      boundaryGap: true // Add spacing between categories
    },
    ...(zoomEnabled
      ? {
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
        ]
      }
      : { toolbox: { show: false } }),

    series: nodes.map((node) => {
      return {
        type: 'custom',
        name: node.nodeName,
        yAxisIndex: 0,
        renderItem: renderItemWithSpacing as unknown as CustomSeriesRenderItem,
        itemStyle: {
          // eslint-disable-next-line max-len
          color: function (params: { data: [TimeStamp, string, TimeStamp, number | null, string] }) {
            return params.data[4]
          }
        },
        data: node.data.map(item => [item[0], node.nodeId, item[2], item[3], item[4]])
      }
    }) as SeriesOption
  }

  // Add event handler for hyperlink clicks
  useEffect(() => {
    const chart = eChartsRef.current?.getEchartsInstance()
    if (chart) {
      // Remove existing click event if any
      chart.off('click')

      // Add click event handler for hyperlinks in y-axis labels
      chart.on('click', (params: any) => {
        // Check if the click is on a hyperlink element
        if (params.targetType === 'axisLabel' && params.componentType === 'yAxis') {
          const node = nodes.find(n => n.nodeId === params.value)
          if (node?.nodeLink) {
            window.open(node.nodeLink, '_blank')
          }
        }
      })
    }

    return () => {
      // Clean up event listener when component unmounts
      eChartsRef.current?.getEchartsInstance()?.off('click')
    }
  }, [nodes])

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
      {canResetZoom && (
        <ResetButton
          size='small'
          onClick={resetZoomCallback}
          children={$t({ defaultMessage: 'Reset Zoom' })}
          $disableLegend={true}
          style={{ top: -24 }}
        />
      )}
    </UI.Wrapper>
  )
}
