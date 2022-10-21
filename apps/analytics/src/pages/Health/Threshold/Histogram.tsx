import React, { useState } from 'react'

import { sum }     from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig }                                    from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, cssStr, VerticalBarChart, showToast } from '@acx-ui/components'
import type { TimeStamp }                                                from '@acx-ui/types'

import { KpiThresholdType, onApplyType }               from '../Kpi'
import {  useKpiHistogramQuery, KPIHistogramResponse } from '../Kpi/services'

import  HistogramSlider    from './HistogramSlider'
import { ThresholdConfig } from './ThresholdConfig'



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
    splits[index] ? shortXFormat(splits[index]) : null,
    datum
  ]) as [TimeStamp, number][]
}

function Histogram ({
  filters,
  kpi,
  threshold,
  setKpiThreshold,
  thresholds,
  onReset,
  onApply,
  canSave,
  fetchingDefault
}: {
  filters: AnalyticsFilter;
  kpi: string;
  threshold: string;
  setKpiThreshold: CallableFunction;
  thresholds: KpiThresholdType;
  onReset?: CallableFunction,
  onApply?: onApplyType,
  canSave: {
    data: { allowedSave: boolean | undefined },
    isFetching: boolean,
    isLoading: boolean
  },
  fetchingDefault: {
    isFetching: boolean,
    isLoading: boolean
  }
}) {
  const { $t } = useIntl()
  const { histogram, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { splits, highlightAbove } = histogram
  const [thresholdValue, setThresholdValue] = useState(threshold)
  const [sliderValue, setSliderValue] = useState(
    splits.indexOf(thresholdValue) + 0.5
  )

  const onSliderChange = (newValue: number) => {
    if (
      newValue === 0 ||
      newValue === splits.length + 0.5 ||
      newValue % 1 === 0
    )
      return
    setSliderValue(newValue)
    setThresholdValue(histogram?.splits[newValue - 0.5])
    setKpiThreshold({ ...thresholds, [kpi]: histogram?.splits[newValue - 0.5] })
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

  const onButtonReset = () => {
    const defaultConfig: unknown = onReset && onReset()
    setSliderValue(splits.indexOf(defaultConfig) + 0.5)
    setThresholdValue(defaultConfig as string)
    setKpiThreshold({ ...thresholds, [kpi]: defaultConfig })
  }

  const onButtonApply = async () => {
    if (onApply) {
      try {
        await onApply()(thresholdValue as unknown as number)
        showToast({
          type: 'success',
          content: $t({
            defaultMessage: 'Threshold set succesfully'
          })
        })
      } catch {
        showToast({
          type: 'error',
          content: $t({
            defaultMessage: 'Error setting threshold, please try again later'
          })
        })
      }
    }
  }

  return (
    <Loader states={[queryResults, canSave, fetchingDefault]} key={kpi}>
      <GridRow>
        <GridCol col={{ span: 18 }} style={{ height: '160px' }}>
          <AutoSizer>
            {({ width, height }) => (
              <>
                <VerticalBarChart
                  style={{ height: height, width }}
                  data={data}
                  xAxisName={`(${histogram?.xUnit})`}
                  barWidth={30}
                  xAxisOffset={10}
                  barColors={barColors}
                />
                <HistogramSlider
                  splits={splits}
                  width={width}
                  height={height}
                  onSliderChange={onSliderChange}
                  sliderValue={sliderValue}
                />
              </>
            )}
          </AutoSizer>
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <ThresholdConfig
            thresholdValue={thresholdValue}
            percent={percent}
            unit={histogram?.xUnit}
            shortXFormat={histogram?.shortXFormat}
            onReset={onButtonReset}
            onApply={onButtonApply}
            canSave={canSave.data?.allowedSave}
          />
        </GridCol>
      </GridRow>
    </Loader>
  )
}

export default Histogram
