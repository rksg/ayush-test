import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

interface ThresholdData {
  value: number | null
}

interface ThresholdsApiResponse {
  timeToConnectThreshold?: ThresholdData
  clientThroughputThreshold?: ThresholdData
}

type KpisHavingThreshold = 'timeToConnect' | 'clientThroughput'

type KpiThresholsPayload = AnalyticsFilter & { kpis?: KpisHavingThreshold[] }

export const getThresholdsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
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
      }
    })
  })
})

export const { useGetKpiThresholdsQuery } = getThresholdsApi
