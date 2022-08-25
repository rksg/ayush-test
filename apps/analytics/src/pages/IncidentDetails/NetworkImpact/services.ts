import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

import { networkImpactCharts } from './config'

export interface RequestPayload {
  incident: Incident,
  charts: string[]
}
export interface NetworkImpactChartData {
  key: string
  count: number
  data: { key: string, name: string, value: number }[]
}
export interface Response {
  incident: Record<string, Omit<NetworkImpactChartData, 'key'>>
}

const transformResponse = (response: Response, _: {}, payload: RequestPayload) => {
  return Object.entries(networkImpactCharts)
    .filter(([key]) => payload.charts.includes(key))
    .map(([, value]) => value)
    .sort((a, b) => (a.order as number) - (b.order as number))
    .reduce((agg, config) => {
      agg[config.key] = {
        ...response.incident[config.key],
        key: config.key,
        data: response.incident[config.key].data.map(item => ({ ...item, name: item.key }))
      }
      return agg
    }, {} as Record<string, NetworkImpactChartData>)
}

export const networkImpactChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkImpactCharts: build.query<
      Record<string, NetworkImpactChartData>,
      RequestPayload
    >({
      query: (payload) => {
        const queries = payload.charts.map(
          chart => gql`
            ${networkImpactCharts[chart].key}: topN(
              n: 10,
              by: "${networkImpactCharts[chart].dimension}",
              type: "${networkImpactCharts[chart].type}"
            ) {
              count
              data {
                key
                value
              }
            }`)
        return {
          document: gql`
            query NetworkImpactCharts($id: String) {
              incident(id: $id) {
                ${queries.join('\n')}
              }
            }
          `,
          variables: { id: payload.incident.id }
        }},
      transformResponse
    })
  })
})
export const { useNetworkImpactChartsQuery } = networkImpactChartsApi
