import { useState, useCallback, useEffect } from 'react'

import { sum, max } from 'lodash'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig }                                            from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, cssStr, VerticalBarChart, showToast, NoData } from '@acx-ui/components'
import type { TimeStamp }                                                        from '@acx-ui/types'

import { KpiThresholdType, onApplyType, onResetType }  from '../Kpi'
import {  useKpiHistogramQuery, KPIHistogramResponse } from '../Kpi/services'

import  HistogramSlider from './HistogramSlider'
import  ThresholdConfig from './ThresholdConfigContent'

const getGoalPercent = (
  { data, kpi, thresholdValue }: KPIHistogramResponse & { kpi: string, thresholdValue: number }
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
  thresholds,
  onReset,
  onApply,
  canSave,
  fetchingDefault,
  isNetwork
}: {
  filters: AnalyticsFilter;
  kpi: string;
  threshold: number;
  setKpiThreshold: CallableFunction;
  thresholds: KpiThresholdType;
  canSave: {
    data: { allowedSave: boolean | undefined };
    isFetching: boolean;
    isLoading: boolean;
  };
  fetchingDefault: {
    isFetching: boolean;
    isLoading: boolean;
    data: Object | undefined;
  };
  onReset?: onResetType;
  onApply?: onApplyType;
  isNetwork?: boolean;
}) {
  const { $t } = useIntl()
  const { histogram, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { splits, highlightAbove, isReverse } = histogram
  const [thresholdValue, setThresholdValue] = useState(threshold)
  const [isInitialRender, setIsInitialRender] = useState(true)
  const splitsAfterIsReverseCheck = isReverse ? splits.slice().reverse() : splits

  /* istanbul ignore next */
  const onSliderChange = (newValue: number) => {
    if (
      newValue === splitsAfterIsReverseCheck.length + 1 ||
      newValue === 0
    )
      return
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

  /* istanbul ignore next */
  const onBarClick = ( barData: [number, number] ) =>{
    const reformattedBarData = histogram?.reFormatFromBarChart(barData?.[0])

    if(splitsAfterIsReverseCheck.indexOf(reformattedBarData) === -1){
      const selectSecondLastBar = splitsAfterIsReverseCheck.length - 1
      setThresholdValue(splitsAfterIsReverseCheck[selectSecondLastBar])
      setKpiThreshold({ ...thresholds, [kpi]: splitsAfterIsReverseCheck[selectSecondLastBar] })
      return
    }
    setThresholdValue(reformattedBarData)
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
    : cssStr('--acx-viz-qualitative-1')
  const hightlightBelowColor = highlightAbove
    ? cssStr('--acx-viz-qualitative-1')
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

  const onButtonReset = useCallback((baseConfig?: boolean) => {
    const defaultConfig: unknown = onReset && onReset()(baseConfig)
    setThresholdValue(defaultConfig as number)
    setKpiThreshold({ ...thresholds, [kpi]: defaultConfig })
  }, [kpi, onReset, setKpiThreshold, thresholds])

  const onButtonApply = async () => {
    if (onApply) {
      try {
        await onApply()(thresholdValue as unknown as number)
        showToast({
          type: 'success',
          content: $t({
            defaultMessage: 'Threshold set succesfully.'
          })
        })
      } catch {
        showToast({
          type: 'error',
          content: $t({
            defaultMessage: 'Error setting threshold, please try again later.'
          })
        })
      }
    }
  }

  useEffect(() => {
    if (
      isInitialRender &&
      !fetchingDefault.isFetching &&
      !fetchingDefault.isLoading &&
      fetchingDefault.data
    ) {
      onButtonReset()
      setIsInitialRender(false)
    }
  }, [fetchingDefault, isInitialRender, onButtonReset])

  useEffect(() => {
    if (fetchingDefault.data) {
      setIsInitialRender(true)
    }
  }, [fetchingDefault.data])

  const hasData = (queryResults?.data?.[0]?.rawData?.data)?.every(
    (datum: number) => datum !== null
  )
  const yAxisLabelOffset = max(queryResults?.data?.[0]?.rawData?.data)?.toString()?.length
  const unit = histogram?.xUnit
  return (
    <Loader states={[queryResults, canSave, fetchingDefault]} key={kpi}>
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
                    sliderValue={splitsAfterIsReverseCheck.indexOf(thresholdValue) + 1}
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
            onReset={() => onButtonReset(true)}
            onApply={onButtonApply}
            canSave={canSave.data?.allowedSave}
            isNetwork={isNetwork}
          />
        </GridCol>
      </GridRow>
    </Loader>
  )
}

export default Histogram
