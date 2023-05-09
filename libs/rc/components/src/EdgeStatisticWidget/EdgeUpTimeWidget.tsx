import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { calculateGranularity, TimeSeriesChartData, getSeriesData }                from '@acx-ui/analytics/utils'
import { Card, Loader, NoData, MultiBarTimeSeriesChart, GridCol, cssStr, Tooltip } from '@acx-ui/components'
import { TimeStamp }                                                               from '@acx-ui/types'
import {
  DateFilter,
  useDateFilter
} from '@acx-ui/utils'

import { EdgeUpTimeWidgetMockData } from './__test__/fixture'
import { EdgeStatusTimeSeries }     from './service'
import * as UI                      from './styledComponents'

const milliSecondsToHm = (milliSeconds: number) => {
  const seconds = Math.floor(milliSeconds / 1000)
  const h = Math.floor(seconds / 3600) + 'h'
  const m = Math.floor((seconds % 3600) / 60) + 'm'
  return h + ' ' + m
}
function getStartAndEndTimes (timeSeries: TimeSeriesChartData[]) {
  return timeSeries?.[0]?.data?.reduce((startEndTimes, dataPoint, index) => {
    const [time, value] = dataPoint
    if (index === 0 || value !== timeSeries?.[0]?.data[index - 1][1]) {
      const seriesColor =
        value === 1
          ? cssStr('--acx-semantics-green-50')
          : (cssStr('--acx-semantics-red-50') as string)
      startEndTimes.push([time, 'switchStatus', time, value, seriesColor])
    } else {
      const lastStartEndTime = startEndTimes[startEndTimes.length - 1]
      lastStartEndTime[2] = time
    }
    return startEndTimes
  }, [] as [TimeStamp, string, TimeStamp, number | null, string][])
}

export const EdgeUpTimeWidget = () => {

  const { $t } = useIntl()

  const filters = useDateFilter()

  console.log(filters)

  type Key = keyof Omit<EdgeStatusTimeSeries, 'time'>

  const seriesMapping = [
    { key: 'isEdgeUp', name: $t({ defaultMessage: 'EdgeStatus' }) }
  ] as Array<{ key: Key; name: string }>

  const queryResults = {
    // eslint-disable-next-line max-len
    timeSeries: getStartAndEndTimes(getSeriesData(EdgeUpTimeWidgetMockData.timeSeries!, seriesMapping) as TimeSeriesChartData[]
    )?.filter((dataPoint) => dataPoint?.[3] === 1 || dataPoint?.[3] === 0)
      .map((dataPoint) => {
        let inclusiveDataPoint = dataPoint
        inclusiveDataPoint[2] = moment(dataPoint?.[2])
          .add(
            moment
              .duration(calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M'))
              .asSeconds(),
            'seconds'
          )
          .toISOString()
        return inclusiveDataPoint
      }),
    totalUptime: EdgeUpTimeWidgetMockData.totalUptime,
    totalDowntime: EdgeUpTimeWidgetMockData.totalDowntime,
    isLoading: false
  }


  return (
    <Loader states={[queryResults]}>
      <UI.Wrapper>
        <UI.EdgeStatusHeader col={{ span: 16 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Switch Status' })}
            <Tooltip
              title={
                $t({ defaultMessage: 'Historical data is slightly delayed, and not real-time' })}>
              <UI.HistoricalIcon />
            </Tooltip>
          </Card.Title>
        </UI.EdgeStatusHeader>
        <UI.Status col={{ span: 8 }} style={{ height: '20px' }}>
          {$t({ defaultMessage: 'Total Uptime' })}
          {': '}
          <UI.Duration>
            {milliSecondsToHm((EdgeUpTimeWidgetMockData?.totalUptime * 1000) || 0)}
          </UI.Duration>
        </UI.Status>
        {/* <UI.Status col={{ span: 4 }}>
          {$t({ defaultMessage: 'Total Downtime' })}
          {': '}
          <UI.Duration>{milliSecondsToHm(queryResults?.switchTotalDowntime || 0)}</UI.Duration>
        </UI.Status> */}
        <GridCol col={{ span: 24 }} style={{ height: '50px' }}>
          <AutoSizer>
            {({ height, width }) =>
              EdgeUpTimeWidgetMockData.timeSeries?.isEdgeUp.length ? (
                <MultiBarTimeSeriesChart
                  style={{ width, height }}
                  data={[
                    {
                      key: 'SwitchStatus',
                      name: 'switch',
                      color: cssStr('--acx-semantics-green-50'),
                      data: queryResults?.timeSeries as [
                        TimeStamp,
                        string,
                        TimeStamp,
                        number | null,
                        string
                      ][]
                    }
                  ]}
                  chartBoundary={[
                    moment(filters?.startDate).valueOf(),
                    moment(filters?.endDate).valueOf()
                  ]}
                  hasXaxisLabel
                />
              ) : (
                <NoData />
              )
            }
          </AutoSizer>
        </GridCol>
      </UI.Wrapper>
    </Loader>
  )
}