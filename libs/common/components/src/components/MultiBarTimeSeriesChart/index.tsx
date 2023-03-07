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

import type { TimeStampRange, TimeStamp } from '@acx-ui/types'
import { formatter, getIntl }             from '@acx-ui/utils'

import { cssNumber, cssStr } from '../../theme/helper'
import { ResetButton }       from '../Chart'
import {
  xAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  ChartFormatterFn
} from '../Chart/helper'

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

export interface MultiBarTimeSeriesChart extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: {
    color: string;
    key: string;
    name: string;
    show?: boolean;
    data: [TimeStamp, string, TimeStamp, number | null, string][];
  }[];
  chartBoundary: number[];
  zoomEnabled?: boolean;
  selectedData?: number;
  chartRef?: RefCallback<ReactECharts> | RefObject<ReactECharts>;
  hasXaxisLabel?: boolean;
  dataFormatter?: ChartFormatterFn;
  tooltipFormatter?: TooltipFormatterCallback<TopLevelFormatterParams>;
  seriesFormatters?: Record<string, ChartFormatterFn>;
  labelFormatter?: LabelFormatterCallback<unknown>;
  showToolTip?: boolean;
}
export const mapping = [{ key: 'SwitchStatus', series: 'Switch', color: 'green' }] as {
  key: string;
  series: string;
  color: string;
}[]

export function defaultLabelFormatter (
  data: { data: [TimeStamp, string, TimeStamp, number | null, string][] }[],
  params: CallbackDataParams
) {
  const { $t } = getIntl()
  let status = $t({ defaultMessage: 'Not Available' })
  data?.[0].data.forEach((dataPoint: [TimeStamp, string, TimeStamp, number | null, string]) => {
    const startTime = moment(dataPoint?.[0])
    const endTime = moment(dataPoint?.[2])
    if (moment(params.value as string).isBetween(startTime, endTime, null, '[]'))
      status =
        dataPoint[3] === 1
          ? $t({ defaultMessage: 'Connected' })
          : $t({ defaultMessage: 'Disconnected' })
  })
  return (
    formatter('dateTimeFormat')(params.value) +
    '\n' +
    $t({ defaultMessage: 'Status' }) +
    ': ' +
    status
  )
}

export const tooltipOptions = () =>
  ({
    textStyle: {
      color: cssStr('--acx-primary-white'),
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-body-5-font-size'),
      lineHeight: cssNumber('--acx-body-5-line-height'),
      fontWeight: cssNumber('--acx-body-font-weight')
    },
    backgroundColor: cssStr('--acx-primary-black'),
    borderRadius: 2,
    borderWidth: 0,
    padding: 8,
    confine: false,
    extraCssText: 'box-shadow: 0px 4px 8px rgba(51, 51, 51, 0.08); z-index: 4;'
  } as TooltipComponentOption)
export const renderCustomItem = (
  params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI
) => {
  const yValue = api?.value?.(1)
  const start = api?.coord?.([api?.value?.(0), yValue])
  const end = api?.coord?.([api?.value?.(2), yValue])
  const height = (api?.size as CallableFunction)?.([0, 1])?.[1]

  return {
    type: 'rect',
    shape: {
      x: start?.[0],
      y: start?.[1] - 9,
      width: end?.[0] - start?.[0],
      height: height
    },
    style: api?.style?.()
  }
}
export const useBarchartZoom = (
  eChartsRef: RefObject<ReactECharts>,
  zoomEnabled: boolean,
  onDataZoom?: (range: TimeStampRange, isReset: boolean) => void
): [boolean, () => void] => {
  const [canResetZoom, setCanResetZoom] = useState<boolean>(false)

  const onDatazoomCallback = useCallback(
    (e: unknown) => {
      const event = e as unknown as OnDatazoomEvent
      const firstBatch = event.batch?.[0]
      firstBatch && onDataZoom && onDataZoom([firstBatch.startValue, firstBatch.endValue], false)
      if (event.start === 0 && event.end === 100) {
        setCanResetZoom(false)
      } else {
        setCanResetZoom(true)
      }
    },
    [onDataZoom]
  )

  useEffect(() => {
    if (!eChartsRef?.current || !zoomEnabled) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
    echartInstance.on('datazoom', onDatazoomCallback)
  })

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts
    echartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
  }, [eChartsRef])

  return [canResetZoom, resetZoomCallback]
}

export function MultiBarTimeSeriesChart ({
  data,
  chartBoundary,
  selectedData,
  chartRef,
  tooltipFormatter,
  hasXaxisLabel,
  zoomEnabled = false,
  seriesFormatters,
  labelFormatter,
  showToolTip,
  ...props
}: MultiBarTimeSeriesChart) {
  const { $t } = useIntl()
  useImperativeHandle(chartRef, () => eChartsRef.current!)
  const chartPadding = 10
  const rowHeight = 12
  const xAxisHeight = hasXaxisLabel ? 30 : 0

  const eChartsRef = useRef<ReactECharts>(null)
  const chartWrapperRef = useRef(null)

  const [canResetZoom, resetZoomCallback] = useBarchartZoom(eChartsRef, zoomEnabled)

  const option: EChartsOption = {
    animation: false,
    grid: {
      top: 0,
      bottom: 0,
      left: chartPadding,
      right: 0,
      height: rowHeight
    },
    tooltip: {
      show: showToolTip,
      alwaysShowContent: showToolTip,
      ...tooltipOptions(),
      formatter: tooltipFormatter,
      position: 'top'
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
        show: false,
        lineStyle: { color: cssStr('--acx-neutrals-20') }
      },
      axisPointer: {
        show: true,
        snap: false,
        triggerTooltip: false,
        label: {
          ...(tooltipOptions() as Object),
          height: 40,
          show: true,
          formatter: labelFormatter
            ? labelFormatter
            : function (params) {
              return defaultLabelFormatter(data, params as unknown as CallbackDataParams)
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
      axisLabel: { show: false },
      splitArea: {
        show: true,
        areaStyle: {
          color: [cssStr('--acx-neutrals-20')]
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [cssStr('--acx-primary-white')],
          width: 4
        }
      },
      data: [...mapping.map(({ key }) => key)]
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

    series: data.map(({ key, data }) => {
      return {
        type: 'custom',
        name: key,
        renderItem: renderCustomItem as unknown as CustomSeriesRenderItem,
        itemStyle: {
          color: function (params: { data: [TimeStamp, string, TimeStamp, number | null, string] }){
            return params.data[4]
          }
        },
        data: data
      }
    }) as SeriesOption
  }
  return (
    <UI.Wrapper ref={chartWrapperRef} data-testid='MultiBarTimeSeriesChart'>
      <ReactECharts
        {...{
          ...props,
          style: {
            ...props.style,
            WebkitUserSelect: 'none',
            marginBottom: 0,
            width: props.style?.width as number,
            height: rowHeight + xAxisHeight + 20
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
