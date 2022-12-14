import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

import {
  NetworkImpactChartConfig,
  NetworkImpactChartTypes
} from './config'

export interface RequestPayload {
  incident: Incident,
  charts: NetworkImpactChartConfig[]
}

export interface NetworkImpactChartData {
  count: number
  data: { key: string, name: string, value: number }[]
}
export interface Response {
  incident: Record<string, Omit<NetworkImpactChartData, 'key'>>
}

type ResultType = Partial<Record<NetworkImpactChartTypes, NetworkImpactChartData>>

const transformResponse = ({ incident }: Response, _: {}, payload: RequestPayload) => {
  return payload.charts.reduce((agg: ResultType, { chart }) => {
    const result = incident[chart]
    agg[chart] = {
      ...result,
      data: result.data.map(item => ({ ...item, name: item.key }))
    }
    return agg
  }, {})
}

export const networkImpactChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkImpactCharts: build.query<ResultType, RequestPayload>({
      query: (payload) => {
        const queries = payload.charts.map(({ chart, type, dimension }) => {
          return gql`${chart}: topN(n: 10, by: "${dimension}", type: "${type}") {
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
