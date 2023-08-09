import {
  RefCallback,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react'

import ReactECharts       from 'echarts-for-react'
import { isEmpty, sumBy } from 'lodash'
import { useIntl }        from 'react-intl'

import { TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { formatter }           from '@acx-ui/formatter'
import type { TimeStampRange } from '@acx-ui/types'

import {
  gridOptions,
  legendOptions,
  legendTextStyleOptions,
  dataZoomOptions,
  xAxisOptions,
  yAxisOptions,
  axisLabelOptions,
  dateAxisFormatter,
  tooltipOptions,
  timeSeriesTooltipFormatter,
  ChartFormatterFn,
  qualitativeColorSet,
  toolboxDataZoomOptions
}                             from '../Chart/helper'
import { ResetWrapper, ResetButton } from '../Chart/styledComponents'
import { useDataZoom }               from '../Chart/useDataZoom'
import { useLegendSelectChanged }    from '../Chart/useLegendSelectChanged'

import type { EChartsOption }     from 'echarts'
import type { EChartsReactProps } from 'echarts-for-react'

export interface StackedAreaChartProps
  <TChartData extends TimeSeriesChartData>
  extends Omit<EChartsReactProps, 'option' | 'opts'> {
    type?: 'smooth' | 'step'
    data: TChartData[]
    legendProp?: keyof TChartData /** @default 'name' */
    legendFormatter?: string | ((name: string) => string)
    yAxisProps?: {
      max?: number
      min?: number
    }
    stackColors?: string[]
    dataFormatter?: ChartFormatterFn
    seriesFormatters?: Record<string, ChartFormatterFn>
    tooltipTotalTitle?: string
    disableLegend?: boolean
    chartRef?: RefCallback<ReactECharts>
    zoom?: TimeStampRange
    onDataZoom?: (range: TimeStampRange) => void
  }

export function getSeriesTotal <DataType extends TimeSeriesChartData> (
  series: DataType[],
  tooltipTotalTitle: string
) {
  return {
    key: 'total',
    name: tooltipTotalTitle,
    show: false,
    data: series[0].data.map((point, index)=>{
      const total = sumBy(series, (datum) => {
        const value = datum.data[index][1]
        return typeof value === 'number' ? value : 0
      })
      return [ point[0], total ]
    })
  } as DataType
}

export function StackedAreaChart <
  TChartData extends TimeSeriesChartData,
> ({
  type = 'smooth',
  data: initialData,
  legendProp = 'name' as keyof TChartData,
  legendFormatter,
  yAxisProps,
  dataFormatter = formatter('countFormat'),
  seriesFormatters,
  tooltipTotalTitle,
  disableLegend,
  ...props
}: StackedAreaChartProps<TChartData>) {
  const eChartsRef = useRef<ReactECharts>(null)
  useImperativeHandle(props.chartRef, () => eChartsRef.current!)
  useLegendSelectChanged(eChartsRef)

  const { $t } = useIntl()

  disableLegend = Boolean(disableLegend)
  const [canResetZoom, resetZoomCallback] =
    useDataZoom<TChartData>(eChartsRef, true, initialData, props.zoom, props.onDataZoom)

  const data = useMemo(() => {
    return tooltipTotalTitle && !isEmpty(initialData)
      ? initialData.concat(getSeriesTotal<TChartData>(initialData, tooltipTotalTitle))
      : initialData
  }, [tooltipTotalTitle, initialData])

  const option: EChartsOption = {
    animation: false,
    color: props.stackColors || qualitativeColorSet(),
    grid: { ...gridOptions({ disableLegend, rightGridOffset: 5 }) },
    ...(disableLegend ? {} : {
      legend: {
        ...legendOptions(),
        textStyle: legendTextStyleOptions(),
        formatter: legendFormatter || '{name}' ,
        data: initialData.map(datum => datum[legendProp]) as unknown as string[]
      }
    }),
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      formatter: timeSeriesTooltipFormatter(
        data,
        { ...seriesFormatters, default: dataFormatter }
      )
    },
    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: dateAxisFormatter()
      }
    },
    yAxis: {
      ...yAxisOptions(),
      ...(yAxisProps || { minInterval: 1 }),
      type: 'value',
      axisLabel: {
        ...axisLabelOptions(),
        formatter: function (value: number) {
          return dataFormatter(value)
        }
      }
    },
    series: initialData.map(datum => ({
      name: datum[legendProp] as unknown as string,
      data: datum.data.map(([time, value]) => [time, (value === null) ? 0 : value]),
      type: 'line',
      silent: true,
      stack: 'value',
      smooth: true,
      step: type === 'step' ? 'start' : false,
      symbol: 'none',
      lineStyle: { width: 1 },
      areaStyle: { opacity: 0.5 }
    })),
    toolbox: toolboxDataZoomOptions,
    dataZoom: dataZoomOptions(initialData)
  }

  return (
    <ResetWrapper>
      <ReactECharts
        {...props}
        ref={eChartsRef}
        opts={{ renderer: 'svg' }}
        option={option}
      />
      {canResetZoom && <ResetButton
        size='small'
        onClick={resetZoomCallback}
        children={$t({ defaultMessage: 'Reset Zoom' })}
        $disableLegend={disableLegend}
      />}
    </ResetWrapper>
  )
}
