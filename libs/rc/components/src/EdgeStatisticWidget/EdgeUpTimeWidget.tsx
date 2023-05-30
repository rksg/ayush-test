import _             from 'lodash'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import AutoSizer     from 'react-virtualized-auto-sizer'


import { calculateGranularity, TimeSeriesChartData, getSeriesData }                from '@acx-ui/analytics/utils'
import { Card, Loader, NoData, MultiBarTimeSeriesChart, GridCol, cssStr, Tooltip } from '@acx-ui/components'
import { formatter }                                                               from '@acx-ui/formatter'
import { useGetEdgeUptimeQuery }                                                   from '@acx-ui/rc/services'
import { EdgeStatusTimeSeries, EdgeTimeSeriesPayload }                             from '@acx-ui/rc/utils'
import { TimeStamp }                                                               from '@acx-ui/types'
import { useDateFilter }                                                           from '@acx-ui/utils'

import * as UI from './styledComponents'

function getStartAndEndTimes (timeSeries: TimeSeriesChartData[]) {
  return timeSeries?.[0]?.data?.reduce((startEndTimes, dataPoint, index) => {
    const [time, value] = dataPoint
    if (index === 0 || value !== timeSeries?.[0]?.data[index - 1][1]) {
      const seriesColor =
        value === 1
          ? cssStr('--acx-semantics-green-50')
          : (cssStr('--acx-semantics-red-50') as string)
      startEndTimes.push([time, 'edgeStatus', time, value, seriesColor])
    } else {
      const lastStartEndTime = startEndTimes[startEndTimes.length - 1]
      lastStartEndTime[2] = time
    }
    return startEndTimes
  }, [] as [TimeStamp, string, TimeStamp, number | null, string][])
}

export function EdgeUpTimeWidget () {

  const { $t } = useIntl()
  const filters = useDateFilter()
  const params = useParams()

  type Key = keyof Omit<EdgeStatusTimeSeries, 'time'>

  const seriesMapping = [
    { key: 'isEdgeUp', name: $t({ defaultMessage: 'EdgeStatus' }) }
  ] as Array<{ key: Key; name: string }>

  const emptyData = {
    timeSeries: {
      time: [],
      isEdgeUp: []
    },
    totalUptime: 0,
    totalDowntime: 0
  }

  const { data = emptyData, isLoading } = useGetEdgeUptimeQuery({
    params: { serialNumber: params.serialNumber },
    payload: {
      start: filters?.startDate,
      end: filters?.endDate,
      granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M')
    } as EdgeTimeSeriesPayload
  })

  const queryResults = isLoading ? emptyData : {
    timeSeries: getStartAndEndTimes(getSeriesData(data!.timeSeries, seriesMapping))
      ?.filter((dataPoint) => dataPoint?.[3] === 1 || dataPoint?.[3] === 0)
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
    totalUptime: data!.totalUptime,
    totalDowntime: data!.totalDowntime
  }


  return (
    <Loader states={[{ isLoading }]}>
      <UI.Wrapper>
        <UI.EdgeStatusHeader col={{ span: 16 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Edge Status' })}
            <Tooltip
              title={$t({
                defaultMessage: 'Historical data is slightly delayed, and not real-time'
              })}>
              <UI.HistoricalIcon />
            </Tooltip>
          </Card.Title>
        </UI.EdgeStatusHeader>
        {_.isEmpty(queryResults.timeSeries) ?
          <GridCol col={{ span: 24 }} style={{ height: '50px' }}>
            <AutoSizer>
              {() =><NoData />}
            </AutoSizer>
          </GridCol>:
          <>
            <UI.Status col={{ span: 4 }} style={{ height: '20px' }}>
              {$t({ defaultMessage: 'Total Uptime' })}
              {': '}
              <UI.Duration>
                {formatter('durationFormat')((queryResults.totalUptime * 1000) || 0)}
              </UI.Duration>
            </UI.Status>
            <UI.Status col={{ span: 4 }}>
              {$t({ defaultMessage: 'Total Downtime' })}
              {': '}
              <UI.Duration>
                {formatter('durationFormat')(queryResults?.totalDowntime * 1000 || 0)}
              </UI.Duration>
            </UI.Status>
            <GridCol col={{ span: 24 }} style={{ height: '50px' }}>
              <AutoSizer>
                {({ height, width }) =>
                  <MultiBarTimeSeriesChart
                    style={{ width, height }}
                    data={[
                      {
                        key: 'EdgeStatus',
                        name: 'Edge',
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
                }
              </AutoSizer>
            </GridCol>
          </>
        }
      </UI.Wrapper>
    </Loader>
  )
}