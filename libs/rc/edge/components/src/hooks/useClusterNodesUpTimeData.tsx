import { useCallback, useEffect, useMemo, useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { calculateGranularity, getSeriesData, TimeSeriesChartData }         from '@acx-ui/analytics/utils'
import { cssStr }                                                           from '@acx-ui/components'
import { useLazyGetEdgeUptimeQuery }                                        from '@acx-ui/rc/services'
import { EdgeStatusTimeSeries, EdgeTimeSeriesPayload, EdgeTotalUpDownTime } from '@acx-ui/rc/utils'
import { TimeStamp }                                                        from '@acx-ui/types'

type Key = keyof Omit<EdgeStatusTimeSeries, 'time'>

export const useClusterNodesUpTimeData = (props: {
  serialNumbers: string[] | undefined,
  filters: { startDate:string, endDate:string }
}) => {
  const { $t } = useIntl()
  const { serialNumbers, filters } = props
  const [getEdgeUptime] = useLazyGetEdgeUptimeQuery()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [queryResults, setQueryResults] = useState<{
    serialNumber: string,
    timeSeries: [TimeStamp, string, TimeStamp, number | null, string][],
    totalUptime: number,
    totalDowntime: number
  }[]>([])

  const seriesMapping = [
    { key: 'isEdgeUp', name: $t({ defaultMessage: 'EdgeStatus' }) }
  ] as Array<{ key: Key; name: string }>

  const fetchData = useCallback(async () => {
    try {
      if (!serialNumbers?.length || !filters) return []

      const requests = serialNumbers!.map((serialNumber) => getEdgeUptime({
        params: { serialNumber },
        payload: {
          start: filters?.startDate,
          end: filters?.endDate,
          granularity: calculateGranularity(filters?.startDate!, filters?.endDate!)
        } as EdgeTimeSeriesPayload
      }).unwrap())

      const promiseResults = await Promise.allSettled(requests)
      const filteredResults = promiseResults
        .map((result, index) => ({ result, serialNumber: serialNumbers[index] }))
        // eslint-disable-next-line max-len
        .filter((p): p is { result: PromiseFulfilledResult<EdgeTotalUpDownTime>, serialNumber: string } => p.result.status === 'fulfilled')

      const results = filteredResults.map(({ result, serialNumber }) => {
        const data = result.value as EdgeTotalUpDownTime

        return {
          serialNumber,
          // eslint-disable-next-line max-len
          timeSeries: getStartAndEndTimes(getSeriesData(data.timeSeries, seriesMapping))
            ?.filter((dataPoint) => dataPoint?.[3] === 1 || dataPoint?.[3] === 0)
            .map((dataPoint) => {
              let inclusiveDataPoint = dataPoint
              inclusiveDataPoint[2] = moment(dataPoint?.[2])
                .add(
                  moment
                    .duration(calculateGranularity(filters.startDate, filters.endDate))
                    .asSeconds(),
                  'seconds'
                )
                .toISOString()
              return inclusiveDataPoint
            }),
          totalUptime: data!.totalUptime,
          totalDowntime: data!.totalDowntime
        }
      })

      return results
    } catch (error) {
      return []
    }
  }, [serialNumbers, filters])

  useEffect(() => {
    setIsLoading(true)
    fetchData().then((results) => {
      setQueryResults(results)
    }).catch(() => {
      setQueryResults([])
    }).finally(() => {
      setIsLoading(false)
    })
  }, [fetchData])

  return useMemo(() => ({ queryResults, isLoading }), [queryResults])
}

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