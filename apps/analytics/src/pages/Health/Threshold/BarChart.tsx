/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'
import { Loader, cssStr }             from '@acx-ui/components'

import { KPITimeseriesResponse, useKpiTimeseriesQuery } from '../Kpi/services'

const transformBarChartResponse = ({ data, time }: KPITimeseriesResponse) => {
  return data.map((datum, index) => ([
    moment(time[index], 'YYYY/MM/DD').date(),
    datum && datum.length && (datum[0] !== null && datum[1] !== null)
      ? datum[1] === 0 ? 0 : (datum[0] / datum[1]) * 100
      : null
  ])) as [number, number][]
}

const strokeColor=[cssStr('--acx-accents-blue-50')]
function BarChart ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { $t } = useIntl()
  const { histogram, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])

  const { endDate } = filters
  const startDate = moment(endDate).subtract(6, 'd').format()
  const queryResults = useKpiTimeseriesQuery(
    {
      ...filters,
      kpi,
      threshold: histogram?.initialThreshold,
      granularity: 'PT24H',
      startDate
    },
    {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data! && [
          {
            name: $t(text),
            data: transformBarChartResponse(data)
          }
        ]
      })
    }
  )


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
      <AutoSizer>
        {({ width, height }) => (
          <ReactECharts
            option={optionForBarChart}
            style={{ height, width }}
          />
        )}
      </AutoSizer>
    </Loader>
  )
}

export default BarChart
