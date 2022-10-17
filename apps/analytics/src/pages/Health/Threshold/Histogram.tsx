/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'

import { sum }            from 'lodash'
import { renderToString } from 'react-dom/server'
import { useIntl }        from 'react-intl'
import AutoSizer          from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig }                                  from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, cssStr, DistributionChart, Button } from '@acx-ui/components'
import type { TimeStamp }                                              from '@acx-ui/types'
import { formatter }                                                   from '@acx-ui/utils'


import {  useKpiHistogramQuery, KPIHistogramResponse } from '../Kpi/services'

import * as UI from './styledComponents'

import type { TooltipComponentFormatterCallbackParams } from 'echarts'

export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
  const rss = Array.isArray(params)
    && Array.isArray(params[0].data) ? params[0].data[1] : ''
  const name = Array.isArray(params)
    && Array.isArray(params[0].data) && params[0].dimensionNames?.[1]
  return renderToString(<UI.TooltipWrapper>
    <div>
      {name}:
      <b> {rss as string}</b>
    </div>
  </UI.TooltipWrapper>)
}
const tranformHistResponse = (
  { data, kpi, thresholdValue }: KPIHistogramResponse & { kpi: string, thresholdValue : number }
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

const transformHistogramResponse = ({ data, splits }: KPIHistogramResponse & { splits : any }) => {
  return data.map((datum, index) => ([
    splits[index],
    datum
  ])) as [TimeStamp, number][]
}
function Histogram ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { $t } = useIntl()
  const { histogram, text, barChart } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { splits, highlightAbove } = histogram
  const [thresholdValue, setThresholdValue] = useState(histogram?.initialThreshold)
  const [sliderValue, setSliderValue] = useState(splits.indexOf(thresholdValue) + 0.5)
  const marks = splits.map(( _ : number,index : number) => index)

  const onSliderChange = (newValue: number) => {
    if(newValue === 0 || newValue === splits.length + 0.5 || newValue % 1 === 0)
      return
    setSliderValue(newValue)
    setThresholdValue(histogram?.splits[newValue - 0.5])
  }
  const queryResults = useKpiHistogramQuery(
    { ...filters, kpi, threshold: barChart?.initialThreshold }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data! && [{
          name: $t(text),
          data: transformHistogramResponse({ ...data, ...histogram }),
          rawData: data
        }]
      })
    })
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
      : hightlightBelowColor)
  const percent: number = queryResults?.data?.[0]?.rawData
    ? tranformHistResponse({ ...queryResults?.data?.[0]?.rawData, kpi, thresholdValue })
    : 0

  return (
    <Loader states={[queryResults]} key={kpi}>
      <GridRow>
        <GridCol col={{ span: 18 }} style={{ height: '210px' }}>
          <AutoSizer>
            {({ width, height }) => (
              <>
                <DistributionChart
                  style={{ height: height * 0.8, width }}
                  data={data}
                  grid={{ bottom: '15%', top: '5%' }}
                  title={`(${histogram?.xUnit})`}
                  barWidth={30}
                  xAxisOffset={8}
                  dataYFormatter={histogram?.shortYFormat}
                  dataXFormatter={histogram?.shortXFormat}
                  tooltipFormatter={tooltipFormatter}
                  barColors={barColors}
                />
                <UI.StyledSlider
                  min={0}
                  max={splits?.length + 1}
                  onChange={onSliderChange}
                  marks={marks}
                  value={sliderValue}
                  tooltipVisible={false}
                  step={0.5}
                  style={{
                    width: width * 0.95,
                    position: 'absolute',
                    top: height * 0.55,
                    marginLeft: width * 0.075,
                    fontSize: 12
                  }}
                />
              </>
            )}
          </AutoSizer>
        </GridCol>
        <GridCol col={{ span: 6 }}>
          <UI.HistogramConfig>
            <UI.HistogramSpanContent>
              {'Goal'}
              <UI.HistogramBoldContent>
                {histogram?.shortXFormat?.(thresholdValue)} {histogram?.xUnit}
              </UI.HistogramBoldContent>
            </UI.HistogramSpanContent>
            <UI.HistogramGoalPercentage>
              {formatter('percentFormatRound')(percent / 100)}
              <UI.HistogramBoldContent>
                {'met goal'}
              </UI.HistogramBoldContent>
            </UI.HistogramGoalPercentage>
            <UI.BtnWrapper>
              <Button size='small' >Reset</Button>
              <Button size='small' type='secondary'>Apply</Button>
            </UI.BtnWrapper>
          </UI.HistogramConfig>
        </GridCol>
      </GridRow>
    </Loader>
  )
}

export default Histogram
