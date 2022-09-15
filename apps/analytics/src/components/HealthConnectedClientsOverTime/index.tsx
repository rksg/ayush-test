import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, getDataSeries, MultiLineTimeSeriesChartData } from '@acx-ui/analytics/utils'
import { Card, cssStr, Loader, MultiLineTimeSeriesChart, NoData }       from '@acx-ui/components'

import { HealthTimeseriesData, useHealthTimeseriesQuery } from './services'


const lineColors = [
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

function HealthTimeSeriesChart ({ filters }: { filters: AnalyticsFilter }) {
  const { $t } = useIntl()
  const [data, setData] = useState<MultiLineTimeSeriesChartData[]>([])

  const queryResults = useHealthTimeseriesQuery(filters, {
    selectFromResult: ({
      data,
      ...rest
    }) => ({
      data: data as HealthTimeseriesData,
      ...rest
    })
  })

  useEffect(() => {
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
    if (!queryResults.data) return
    const chartData = 
    getDataSeries(queryResults.data, seriesMapping)
    setData(chartData)
  }, [queryResults, queryResults.data, $t, queryResults.isSuccess])

  useEffect(() => {}, [data])

  const { startDate, endDate } = filters

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ width }) => (
          <div style={{ width, height: 250 }}>
            <Card>
              {(queryResults.data && data.length > 0)
                ? <MultiLineTimeSeriesChart
                  data={data}
                  lineColors={lineColors}
                  brush={[startDate, endDate]}
                  style={{ width, height: 200 }}
                />
                : <NoData />}
            </Card>
          </div>
        )}
      </AutoSizer>
    </Loader>
  )
}

export default HealthTimeSeriesChart
