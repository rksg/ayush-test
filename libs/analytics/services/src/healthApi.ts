import { gql } from 'graphql-request'

import { AnalyticsFilter, calculateGranularity, kpiConfig } from '@acx-ui/analytics/utils'

import { dataApi } from './dataApi'

interface TimeseriesResponse <TimeSeriesData> {
  timeSeries: TimeSeriesData
}

type datum = number[]

export type KPITimeseriesResponse = {
  data: datum[]
  time: string[]
}

export type KpiPayload = AnalyticsFilter & {
  kpi: string;
  threshold?: string;
  granularity?: string;
}

export const healthApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    kpiTimeseries: build.query<KPITimeseriesResponse, KpiPayload>({
      query: (payload) => ({
        document: gql`
        query timeseriesKPI(
          $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $granularity: String
        ) {
          timeSeries: timeSeries(
            path: $path
            start: $start
            end: $end
            granularity: $granularity
          ) {
            time
            data: ${getKPIMetric(payload.kpi, payload.threshold)}
          }
        }
      `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: payload.granularity ||
           getGranularity(payload.startDate, payload.endDate, payload.kpi)
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'KPI_TIMESERIES' }],
      transformResponse: (
        response: TimeseriesResponse<KPITimeseriesResponse>
      ) => response.timeSeries
    })
  })
})

const getKPIMetric = (kpi: string, threshold?: string) : string => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { timeseries: { apiMetric } } = config
  return threshold
    ? `${apiMetric}(threshold: ${threshold})`
    : apiMetric
}

const getGranularity = (start: string, end: string, kpi: string) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { timeseries: { minGranularity } } = config
  return calculateGranularity(start, end, minGranularity)
}
