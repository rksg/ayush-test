/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig }        from '@acx-ui/analytics/utils'
import { Loader, cssStr, DistributionChart } from '@acx-ui/components'

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
  const { histogram, text, barChart } = Object(kpiConfig[kpi as keyof typeof kpiConfig])

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
  return (
    <Loader states={[queryResults]} key={kpi}>
      <AutoSizer>
        {({ width, height }) => (
          <DistributionChart
            style={{ height , width }}
            data={data}
            grid={{ top: '5%' }}
            title={histogram?.xUnit}
            barWidth={30}
          />
        )}
      </AutoSizer>
    </Loader>
  )
}

export default BarChart
