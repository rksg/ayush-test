import { gql } from 'graphql-request'

import { AnalyticsFilter, calculateGranularity, kpiConfig } from '@acx-ui/analytics/utils'
import { NetworkPath }                                      from '@acx-ui/utils'

import { dataApi } from './dataApi'

export interface KpiThresholdType {
  timeToConnect: number;
  rss: number;
  clientThroughput: number;
  apCapacity: number;
  apServiceUptime: number;
  apToSZLatency: number;
  switchPoeUtilization: number;
}

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

export type KpiPayload = AnalyticsFilter & {
  kpi: string;
  threshold?: string;
  granularity?: string;
}

type ConfigCode = keyof typeof kpiConfig

type ThresholdPermissionResponse = {
  mutationAllowed: boolean
}

type ThresholdPermissionPayload = {
  path: NetworkPath
}

type ThresholdMutationPayload = {
  path: NetworkPath,
  name: ConfigCode,
  value: number
}

type ThresholdMutationResponse = {
  data?: Partial<{
    [k in ConfigCode]: {
      success: boolean
    }
  }>
}

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

interface ThresholdData {
  value: number | null
}

interface ThresholdsApiResponse {
  timeToConnectThreshold?: ThresholdData
  clientThroughputThreshold?: ThresholdData
  rssThreshold?: ThresholdData
  apCapacityThreshold?: ThresholdData
  apServiceUptimeThreshold?: ThresholdData
  apToSZLatencyThreshold?: ThresholdData
  switchPoeUtilizationThreshold?: ThresholdData
}

type KpisHavingThreshold = keyof KpiThresholdType

export type KpiThresholsPayload = AnalyticsFilter & { kpis?: KpisHavingThreshold[] }

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
    }),
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
    }),
    getKpiThresholds: build.query<
      ThresholdsApiResponse,
      KpiThresholsPayload
    >({
      query: (payload) => {
        let kpis:KpisHavingThreshold[] = payload.kpis && payload.kpis.length ?
          payload.kpis : ['timeToConnect'] // atleast one kpi should be there
        const queryFields = kpis.map(kpi=>(
          `${kpi}Threshold: KPIThreshold(name: "${kpi}", networkPath: $path) {
          value
        }`)).join('\n')
        return {
          document: gql`
          query GetKpiThresholds($path: [HierarchyNodeInput]) {
            ${queryFields}
          }
          `,
          variables: {
            path: payload.path
          }
        }
      },
      providesTags: [{ type: 'Monitoring', id: 'KPI_THRESHOLD_CONFIG' }]
    }),
    fetchThresholdPermission: build.query<
      ThresholdPermissionResponse,
      ThresholdPermissionPayload
    >({
      query: (payload) => ({
        document: gql`
        query KPI($path: [HierarchyNodeInput]) {
          mutationAllowed: ThresholdMutationAllowed(networkPath: $path)
        }
        `,
        variables: {
          path: payload.path
        }
      })
    }),
    saveThreshold: build.mutation<
      ThresholdMutationResponse,
      ThresholdMutationPayload
    >({
      query: (payload) => ({
        document: gql`
        mutation SaveThreshold(
            $name: String!
            $value: Float!
            $networkPath: [HierarchyNodeInput]
          ) {
            saveThreshold: KPIThreshold(name: $name, value: $value, networkPath: $networkPath) {
              success
            }
          }
        `,
        variables: {
          networkPath: payload.path,
          name: payload.name,
          value: payload.value
        }
      })
    })
  })
})
