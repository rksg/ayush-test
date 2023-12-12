import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

import {
  NetworkImpactChartConfig,
  NetworkImpactChartTypes,
  NetworkImpactQueryTypes
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
  incident: Record<string, NetworkImpactChartData | number>
}

type ResultType = Partial<Record<NetworkImpactChartTypes, NetworkImpactChartData>>

const transformResponse = ({ incident }: Response, _: {}, payload: RequestPayload) => {
  return payload.charts.reduce((agg: ResultType, { chart, query, dimension }) => {
    const result = incident[chart] as NetworkImpactChartData
    agg[chart] = query === NetworkImpactQueryTypes.Distribution
      ? { ...result,
        count: incident[`${dimension}Peak`] as number,
        data: result.data.map(item => ({ ...item, name: item.key })) }
      : { ...result, data: result.data.map(item => ({ ...item, name: item.key })) }
    return agg
  }, {})
}

export const networkImpactChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkImpactCharts: build.query<ResultType, RequestPayload>({
      query: ({ charts, incident }) => {
        const queries = charts.map(({ chart, query, type, dimension }) => {
          switch(query){
            case NetworkImpactQueryTypes.Distribution:
              return [
                gql`${chart}: getDistribution(by: "${type}") { data { key value } }`,
                gql`${dimension}Peak: getPeak(by: "${dimension}")`
              ]
            case  NetworkImpactQueryTypes.TopN:
            default:
              return [
                gql`${chart}: topN(n: 10, by: "${dimension}", type: "${type}") {
                  count data { key value }
                }`
              ]
          }
        }).flat()
        return {
          document: gql`
            query NetworkImpactCharts(
              $id: String
            ) {
              incident(id: $id) {
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
