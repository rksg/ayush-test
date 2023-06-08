import { useRef, useState } from 'react'

import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'

import { cssStr }          from '../../theme/helper'
import {
  legendTextStyleOptions,
  tooltipOptions,
  axisLabelOptions,
  xAxisOptions,
  dateAxisFormatter,
  dataZoomOptions,
  toolboxDataZoomOptions
} from '../Chart/helper'


import {
  ConfigChangeChartProps,
  useDataZoom,
  useDotClick,
  useLegendSelectChanged,
  useBoundaryChange,
  chartRowMapping,
  getSymbol,
  getChartLayoutConfig,
  tooltipFormatter
} from './helper'
import { ResetButton, ChartWrapper } from './styledComponents'

import type { EChartsOption, SeriesOption } from 'echarts'

export function ConfigChangeChart ({
  data,
  chartBoundary,
  selectedData,
  onDotClick,
  ...props
}: ConfigChangeChartProps) {

  const { $t } = useIntl()
  const eChartsRef = useRef<ReactECharts>(null)

  const chartLayoutConfig = getChartLayoutConfig(props.style?.width as number, chartRowMapping)
  const {
    chartPadding, rowHeight, xAxisHeight, brushWidth
  } = chartLayoutConfig

  const [selected, setSelected] = useState<number|undefined>(selectedData)
  const [selectedLegend, setSelectedLegend] = useState(
    chartRowMapping.map(({ label }) => label).reduce((selected, label) => {
      selected[label as string] = true
      return selected
    }, {} as Record<string, boolean>))

  useDotClick(eChartsRef, setSelected, onDotClick)
  useLegendSelectChanged(eChartsRef, setSelectedLegend)
  const { setBoundary } =
    useBoundaryChange(eChartsRef, chartLayoutConfig, chartBoundary, brushWidth)
  const { canResetZoom, resetZoomCallback } =
    useDataZoom(eChartsRef, true, chartBoundary, setBoundary)

  const option: EChartsOption = {
    animation: false,
    grid: {
      top: rowHeight + chartPadding,
      bottom: 0,
      left: chartPadding,
      right: chartPadding,
      width: (props.style?.width as number) - 2 * chartPadding,
      height: (chartRowMapping.length + 1) * rowHeight // 1 = bar
    },
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
      position: (point) => [point[0] + 12, rowHeight + chartPadding] // 10 for gap between tooltip and tracker
    },
    legend: {
      right: chartPadding,
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
            ...chartRowMapping.map(() => cssStr('--acx-neutrals-10')),
            ...Array(1).fill(0).map(() => cssStr('--acx-primary-white')) // bar
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
        ...chartRowMapping.map(({ label }) => label),
        ...Array(1).fill(0).map((_,index) => `placeholder${index}`) // bar
      ]
    },
    toolbox: toolboxDataZoomOptions,
    dataZoom: [ {
      ...dataZoomOptions([])[0],
      minValueSpan: 60 * 60 * 1000 // an hour
    }],
    series: chartRowMapping.slice().reverse().map(
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
    color: chartRowMapping.map(({ color }) => color).slice().reverse()
  }

  return (
    <ChartWrapper>
      <ReactECharts
        {...props}
        style={{
          ...props.style,
          WebkitUserSelect: 'none',
          height: (chartRowMapping.length + 2) * rowHeight + xAxisHeight // 2 = bar + legend
        }}
        ref={eChartsRef}
        option={option}
      />
      {canResetZoom && <ResetButton
        size='small'
        onClick={resetZoomCallback}
        children={$t({ defaultMessage: 'Reset Zoom' })}
      />}
    </ChartWrapper>
  )
}
