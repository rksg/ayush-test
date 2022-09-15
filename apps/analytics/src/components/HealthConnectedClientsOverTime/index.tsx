import { forwardRef } from 'react'

import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, getSeriesData, TimeSeriesData }         from '@acx-ui/analytics/utils'
import { Card, cssStr, Loader, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'

import { useHealthTimeseriesQuery } from './services'


const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

const HealthTimeSeriesChart = 
forwardRef(function HealthTimeSeriesChart ({ filters, ref, key }: 
  { filters: AnalyticsFilter, 
    ref: React.RefObject<ReactECharts>,
    key: string
  }
) {
  const { $t } = useIntl()
  const { startDate, endDate } = filters

  const seriesMapping = [
    { 
      key: 'newClientCount', 
      name: $t({ defaultMessage: 'New Clients' }) 
    },
    {
      key: 'connectedClientCount',
      name: $t({ defaultMessage: 'Connected Clients' })
    }
  ] as Array<{ key: string; name: string }>

  const queryResults = useHealthTimeseriesQuery(filters, {
    selectFromResult: ({
      data,
      ...rest
    }) => ({
      data: getSeriesData(data as TimeSeriesData | null, seriesMapping),
      ...rest
    })
  })

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ width }) => (
          <div style={{ width, height: 250 }}>
            <Card>
              {(queryResults.data && queryResults.data.length > 0)
                ? <MultiLineTimeSeriesChart
                  data={queryResults.data}
                  lineColors={lineColors}
                  brush={[startDate, endDate]}
                  style={{ width, height: 200 }}
                  chartRef={ref}
                  key={key}
                />
                : <NoData />}
            </Card>
          </div>
        )}
      </AutoSizer>
    </Loader>
  )
})

export default HealthTimeSeriesChart
