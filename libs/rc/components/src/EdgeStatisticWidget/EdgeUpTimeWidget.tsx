import { useEffect, useState } from 'react'

import _             from 'lodash'
import moment        from 'moment-timezone'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import AutoSizer     from 'react-virtualized-auto-sizer'

import { calculateGranularity, TimeSeriesChartData, getSeriesData }                from '@acx-ui/analytics/utils'
import { Card, Loader, NoData, MultiBarTimeSeriesChart, GridCol, cssStr, Tooltip } from '@acx-ui/components'
import { useGetEdgeUptimeMutation }                                                from '@acx-ui/rc/services'
import { EdgeStatusTimeSeries, EdgeTimeSeriesPayload }                             from '@acx-ui/rc/utils'
import { TimeStamp }                                                               from '@acx-ui/types'
import { useDateFilter }                                                           from '@acx-ui/utils'

import * as UI from './styledComponents'

interface EdfeUpTimePresentingData { timeSeries: [
    TimeStamp,
    string,
    TimeStamp,
    number | null,
    string
  ][],
  totalUptime: number,
  totalDowntime: number
}

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

export function EdgeUpTimeWidget () {

  const { $t } = useIntl()
  const filters = useDateFilter()
  const params = useParams()

  // state of isLoading
  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [queryResults, setQueryResults] = useState<EdfeUpTimePresentingData | null>(null)
  const [trigger, { isLoading }] = useGetEdgeUptimeMutation()

  type Key = keyof Omit<EdgeStatusTimeSeries, 'time'>


  const seriesMapping = [
    { key: 'isEdgeUp', name: $t({ defaultMessage: 'EdgeStatus' }) }
  ] as Array<{ key: Key; name: string }>

  useEffect(() => {
    const initialWidget = async () => {
      await trigger({
        params: { serialNumber: params.serialNumber },
        payload: {
          start: filters?.startDate,
          end: filters?.endDate,
          granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M')
        } as EdgeTimeSeriesPayload
      }).unwrap()
        .then((data) => {
          const tramformedData = {
            // eslint-disable-next-line max-len
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
            totalDowntime: data!.totalDowntime,
            isLoading: false
          }
          setQueryResults(tramformedData)
          setLoadingState(isLoading)
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err)
        })
    }
    initialWidget()
  }, [filters])

  if (!queryResults || _.isEmpty(queryResults.timeSeries)) {
    return (
      <Loader states={[{ isLoading: loadingState }]}>
        <UI.Wrapper>
          <UI.EdgeStatusHeader col={{ span: 16 }}>
            <Card.Title>
              {$t({ defaultMessage: 'Edge Status' })}
              <Tooltip
                title={
                  $t({ defaultMessage: 'Historical data is slightly delayed, and not real-time' })}>
                <UI.HistoricalIcon />
              </Tooltip>
            </Card.Title>
          </UI.EdgeStatusHeader>
          <GridCol col={{ span: 24 }} style={{ height: '50px' }}>
            <AutoSizer>
              {() =><NoData />}
            </AutoSizer>
          </GridCol>
        </UI.Wrapper>
      </Loader>
    )
  }

  return (
    <Loader states={[{ isLoading: loadingState }]}>
      <UI.Wrapper>
        <UI.EdgeStatusHeader col={{ span: 16 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Edge Status' })}
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
            {milliSecondsToHm((queryResults.totalUptime * 1000) || 0)}
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
            }
          </AutoSizer>
        </GridCol>
      </UI.Wrapper>
    </Loader>
  )
}