import moment            from 'moment-timezone'
import { useIntl }       from 'react-intl'
import { defineMessage } from 'react-intl'
import AutoSizer         from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'
import { Loader, VerticalBarChart }   from '@acx-ui/components'
import { formatter }                  from '@acx-ui/utils'


import { KPITimeseriesResponse, useKpiTimeseriesQuery } from '../Kpi/services'

const barChartText = {
  title: defineMessage({ defaultMessage: 'last 7 days' })
}

const transformBarChartResponse = ({ data, time }: KPITimeseriesResponse) => {
  return data.map((datum, index) => ([
    moment(time[index], 'YYYY/MM/DD').date(),
    datum && datum.length && (datum[0] !== null && datum[1] !== null)
      ? datum[1] === 0 ? 0 : (datum[0] / datum[1]) * 100
      : null
  ])) as [number, number][]
}

export const formatYDataPoint = (data: number | unknown) =>
  data !== null ? formatter('percentFormat')(data as number / 100) : '-'

function BarChart ({
  filters,
  kpi,
  threshold
}: {
  filters: AnalyticsFilter;
  kpi: string;
  threshold: string;
}) {
  const { $t } = useIntl()
  const { text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { endDate } = filters
  const startDate = moment(endDate).subtract(6, 'd').format()
  const queryResults = useKpiTimeseriesQuery(
    {
      ...filters,
      kpi,
      threshold: threshold,
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
    dimensions: ['x', 'y'],
    source: queryResults?.data?.[0]?.data ?? [],
    seriesEncode: [
      {
        x: 'date',
        y: 'Percentage'
      }
    ]
  }

  return (
    <Loader states={[queryResults]} key={kpi}>
      <AutoSizer>
        {({ width, height }) => (
          <VerticalBarChart
            style={{ height: height, width }}
            data={data}
            xAxisName={`(${$t(barChartText.title)})`}
            barWidth={30}
            dataFormatter={formatYDataPoint}
            showTooltipName={false}
            yAxisProps={{
              max: 100,
              min: 0
            }}
          />
        )}
      </AutoSizer>
    </Loader>
  )
}

export default BarChart
