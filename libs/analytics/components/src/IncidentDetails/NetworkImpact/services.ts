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
  total?: number
  data: { key: string, name: string, value: number }[]
}
export interface Response {
  incident: Record<string, NetworkImpactChartData | number>
}

type ResultType = Partial<Record<NetworkImpactChartTypes, NetworkImpactChartData>>

const defaultData = { total: 0, count: 0, data: [] }

const transformResponse = ({ incident }: Response, _: {}, payload: RequestPayload) => {
  return payload.charts.reduce((agg: ResultType, config) => {
    const result = incident[config.chart] as NetworkImpactChartData
    if (config.query === NetworkImpactQueryTypes.Distribution) {
      agg[config.chart] = {
        ...result,
        count: incident[`${config.dimension}Peak`] as number,
        data: result.data.map(item => ({ ...item, name: item.key }))
      }
    } else {
      agg[config.chart] = config.disabled ? defaultData : {
        ...result,
        data: result.data.map(item => ({ ...item, name: item.key }))
      }
    }
    return agg
  }, {})
}

export const networkImpactChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkImpactCharts: build.query<ResultType, RequestPayload>({
      query: ({ charts, incident }) => {
        const queries = charts.filter(c => !c.disabled).map(({ chart, query, type, dimension }) => {
          switch(query){
            case NetworkImpactQueryTypes.Distribution:
              return [
                gql`${chart}: getDistribution(by: "${type}") { data { key value } }`,
                gql`${dimension}Peak: getPeak(by: "${dimension}", type: "${type}")`
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
              $id: String,
              $impactedStart: DateTime,
              $impactedEnd: DateTime
            ) {
              incident(id: $id, impactedStart: $impactedStart, impactedEnd: $impactedEnd) {
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
