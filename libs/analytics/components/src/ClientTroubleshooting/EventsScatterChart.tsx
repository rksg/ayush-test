import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState, RefCallback, useImperativeHandle } from 'react'

import { Row, Col }                                           from 'antd'
import ReactECharts                                           from 'echarts-for-react'
import {  TooltipFormatterCallback, TopLevelFormatterParams } from 'echarts/types/dist/shared'


import {
  tooltipOptions,
  axisLabelOptions,
  xAxisOptions,
  dateAxisFormatter,
  cssStr
} from '@acx-ui/components'

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
  category: string
}
export interface EventsScatterChartProps
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    data: Event[]
    chartBoundary: number[]
    selectedData?: number, // id
    brushWidth?: number, // default 1 day = 24 * 60 * 60 * 1000
    onDotClick?: (params: unknown) => void,
    title: string,
    chartRef?: RefCallback<ReactECharts>,
    tooltopEnabled : boolean,
    tooltipFormatter: TooltipFormatterCallback<TopLevelFormatterParams>
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
export function EventsScatterChart ({
  data,
  chartBoundary,
  selectedData,
  onDotClick,
  chartRef,
  tooltopEnabled,
  tooltipFormatter,
  ...props
}: EventsScatterChartProps) {

  const chartPadding = 10
  const rowHeight = 20
  const eChartsRef = useRef<ReactECharts>(null)
  useImperativeHandle(chartRef, () => eChartsRef.current!)

  // This is for popup selection
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
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
          brushStyle: { color: 'rgba(0, 0, 0, 0.05)' },
          icon: { back: 'path://', zoom: 'path://' }
        }
      }
    },
    ...(tooltopEnabled ? {
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
        minValueSpan: 60 * 60 * 1000
      }
    ],

    series: [
      {
        type: 'scatter',
        name: 'CT Events series',
        symbolSize: 10,
        animation: false,
        data: data.length > 1 ? data
          .map((record) => [record.start, 'CT Events series', record]) : [0,0],
        itemStyle: {
          color: function (params) {
            const eventObj = Array.isArray(params.data) ? params.data[2] : ''
            const { category } = eventObj as unknown as Event
            return cssStr(
              eventColorByCategory[
                category as keyof typeof eventColorByCategory
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
        {data.length}
      </Col>
      <Col span={19}>
        <ReactECharts
          {...{
            ...props,
            style: {
              ...props.style,
              WebkitUserSelect: 'none',
              width: 'auto',
              height: 1 * rowHeight
            }
          }}
          ref={eChartsRef}
          option={option}
        />
      </Col>
    </Row>
  )
}
