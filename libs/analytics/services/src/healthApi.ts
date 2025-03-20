import { gql } from 'graphql-request'

import {
  getSelectedNodePath,
  getFilterPayload,
  calculateGranularity,
  kpiConfig
} from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import { NodesFilter }          from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'

export interface KpiThresholdType {
  timeToConnect: number
  rss: number
  clientThroughput: number
  apCapacity: number
  apServiceUptime: number
  apToSZLatency: number
  switchPoeUtilization: number
  switchMemoryUtilization: number
  switchCpuUtilization: number
  switchStormControl: number
  switchUplinkPortUtilization: number
  switchPortUtilization: number
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
  enableSwitchFirmwareFilter?: boolean | CallableFunction ;
}

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

export const getHistogramQuery =
({ kpi, enableSwitchFirmwareFilter }: KpiPayload) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { apiMetric, splits } = Object(config).histogram

  const shouldEnableFirmwareFilter = typeof enableSwitchFirmwareFilter === 'function'
    ? enableSwitchFirmwareFilter()
    : enableSwitchFirmwareFilter
  const additionalArgs = shouldEnableFirmwareFilter
    ? '$enableSwitchFirmwareFilter: Boolean'
    : ''
  const additionalFields = shouldEnableFirmwareFilter
    ? 'enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter'
    : ''

  return `
    query histogramKPI(
      $path: [HierarchyNodeInput]
      $start: DateTime
      $end: DateTime
      $filter: FilterInput
      ${additionalArgs}) {
      network(filter: $filter) {
        histogram: histogram(
          path: $path
          start: $start
          end: $end
          ${additionalFields}) {
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
  switchMemoryUtilizationThreshold?: ThresholdData
  switchCpuUtilizationThreshold?: ThresholdData
  switchStormControlThreshold?: ThresholdData
  switchUplinkPortUtilizationThreshold?: ThresholdData
  switchPortUtilizationThreshold?: ThresholdData
  clusterLatencyThreshold?: ThresholdData
}

type KpisHavingThreshold = keyof KpiThresholdType

export type KpiThresholdPayload = AnalyticsFilter & { kpis?: KpisHavingThreshold[] }

export const getHealthFilter = (payload: Omit<KpiPayload, 'range'>) => {
  const { filter: { ssids, networkNodes, switchNodes } } = getFilterPayload(payload)
  const enableSwitchFirmwareFilter = typeof payload.enableSwitchFirmwareFilter === 'function'
    ? payload.enableSwitchFirmwareFilter()
    : payload.enableSwitchFirmwareFilter

  return {
    filter: { ssids, networkNodes, switchNodes },
    ...(enableSwitchFirmwareFilter !== undefined && { enableSwitchFirmwareFilter })
  }
}

export const constructTimeSeriesQuery = (payload: Omit<KpiPayload, 'range'>) => {
  const { kpi, threshold, enableSwitchFirmwareFilter } = payload

  const shouldEnableFirmwareFilter = typeof enableSwitchFirmwareFilter === 'function'
    ? enableSwitchFirmwareFilter()
    : enableSwitchFirmwareFilter
  const additionalArgs = shouldEnableFirmwareFilter
    ? '$enableSwitchFirmwareFilter: Boolean'
    : ''
  const additionalFields = shouldEnableFirmwareFilter
    ? 'enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter'
    : ''

  return gql`
    query timeseriesKPI(
      $start: DateTime
      $end: DateTime
      $granularity: String
      $filter: FilterInput
      ${additionalArgs}) {
      network(filter: $filter) {
        timeSeries: timeSeries(
          start: $start
          end: $end
          granularity: $granularity
          ${additionalFields}) {
          time
          data: ${getKPIMetric(kpi, threshold)}
        }
      }
    }
  `
}

export const healthApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    kpiTimeseries: build.query<KPITimeseriesResponse, Omit<KpiPayload, 'range'>>({
      query: (payload) => ({
        document: constructTimeSeriesQuery(payload),
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          granularity: payload.granularity ||
            calculateGranularity(payload.startDate, payload.endDate),
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
        document: gql`${getHistogramQuery(payload)}`,
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
      KpiThresholdPayload
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
    })
  })
})
