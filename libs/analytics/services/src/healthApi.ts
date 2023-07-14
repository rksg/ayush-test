import { gql } from 'graphql-request'

import {
  getSelectedNodePath,
  getFilterPayload,
  AnalyticsFilter,
  calculateGranularity,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { dataApi }     from '@acx-ui/store'
import { NodesFilter } from '@acx-ui/utils'

export interface KpiThresholdType {
  timeToConnect: number
  rss: number
  clientThroughput: number
  apCapacity: number
  apServiceUptime: number
  apToSZLatency: number
  switchPoeUtilization: number
  clusterLatency: number
}

type datum = number []
export type KPITimeseriesResponse = {
  data: datum[]
  time: string[]
}

interface TimeseriesResponse <TimeSeriesData> {
  network: { timeSeries: TimeSeriesData }
}
export type KPIHistogramResponse = {
  data: number []
}

interface HistogramResponse <HistogramData> {
  network: { histogram: HistogramData }
}

export type KpiPayload = AnalyticsFilter & {
  kpi: string;
  threshold?: string;
  granularity?: string;
} & { apCount?: number }

type ConfigCode = keyof typeof kpiConfig

type ThresholdPermissionResponse = {
  mutationAllowed: boolean
}

type ThresholdPermissionPayload = {
  filter: NodesFilter
}

type ThresholdMutationPayload = {
  filter: NodesFilter,
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

const getGranularity = (start: string, end: string, kpi: string, apCount: number) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { timeseries: { minGranularity } } = config
  return calculateGranularity(start, end, minGranularity, apCount)
}
const getHistogramQuery = (kpi: string) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { apiMetric, splits } = Object(config).histogram
  return `
    query histogramKPI(
      $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $filter: FilterInput
    ) {
      network(filter: $filter) {
        histogram: histogram(path: $path, start: $start, end: $end) {
          data: ${apiMetric}(splits: [${splits.join(', ')}])
        }
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
  clusterLatencyThreshold?: ThresholdData
}
interface APCountForNode {
  apCount?: number
}
interface APCountResponse <APCountForNode> {
  network: {
    node: APCountForNode
  }
}
type KpisHavingThreshold = keyof KpiThresholdType

export type KpiThresholsPayload = AnalyticsFilter & { kpis?: KpisHavingThreshold[] }

const getHealthFilter = (payload: Omit<KpiPayload, 'range'>) => { // we do not want to filter switches to always display poe info
  const { filter: { ssids, networkNodes } } = getFilterPayload(payload)
  return { filter: { ssids, networkNodes } }
}

export const healthApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    kpiTimeseries: build.query<KPITimeseriesResponse, Omit<KpiPayload, 'range'>>({
      query: (payload) => ({
        document: gql`
        query timeseriesKPI(
          $start: DateTime, $end: DateTime, $granularity: String, $filter: FilterInput
        ) {
          network(filter: $filter) {
            timeSeries: timeSeries(
              start: $start
              end: $end
              granularity: $granularity
            ) {
              time
              data: ${getKPIMetric(payload.kpi, payload.threshold)}
            }
          }
        }
      `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          granularity: payload.granularity ||
          getGranularity(payload.startDate, payload.endDate, payload.kpi, payload.apCount ?? 0),
          ...getHealthFilter(payload)
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'KPI_TIMESERIES' }],
      transformResponse: (
        response: TimeseriesResponse<KPITimeseriesResponse>
      ) => response.network.timeSeries
    }),
    kpiHistogram: build.query<
      KPIHistogramResponse,
      KpiPayload
    >({
      query: (payload) => ({
        document: gql`${getHistogramQuery(payload.kpi)}`,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          ...getHealthFilter(payload)
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'HISTOGRAM_PILL' }],
      transformResponse: (response: HistogramResponse<KPIHistogramResponse>) =>
        response.network.histogram
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
            path: getSelectedNodePath(payload.filter)
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
          path: getSelectedNodePath(payload.filter)
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
              $path: [HierarchyNodeInput]
            ) {
              saveThreshold: KPIThreshold(name: $name, value: $value, networkPath: $path) {
                success
              }
            }
          `,
        variables: {
          path: getSelectedNodePath(payload.filter),
          name: payload.name,
          value: payload.value
        }
      }
      )
    }),
    apCountForNode: build.query<APCountResponse<APCountForNode>, Omit<KpiPayload, 'kpi'>>({
      query: (payload) => ({
        document: gql`
        query APCountForNode(
          $path: [HierarchyNodeInput], $startDate: DateTime,
          $endDate: DateTime, $filter: FilterInput
        ){
          network(start: $startDate, end: $endDate, filter: $filter) {
            node: hierarchyNode(path:$path) {
              apCount
            }
          }
        }
      `,
        variables: {
          ...payload,
          path: getSelectedNodePath(payload.filter)
        }
      })
    })
  })
})
