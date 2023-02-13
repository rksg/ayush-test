import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { TimeSeriesChartData }                                        from '@acx-ui/analytics/utils'
import { getSeriesData, AnalyticsFilter, calculateGranularity }       from '@acx-ui/analytics/utils'
import { Loader, NoData, MultiBarTimeSeriesChart, GridCol, GridRow  } from '@acx-ui/components'
import { TimeStamp }                                                  from '@acx-ui/types'

import { SwitchStatusTimeSeries, useSwitchStatusQuery } from './services'
import * as UI                                          from './styledComponents'

type Key = keyof Omit<SwitchStatusTimeSeries, 'time'>

const secondsToHm = (milliSeconds: number) => {
  let seconds = Math.floor(milliSeconds / 1000)
  const h = Math.floor(seconds / 3600) + 'h'
  const m = Math.floor((seconds % 3600) / 60) + 'm'
  return h +' '+ m
}
const getTimeSeries = (timeSeries : TimeSeriesChartData[], granularity : number) => {
  return timeSeries?.[0]?.data?.reduce((acc, seriesDatum) => {
    if(seriesDatum[1] === 1)
      acc.push([
        seriesDatum[0] ,
        'switchStatus' ,
        moment(seriesDatum[0]).add(granularity, 'seconds').toISOString()
      ])
    return acc
  }, [] as [TimeStamp, string, TimeStamp][])
}
export function SwitchStatusByTime ({ filters }: { filters: AnalyticsFilter }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'isSwitchUp', name: $t({ defaultMessage: 'SwitchStatus' }) }
  ] as Array<{ key: Key, name: string }>
  const queryResults = useSwitchStatusQuery(filters, {
    selectFromResult: ({ data, ...rest }) => {
      return {
        timeSeries: getTimeSeries(
          getSeriesData(data?.timeSeries!, seriesMapping) as TimeSeriesChartData[],
          moment
            .duration(
              calculateGranularity(filters.startDate, filters.endDate, 'PT15M')
            )
            .asSeconds()
        ),
        switchTotalUptime: data?.switchTotalUptime,
        switchTotalDowntime: data?.switchTotalDowntime,
        ...rest
      }
    }
  })
  console.log(queryResults)

  return (
    <Loader states={[queryResults]}>
      <GridRow>
        <UI.SwitchStatusHeader col={{ span: 16 }}>
          Switch Status
        </UI.SwitchStatusHeader>
        <UI.TotalUptime col={{ span: 4 }} style={{ height: '20px' }}>
          Total Uptime:{' '}
          <UI.Duration>
            {secondsToHm(queryResults?.switchTotalUptime || 0)}
          </UI.Duration>
        </UI.TotalUptime>
        <UI.TotalDowntime
          col={{ span: 4 }}
          style={{ height: '20px', alignItems: 'end' }}>
          Total Downtime:{' '}
          <UI.Duration>
            {secondsToHm(queryResults?.switchTotalDowntime || 0)}
          </UI.Duration>
        </UI.TotalDowntime>
        <GridCol col={{ span: 24 }} style={{ height: '20px' }}>
          <AutoSizer>
            {({ height, width }) => (
              queryResults.timeSeries.length ?
                <MultiBarTimeSeriesChart
                  style={{ width, height }}
                  data={[
                    {
                      key: 'SwitchStatus',
                      name: 'switch',
                      color: '#23AB36',
                      data: queryResults?.timeSeries as [TimeStamp, string, TimeStamp][]
                    }
                  ]}
                  chartBoundary={[
                    moment(filters.startDate).valueOf(),
                    moment(filters.endDate).valueOf()
                  ]}
                  hasXaxisLabel
                />
                : <NoData/>
            )}
          </AutoSizer>
        </GridCol>
      </GridRow>
    </Loader>
  )
}
