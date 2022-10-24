import { useState, useCallback } from 'react'

import { sum }     from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig }                                 from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, cssStr, VerticalBarChart, NoData } from '@acx-ui/components'
import type { TimeStamp }                                             from '@acx-ui/types'

import { KpiThresholdType }                            from '../Kpi'
import {  useKpiHistogramQuery, KPIHistogramResponse } from '../Kpi/services'

import  HistogramSlider from './HistogramSlider'
import  ThresholdConfig from './ThresholdConfigContent'

const getGoalPercent = (
  { data, kpi, thresholdValue }: KPIHistogramResponse & { kpi: string, thresholdValue : string }
) : number => {
  const { histogram } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { splits, highlightAbove, isReverse } = histogram
  const indexOfThreshold = splits.indexOf(thresholdValue)
  const total = sum(data)
  const highlightedData = highlightAbove || isReverse
    ? data.slice(indexOfThreshold + 1)
    : data.slice(0, indexOfThreshold + 1)
  const success = sum(highlightedData)
  const percent = total > 0 ? (success / total) * 100 : 0

  return percent
}

const transformHistogramResponse = ({
  data,
  splits,
  shortXFormat
}: KPIHistogramResponse & { splits: number[], shortXFormat: CallableFunction }) => {
  return data.map((datum, index) => [
    splits[index] ? shortXFormat(splits[index]) : '',
    datum
  ]) as [TimeStamp, number][]
}
function Histogram ({
  filters,
  kpi,
  threshold,
  setKpiThreshold,
  thresholds
}: {
  filters: AnalyticsFilter;
  kpi: string;
  threshold: string;
  setKpiThreshold: CallableFunction;
  thresholds: KpiThresholdType
}) {
  const { $t } = useIntl()
  const { histogram, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { splits, highlightAbove } = histogram
  const [thresholdValue, setThresholdValue] = useState(threshold)
  const [sliderValue, setSliderValue] = useState(
    splits.indexOf(thresholdValue) + 0.5
  )

  /* istanbul ignore next */
  const onSliderChange = useCallback((newValue: number) => {
    if (
      newValue === splits.length + 0.5 ||
      newValue % 1 === 0
    )
      return
    setSliderValue(newValue)
    setThresholdValue(histogram?.splits[newValue - 0.5])
    setKpiThreshold({ ...thresholds, [kpi]: histogram?.splits[newValue - 0.5] })
  },[kpi, histogram?.splits, setKpiThreshold, thresholds, splits.length])
  const queryResults = useKpiHistogramQuery(
    { ...filters, kpi, threshold: histogram?.initialThreshold },
    {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data! && [
          {
            name: $t(text),
            data: transformHistogramResponse({ ...data, ...histogram }),
            rawData: data
          }
        ]
      })
    }
  )
  const onReset = () => {
    setSliderValue(splits.indexOf(histogram?.initialThreshold ) + 0.5)
    setThresholdValue(histogram?.initialThreshold )
    setKpiThreshold({ ...thresholds, [kpi]: histogram?.initialThreshold })
  }

  /* istanbul ignore next */
  const onBarClick = ( barData: [number, number] ) =>{
    const reformattedBarData = histogram?.reFormatFromBarChart(barData?.[0])
    if(splits.indexOf(reformattedBarData) === -1)
      return
    setSliderValue(splits.indexOf(reformattedBarData) + 0.5)
    setThresholdValue(reformattedBarData as unknown as string)
    setKpiThreshold({ ...thresholds, [kpi]: reformattedBarData })
  }

  const data = {
    dimensions: [histogram.xUnit, histogram.yUnit],
    source: queryResults?.data?.[0]?.data ?? [],
    seriesEncode: [
      {
        x: histogram.xUnit,
        y: histogram.yUnit
      }
    ]
  }
  const hightlightAboveColor = highlightAbove
    ? cssStr('--acx-neutrals-40')
    : cssStr('--acx-accents-blue-50')
  const hightlightBelowColor = highlightAbove
    ? cssStr('--acx-accents-blue-50')
    : cssStr('--acx-neutrals-40')
  const barColors = Array.from({ length: splits.length + 1 }, (_, index) =>
    index < splits.indexOf(thresholdValue) + 1
      ? hightlightAboveColor
      : hightlightBelowColor
  )

  const percent: number = queryResults?.data?.[0]?.rawData
    ? getGoalPercent({
      ...queryResults?.data?.[0]?.rawData,
      kpi,
      thresholdValue
    })
    : 0

  return (
    <Loader states={[queryResults]} key={kpi}>
      <GridRow>
        <GridCol col={{ span: 18 }} style={{ height: '160px' }}>
          <AutoSizer>
            {({ width, height }) =>
              queryResults?.data?.[0]?.data.length
                ? (
                  <>
                    <VerticalBarChart
                      style={{ height: height, width }}
                      data={data}
                      xAxisName={`(${histogram?.xUnit})`}
                      barWidth={30}
                      xAxisOffset={10}
                      barColors={barColors}
                      onBarAreaClick={onBarClick}
                    />
                    <HistogramSlider
                      splits={splits}
                      width={width}
                      height={height}
                      onSliderChange={onSliderChange}
                      sliderValue={sliderValue}
                    />
                  </> )
                :
                (
                  <NoData />
                )
            }
          </AutoSizer>
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <ThresholdConfig
            thresholdValue={thresholdValue}
            percent={percent}
            unit={histogram?.xUnit}
            shortXFormat={histogram?.shortXFormat}
            onReset={onReset}
          />
        </GridCol>
      </GridRow>
    </Loader>
  )
}

export default Histogram
