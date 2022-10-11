/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'

import { Slider, Switch } from 'antd'
import ReactECharts       from 'echarts-for-react'
import { useIntl }        from 'react-intl'
import AutoSizer          from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig, BarChartData } from '@acx-ui/analytics/utils'
import { Loader, cssStr, NoData, BarChart }         from '@acx-ui/components'
import type { TimeStamp }                           from '@acx-ui/types'

import { KPITimeseriesResponse, useKpiTimeseriesQuery } from '../Kpi/services'

import { StyledSlider } from './styledComponents'

import type { SliderMarks } from 'antd/es/slider'


const lineColors = [cssStr('--acx-accents-blue-30')]

const transformResponse = ({ data, time }: KPITimeseriesResponse) => {
  return data.map((datum, index) => ([
    time[index],
    datum && datum.length && (datum[0] !== null && datum[1] !== null)
      ? datum[1] === 0 ? 0 : (datum[0] / datum[1])
      : null
  ])) as [TimeStamp, number][]
}

const getChartData = (data: any): any => ({
  source: Object.entries(data).reverse(),
  dimensions: ['severity', 'incidentCount'],
  seriesEncode: [{ x: 'incidentCount', y: 'severity' }]
})
export const barColors = [
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-accents-orange-25'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-accents-blue-40'),
  cssStr('--acx-accents-blue-50')
]
export const data = (multiseries = false): BarChartData => ({
  dimensions: ['Switch Name', 'PoE Usage'],
  source: [
    [1, 53, 7.3, 309773533136, 109773533136, 'C0:C5:20:AA:33:1B'],
    [2, 73, 19.3, 409773533136, 179773533136, 'D4:C1:9E:84:59:4A'],
    [3, 107, 79.11, 509773533136, 219773533136, 'C0:C5:20:AA:32:31'],
    [4, 207, 89.11, 709773533136, 309773533136, 'D4:C1:9E:14:68:0D'],
    [5, 307, 99.11, 809773533136, 509773533136, 'C0:C5:20:AA:32:C1'],
    [6, 307, 99.11, 809773533136, 509773533136, 'C0:C5:20:AA:32:C1']
  ],
  seriesEncode: multiseries ?
    [
      {
        // Map "tx" to x-axis.
        x: 'Transmitted',
        // Map "switch_name" to y-axis.
        y: 'Switch Name',
        // series name
        seriesName: 'Transmitted'
      },
      {
        // Map "rx" to x-axis.
        x: 'Received',
        // Map "switch_name" to y-axis.
        y: 'Switch Name',
        // series name
        seriesName: 'Received'
      }
    ] :
    [
      {
        // Map "poe_usage" to x-axis.
        x: 'Switch Name',
        // Map "switch_name" to y-axis.
        y: 'PoE Usage'
      }
    ]

})
const marks: any = ['0','1', '2', '3', '4', '5', '6', '7']
const strokeColor=[cssStr('--acx-accents-blue-50')]
const trailColor=[cssStr('--acx-neutrals-40')]
function SLAThreshold ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { $t } = useIntl()
  const { histogram, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const [inputValue, setInputValue] = useState(5)
  const onChange = (newValue: number) => {
    setInputValue(newValue)
  }

  const option = {
    // title: {
    //   text: ''
    // },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      top: '15%',
      containLabel: true
    },
    color: strokeColor,
    tooltip: {},
    barWidth: 50,
    barGap: '10%',
    xAxis: {
      data: ['1', '2', '3', '4', '5', '6', '7'],
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
        fontSize: 0
      }
    },
    yAxis: {},
    series: [{
      name: 'Test',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20,60]
    }]
  }
  const queryResults = useKpiTimeseriesQuery(
    { ...filters, kpi, threshold: histogram?.initialThreshold }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data! && [{
          name: $t(text),
          data: transformResponse(data)
        }]
      })
    })
  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ width, height }) => (
          <>
            <ReactECharts option={option} style={{ height, width }} />
            <StyledSlider
              min={0}
              max={7}
              onChange={onChange}
              marks={marks}
              style={{
                height: 5,
                width: width * 0.95,
                position: 'absolute',
                top: height * 0.9,
                marginLeft: width* 0.05,
                fontSize: 12
              }}
              step={1}
            />
          </>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default SLAThreshold
