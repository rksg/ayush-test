import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

import {
  networkImpactChartConfigs,
  NetworkImpactChartConfig
} from './config'

export interface RequestPayload {
  incident: Incident,
  charts: NetworkImpactChartConfig[]
}

export interface NetworkImpactChartData {
  key: string
  count: number
  data: { key: string, name: string, value: number }[]
}
export interface Response {
  incident: Record<string, Omit<NetworkImpactChartData, 'key'>>
}

const transformResponse = ({ incident }: Response, _: {}, payload: RequestPayload) => {
  return payload.charts.reduce((agg: Record<string, NetworkImpactChartData>, { chart }) => {
    const { key } = networkImpactChartConfigs[chart]
    agg[key] = {
      ...incident[key],
      key: key,
      data: incident[key].data.map(item => ({ ...item, name: item.key }))
    }
    return agg
  }, {})
}

export const networkImpactChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkImpactCharts: build.query<
      Record<string, NetworkImpactChartData>,
      RequestPayload
    >({
      query: (payload) => {
        const queries = payload.charts.map(({ chart, type, dimension }) => {
          const { key } = networkImpactChartConfigs[chart]
          return gql`${key}: topN(n: 10, by: "${dimension}", type: "${type}") {
            count data { key value }
          }`
        })
        return {
          document: gql`
            query NetworkImpactCharts($id: String) {
              incident(id: $id) { ${queries.join('\n')} }
            }
          `,
          variables: { id: payload.incident.id }
        }},
      transformResponse
    })
  })
})
export const { useNetworkImpactChartsQuery } = networkImpactChartsApi
