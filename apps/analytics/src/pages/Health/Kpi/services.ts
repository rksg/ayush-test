import { gql } from 'graphql-request'

import { dataApi }                    from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'
import { NetworkPath }                from '@acx-ui/utils'

import { calculateGranularity } from '../../../utils'

type datum = number []
export type KPITimeseriesResponse = {
  data: datum[]
  time: string[]
}

interface TimeseriesResponse <TimeSeriesData> {
  timeSeries: TimeSeriesData
}
export type KPIHistogramResponse = {
  data: number []
}

interface HistogramResponse <HistogramData> {
  histogram: HistogramData
}

type ThresholdResponse = {
  threshold: {
    value: number,
    updatedBy: string,
    updatedAt: string
  }
}

type ThresholdPayload = {
  path: NetworkPath,
  name: keyof typeof kpiConfig
}

type ThresholdPermissionResponse = {
  data: {
    ThresholdMutationAllowed: boolean
  }
}

type ThresholdPermissionPayload = {
  path: NetworkPath
}

type KpiPayload = AnalyticsFilter & { kpi: string, threshold?: string }

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
export const timeseriesApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    kpiTimeseries: build.query<
    KPITimeseriesResponse,
    KpiPayload
    >({
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
          granularity: getGranularity(payload.startDate, payload.endDate, payload.kpi)
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'KPI_TIMESERIES' }],
      transformResponse: (response: TimeseriesResponse<KPITimeseriesResponse>) =>
        response.timeSeries
    })
  })
})
const getHistogramQuery = (kpi: string) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { apiMetric, splits } = Object(config).histogram
  return `
    query histogramKPI($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime) {
      histogram: histogram(path: $path, start: $start, end: $end) {
        data: ${apiMetric}(splits: [${splits.join(', ')}])
      }
    }
  `
}
export const histogramApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    kpiHistogram: build.query<
    KPIHistogramResponse,
    KpiPayload
    >({
      query: (payload) => ({
        document: gql`${getHistogramQuery(payload.kpi)}`,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'HISTOGRAM_PILL' }],
      transformResponse: (response: HistogramResponse<KPIHistogramResponse>) =>
        response.histogram
    })
  })
})

export const configApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchThreshold: build.query<
    ThresholdResponse,
    ThresholdPayload
    >({
      query: (payload) => ({
        document: gql`
          query KPI($path: [HierarchyNodeInput], $name: String) {
          threshold: KPIThreshold(name: $name, networkPath: $path) {
            value
            updatedBy
            updatedAt
          }
        }`,
        variables: {
          path: payload.path,
          name: payload.name
        }
      })
    }),
    fetchThresholdWithPermission: build.query<
    ThresholdPermissionResponse,
    ThresholdPermissionPayload
    >({
      query: (payload) => ({
        document: gql`
        query KPI($path: [HierarchyNodeInput]) {
          ThresholdMutationAllowed(networkPath: $path)
        }
        `,
        variables: {
          path: payload.path
        }
      })
    })
  })
})

export const { useKpiTimeseriesQuery } = timeseriesApi
export const { useKpiHistogramQuery } = histogramApi
export const { useFetchThresholdQuery, useFetchThresholdWithPermissionQuery } = configApi
