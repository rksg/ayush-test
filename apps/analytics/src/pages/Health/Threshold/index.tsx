/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'

import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'
import { Loader, cssStr }             from '@acx-ui/components'
import type { TimeStamp }             from '@acx-ui/types'

import { KPITimeseriesResponse, useKpiTimeseriesQuery, useKpiHistogramQuery, KPIHistogramResponse } from '../Kpi/services'

import { StyledSlider } from './styledComponents'


const transformBarChartResponse = ({ data, time }: KPITimeseriesResponse) => {
  return data.map((datum, index) => ([
    moment(time[index], 'YYYY/MM/DD').date(),
    datum && datum.length && (datum[0] !== null && datum[1] !== null)
      ? datum[1] === 0 ? 0 : (datum[0] / datum[1]) * 100
      : null
  ])) as [number, number][]
}
const transformHistogramResponse = ({ data, splits }: KPIHistogramResponse & { splits : any }) => {
  return data.map((datum, index) => ([
    splits[index],
    datum
  ])) as [TimeStamp, number][]
}
const marks = [0,1,2,3,4,5,6,7,8]
const strokeColor=[cssStr('--acx-accents-blue-50')]
function SLAThreshold ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { $t } = useIntl()
  const { histogram, text, barChart } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const [inputValue, setInputValue] = useState(5)
  const onChange = (newValue: number) => {
    setInputValue(newValue)
  }


  let queryResults

  if (!histogram) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    queryResults = useKpiTimeseriesQuery(
      { ...filters, kpi, threshold: histogram?.initialThreshold, granularity: 'PT24H' }, {
        selectFromResult: ({ data, ...rest }) => ({
          ...rest,
          data: data! && [{
            name: $t(text),
            data: transformBarChartResponse(data)
          }]
        })
      })
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    queryResults = useKpiHistogramQuery(
      { ...filters, kpi, threshold: barChart?.initialThreshold }, {
        selectFromResult: ({ data, ...rest }) => ({
          ...rest,
          data: data! && [{
            name: $t(text),
            data: transformHistogramResponse({ ...data, ...histogram })
          }]
        })
      })
  }
  const optionForHistogramChart = {

    dataset: {
      dimensions: ['Switch Name', 'PoE Usage'],
      source: queryResults?.data?.[0]?.data ?? []
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      top: '15%',
      containLabel: true
    },
    color: strokeColor,
    tooltip: {},
    barWidth: 20,
    barGap: '10%',
    xAxis: {
      type: 'category',
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false },
      axisLabel: {
        show: true,
        fontSize: 12
      }
    },
    yAxis: {},
    series: [{
      name: 'Test',
      type: 'bar'
    }]
  }
  const optionForBarChart = {
    dataset: {
      dimensions: ['Switch Name', 'PoE Usage'],
      source: queryResults?.data?.[0]?.data ?? []
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      top: '15%',
      containLabel: true
    },

    color: strokeColor,
    tooltip: {},
    barWidth: 20,
    barGap: '10%',
    xAxis: {
      type: 'category',
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false },
      axisLabel: {
        show: true,
        fontSize: 12
      }
    },
    yAxis: {},
    series: [{
      name: 'Test',
      type: 'bar'
    }]
  }
  return (
    <Loader states={[queryResults]} key={kpi}>
      {histogram ?
        <AutoSizer>
          {({ width, height }) => (
            <>
              <ReactECharts option={optionForHistogramChart} style={{ height, width }} />
              <StyledSlider
                min={0}
                max={8}
                onChange={onChange}
                marks={marks}
                value={inputValue}
                style={{
                  height: 5,
                  width: width * 0.95,
                  position: 'absolute',
                  top: height * 0.9,
                  marginLeft: width* 0.05,
                  fontSize: 12
                }}
              />
            </>)}
        </AutoSizer>:
        <AutoSizer>
          {({ width, height }) => (
            <ReactECharts option={optionForBarChart} style={{ height, width }} />
          )}
        </AutoSizer>
      }
    </Loader>
  )
}

export default SLAThreshold
