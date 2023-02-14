import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { TimeSeriesChartData }                                        from '@acx-ui/analytics/utils'
import { getSeriesData, AnalyticsFilter }                             from '@acx-ui/analytics/utils'
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

function getStartAndEndTimes (timeSeries : TimeSeriesChartData[]) {
  return timeSeries?.[0]?.data?.reduce((startEndTimes, dataPoint, index) => {
    const [time, value] = dataPoint
    if (
      index === 0 || value !== timeSeries?.[0]?.data[index - 1][1]
    ) {
      startEndTimes.push([time, 'switchStatus', time, value])
    } else {
      const lastStartEndTime = startEndTimes[startEndTimes.length - 1]
      lastStartEndTime[2] = time
    }
    return startEndTimes
  }, [] as [TimeStamp, string, TimeStamp, number | null][])
}

export function SwitchStatusByTime ({ filters }: { filters: AnalyticsFilter }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'isSwitchUp', name: $t({ defaultMessage: 'SwitchStatus' }) }
  ] as Array<{ key: Key, name: string }>
  const queryResults = useSwitchStatusQuery(filters, {
    selectFromResult: ({ data, ...rest }) => {
      return {
        timeSeries: getStartAndEndTimes(
          getSeriesData(data?.timeSeries!, seriesMapping) as TimeSeriesChartData[]
        )?.filter((dataPoint) => dataPoint?.[3] === 1),
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
            {({ height, width }) =>
              queryResults.timeSeries.length ? (
                <MultiBarTimeSeriesChart
                  style={{ width, height }}
                  data={[
                    {
                      key: 'SwitchStatus',
                      name: 'switch',
                      color: '#23AB36',
                      data: queryResults?.timeSeries as [
                        TimeStamp,
                        string,
                        TimeStamp,
                        number | null
                      ][]
                    }
                  ]}
                  chartBoundary={[
                    moment(filters.startDate).valueOf(),
                    moment(filters.endDate).valueOf()
                  ]}
                  hasXaxisLabel
                />
              ) : (
                <NoData />
              )
            }
          </AutoSizer>
        </GridCol>
      </GridRow>
    </Loader>
  )
}
