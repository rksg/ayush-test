import { useState } from 'react'

import { sum, max } from 'lodash'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

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
  shortXFormat,
  isReverse
}: KPIHistogramResponse & {
  splits: number[];
  shortXFormat: CallableFunction;
  isReverse: boolean;
}) => {
  const dataAfterIsReverseCheck = isReverse ? data.slice().reverse() : data
  const splitsAfterIsReverseCheck = isReverse ? splits.slice().reverse() : splits
  return dataAfterIsReverseCheck.map((datum, index) => [
    splitsAfterIsReverseCheck[index] ? shortXFormat(splitsAfterIsReverseCheck[index]) : '',
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
  const { splits, highlightAbove, isReverse } = histogram
  const [thresholdValue, setThresholdValue] = useState(threshold)
  const [sliderValue, setSliderValue] = useState(
    splits.indexOf(thresholdValue) + 1
  )
  const splitsAfterIsReverseCheck = isReverse ? splits.slice().reverse() : splits

  /* istanbul ignore next */
  const onSliderChange = (newValue: number) => {
    if (
      newValue === splitsAfterIsReverseCheck.length + 1 ||
      newValue === 0
    )
      return
    setSliderValue(newValue)
    setThresholdValue(splitsAfterIsReverseCheck[newValue - 1])
    setKpiThreshold({ ...thresholds, [kpi]: splitsAfterIsReverseCheck[newValue - 1] })
  }
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
    setSliderValue(splits.indexOf(histogram?.initialThreshold ) + 1)
    setThresholdValue(histogram?.initialThreshold )
    setKpiThreshold({ ...thresholds, [kpi]: histogram?.initialThreshold })
  }

  /* istanbul ignore next */
  const onBarClick = ( barData: [number, number] ) =>{
    const reformattedBarData = histogram?.reFormatFromBarChart(barData?.[0])

    if(splitsAfterIsReverseCheck.indexOf(reformattedBarData) === -1){
      const selectSecondLastBar = splitsAfterIsReverseCheck.length - 1
      setSliderValue(selectSecondLastBar + 1)
      setThresholdValue(splitsAfterIsReverseCheck[selectSecondLastBar] as unknown as string)
      setKpiThreshold({ ...thresholds, [kpi]: splitsAfterIsReverseCheck[selectSecondLastBar] })
      return
    }
    setSliderValue(splitsAfterIsReverseCheck.indexOf(reformattedBarData) + 1)
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
  const barColors = Array.from({ length: splitsAfterIsReverseCheck.length + 1 }, (_, index) =>
    index < splitsAfterIsReverseCheck.indexOf(thresholdValue) + 1
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

  const hasData = (queryResults?.data?.[0]?.rawData?.data)?.every(
    (datum: number) => datum !== null
  )
  const yAxisLabelOffset = max(queryResults?.data?.[0]?.rawData?.data)?.toString()?.length
  const unit = histogram?.xUnit
  return (
    <Loader states={[queryResults]} key={kpi}>
      <GridRow>
        <GridCol col={{ span: 18 }} style={{ height: '160px' }}>
          <AutoSizer>
            {({ width, height }) =>
              queryResults?.data?.[0]?.data.length ? (
                <>
                  <VerticalBarChart
                    style={{ height, width }}
                    data={data}
                    xAxisName={unit !== '%' ? ` (${$t(unit)})` : `(${unit})`}
                    barWidth={20}
                    xAxisOffset={10}
                    barColors={barColors}
                    onBarAreaClick={onBarClick}
                    grid={{ bottom: '35%' }}
                    yAxisOffset={
                      yAxisLabelOffset
                        ? 60 / (yAxisLabelOffset * splitsAfterIsReverseCheck.length)
                        : 0
                    }
                    showXaxisLabel={false}
                    yAxisProps={!hasData ? { max: 100, min: 0 } : undefined}
                  />
                  <HistogramSlider
                    splits={splitsAfterIsReverseCheck}
                    width={width}
                    height={height}
                    onSliderChange={onSliderChange}
                    sliderValue={sliderValue}
                    shortXFormat={histogram?.shortXFormat}
                  />
                </>
              ) : (
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
