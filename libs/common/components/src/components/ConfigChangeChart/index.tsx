import { useEffect, useRef, useState } from 'react'

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
  getConfigChangeEntityTypeMapping,
  getSymbol,
  getChartLayoutConfig,
  tooltipFormatter,
  getTooltipCoordinate
} from './helper'
import { ResetButton, ChartWrapper } from './styledComponents'

import type { EChartsOption, SeriesOption } from 'echarts'

export function ConfigChangeChart ({
  data,
  chartBoundary,
  selectedData,
  onDotClick,
  onBrushPositionsChange,
  chartZoom,
  setChartZoom,
  setInitialZoom,
  setLegend,
  setSelectedData,
  setPagination,
  ...props
}: ConfigChangeChartProps) {

  const { $t } = useIntl()
  const eChartsRef = useRef<ReactECharts>(null)

  const chartRowMapping = getConfigChangeEntityTypeMapping()
  const chartLayoutConfig = getChartLayoutConfig(props.style?.width as number, chartRowMapping)
  const {
    chartPadding, legendHeight, brushTextHeight, rowHeight, rowGap,
    xAxisHeight, brushWidth, symbolSize
  } = chartLayoutConfig

  const [selected, setSelected] = useState<number|undefined>(selectedData?.id)

  useEffect(() => {
    setSelected(selectedData?.filterId)
  }, [selectedData])

  const [selectedLegend, setSelectedLegend] = useState(
    chartRowMapping.map(({ label }) => label).reduce((selected, label) => {
      selected[label as string] = true
      return selected
    }, {} as Record<string, boolean>))

  useEffect(() => {
    setLegend?.(selectedLegend)
    const selectedConfig = data.filter(i => i.id === selectedData?.id)
    const selectedType = chartRowMapping.filter(
      ({ key }) => key === selectedConfig[0]?.type)[0]?.label

    selectedLegend[selectedType] === false && setSelectedData?.(null)
    setPagination?.({
      current: Math.ceil((selectedConfig[0]?.filterId! + 1) / 10),
      pageSize: 10
    })
  }, [selectedLegend, data.length])

  useDotClick(eChartsRef, setSelected, onDotClick)
  useLegendSelectChanged(eChartsRef, setSelectedLegend)
  const { setBoundary } = useBoundaryChange(
    eChartsRef, chartLayoutConfig, chartBoundary, brushWidth, onBrushPositionsChange)
  const { canResetZoom, resetZoomCallback } =
    useDataZoom(eChartsRef, chartBoundary, setBoundary, chartZoom, setChartZoom, setInitialZoom)

  const option: EChartsOption = {
    animation: false,
    grid: {
      top: legendHeight + brushTextHeight ,
      bottom: 0,
      left: chartPadding,
      right: chartPadding,
      width: (props.style?.width as number) - 2 * chartPadding,
      height: (chartRowMapping.length + 1) * (rowHeight + rowGap) // +1 = bar
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
      position: getTooltipCoordinate(legendHeight + brushTextHeight)
    },
    legend: {
      right: chartPadding,
      icon: 'circle',
      itemWidth: symbolSize,
      itemGap: 7,
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
          width: 4
        }
      },
      data: [
        ...chartRowMapping.map(({ label }) => label),
        ...Array(1).fill(0).map((_,index) => `placeholder${index}`) // bar
      ]
    },
    toolbox: toolboxDataZoomOptions,
    dataZoom: [{
      ...dataZoomOptions([])[0],
      minValueSpan: 60 * 60 * 1000
    }],
    series: chartRowMapping.slice().reverse().map(
      ({ key, label }) =>
        ({
          type: 'scatter',
          name: label,
          symbol: getSymbol(selected as number),
          symbolSize,
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
          height: (chartRowMapping.length + 1) * (rowHeight + rowGap) // +1 = bar
            + legendHeight + brushTextHeight + xAxisHeight
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
