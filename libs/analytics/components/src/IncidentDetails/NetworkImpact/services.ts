import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

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
  total?: number
  data: { key: string, name: string, value: number }[]
}
export interface Response {
  incident: Record<string, Omit<NetworkImpactChartData, 'key'>>
}

type ResultType = Partial<Record<NetworkImpactChartTypes, NetworkImpactChartData>>

const defaultData = { total: 0, count: 0, data: [] }

const transformResponse = ({ incident }: Response, _: {}, payload: RequestPayload) => {
  return payload.charts.reduce((agg: ResultType, config) => {
    const result = incident[config.chart]
    agg[config.chart] = config.disabled ? defaultData : {
      ...result,
      data: result.data.map(item => ({ ...item, name: item.key }))
    }
    return agg
  }, {})
}

export const networkImpactChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkImpactCharts: build.query<ResultType, RequestPayload>({
      query: ({ charts, incident }) => {
        const queries = charts
          .filter(c => !c.disabled)
          .map(({ chart, type, dimension }) => gql`
            ${chart}: topN(n: 10, by: "${dimension}", type: "${type}") {
              count total data { key value }
            }
          `)
        return {
          document: gql`
            query NetworkImpactCharts(
              $id: String
            ) {
              incident(
                id: $id
              ) {
                ${queries.join('\n')}
              }
            }
          `,
          variables: {
            id: incident.id,
            impactedStart: incident.impactedStart,
            impactedEnd: incident.impactedEnd
          }
        }},
      transformResponse
    })
  })
})
export const { useNetworkImpactChartsQuery } = networkImpactChartsApi
