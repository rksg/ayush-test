import { gql } from 'graphql-request'

import { dataApi }                    from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'

import { getSparklineGranularity } from '../../utils'

import { KpiNames, KpiList } from './index'

interface KpiConfig{
  name: string
  defaultThreshold: number | null
}

const kpiMetricMap:KpiList<KpiConfig> = {
  connectionSuccess: {
    name: 'connectionSuccessAndAttemptCount',
    defaultThreshold: null
  },
  timeToConnect: {
    name: 'ttcCountAndConnectionCount',
    defaultThreshold: kpiConfig.timeToConnect.histogram.initialThreshold
  },
  clientThroughput: {
    name: 'throughputCountAndSessionCount',
    defaultThreshold: kpiConfig.clientThroughput.histogram.initialThreshold
  }
}

export type TimeseriesData = Array<[number, number] | null>

interface Response <T> {
  timeSeries: {
    data: T
  }
}
interface PayloadData {
  name: KpiNames
  threshold?: number | null
  filters: AnalyticsFilter
}

const getThresholdParam = (value:number | null)=>{
  return value ? `(threshold: ${value})` : ''
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    getKpiTimeseries: build.query<
      TimeseriesData,
      PayloadData
    >({
      query: (payload) => {
        const kpiName = kpiMetricMap[payload.name].name
        const threshold = getThresholdParam(payload.threshold ??
          kpiMetricMap[payload.name].defaultThreshold)
        return {
          document: gql`
          query KpiWidget(
              $start: DateTime,
              $end: DateTime,
              $path: [HierarchyNodeInput],
              $granularity: String) {
              timeSeries(start: $start, end: $end, granularity: $granularity, path: $path) {
                data: ${kpiName}${threshold}
              }
            }
          `,
          variables: {
            path: payload.filters.path,
            start: payload.filters.startDate,
            end: payload.filters.endDate,
            granularity: getSparklineGranularity(payload.filters.startDate, payload.filters.endDate)
          }
        }
      },
      transformResponse: (response: Response<TimeseriesData>) =>
        response.timeSeries.data
    })
  })
})

export const { useGetKpiTimeseriesQuery } = api
