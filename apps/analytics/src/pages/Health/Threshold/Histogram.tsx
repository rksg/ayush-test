/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'

import { sum }     from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig }                                  from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, cssStr, DistributionChart, Button } from '@acx-ui/components'
import type { TimeStamp }                                              from '@acx-ui/types'
import { formatter }                                                   from '@acx-ui/utils'

import {  useKpiHistogramQuery, KPIHistogramResponse } from '../Kpi/services'

import * as UI from './styledComponents'

const tranformHistResponse = (
  { data, kpi, thresholdValue }: KPIHistogramResponse & { kpi: string }
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
const marks = [0,1,2,3,4,5,6,7]
const strokeColor=[cssStr('--acx-accents-blue-50')]
function Histogram ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { $t } = useIntl()
  const { histogram, text, barChart } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const [inputValue, setInputValue] = useState(5)
  const [thresholdValue, setThresholdValue] = useState(histogram?.initialThreshold)

  const onChange = (newValue: number) => {
    if(newValue === 0 || newValue === 8)
      return
    setInputValue(newValue)
    setThresholdValue(histogram?.splits[newValue - 1])
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
    dimensions: ['', ''],
    source: queryResults?.data?.[0]?.data ?? [],
    seriesEncode: [
      {
        x: 'Rss Distribution',
        y: 'Samples'
      }
    ]
  }

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
                  style={{ height: height * 0.75, width }}
                  data={data}
                  grid={{ bottom: '10%', top: '5%' }}
                  title={histogram?.xUnit}
                  barWidth={30}
                  xAxisOffset={10}
                />
                <UI.StyledSlider
                  min={0}
                  max={8}
                  onChange={onChange}
                  marks={marks}
                  value={inputValue}
                  style={{
                    width: width * 0.95,
                    position: 'absolute',
                    top: height * 0.53,
                    marginLeft: width * 0.08,
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
                {thresholdValue} {histogram?.xUnit}
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
