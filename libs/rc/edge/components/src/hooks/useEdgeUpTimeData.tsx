import { useMemo } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import { calculateGranularity, getSeriesData, TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { cssStr }                                                   from '@acx-ui/components'
import { useGetEdgeUptimeQuery }                                    from '@acx-ui/rc/services'
import { EdgeStatusTimeSeries, EdgeTimeSeriesPayload }              from '@acx-ui/rc/utils'
import { TimeStamp }                                                from '@acx-ui/types'

const emptyData = {
  timeSeries: {
    time: [],
    isEdgeUp: []
  },
  totalUptime: 0,
  totalDowntime: 0
}

export const useEdgeUpTimeData = (props: {
  serialNumber: string | undefined,
  filters: { startDate:string, endDate:string } | undefined
}) => {
  const { $t } = useIntl()
  const { serialNumber, filters } = props

  type Key = keyof Omit<EdgeStatusTimeSeries, 'time'>

  const seriesMapping = [
    { key: 'isEdgeUp', name: $t({ defaultMessage: 'EdgeStatus' }) }
  ] as Array<{ key: Key; name: string }>

  const { data = emptyData, isLoading } = useGetEdgeUptimeQuery({
    params: { serialNumber },
    payload: {
      start: filters?.startDate,
      end: filters?.endDate,
      granularity: calculateGranularity(filters?.startDate!, filters?.endDate!)
    } as EdgeTimeSeriesPayload
  }, { skip: !serialNumber || !filters })

  const queryResults = (isLoading || !filters) ? emptyData : {
    timeSeries: getStartAndEndTimes(getSeriesData(data!.timeSeries, seriesMapping))
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