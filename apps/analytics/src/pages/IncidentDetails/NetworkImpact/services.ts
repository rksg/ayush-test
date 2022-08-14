import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

import { donutCharts } from './config'

export interface RequestPayload {
  incident: Incident,
  charts: string[]
}
export interface DonutChartData {
  key: string
  count: number
  data: { key: string, name: string, value: number }[]
}
export interface Response {
  incident: Record<string, Omit<DonutChartData, 'key'>>
}

const transformResponse = (response: Response, _: {}, payload: RequestPayload) => {
  return Object.entries(donutCharts)
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
    }, {} as Record<string, DonutChartData>)
}

export const donutChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    donutCharts: build.query<
      Record<string, DonutChartData>,
      RequestPayload
    >({
      query: (payload) => {
        const queries = payload.charts.map(
          chart => gql`
            ${donutCharts[chart].key}: topN(
              n: 10,
              by: "${donutCharts[chart].dimension}",
              type: "${donutCharts[chart].type}"
            ) {
              count
              data {
                key
                value
              }
            }`)
        return {
          document: gql`
            query DonutCharts($id: String) {
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
export const { useDonutChartsQuery } = donutChartsApi
