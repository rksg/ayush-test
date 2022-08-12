import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

import { DonutChart, donutCharts } from './config'

export interface RequestPayload {
  incident: Incident,
  charts: string[]
}
export interface DonutChartData {
  count: number
  data: { key: string, name: string, value: number }[]
}
export interface Response {
  incident: Record<string, DonutChartData>
}

export const generateNetworkImpactSummary = (
  metric: DonutChartData, config: DonutChart, incident: Incident
) => {
  const { count, data } = metric
  const dominance = config.dominanceFn && config.dominanceFn(data, incident)
  if (dominance) {
    return {
      defaultMessage: config.summary.dominance,
      values: {
        percentage: Math.round(dominance.percentage * 100),
        transformedKey: config.transformKeyFn && config.transformKeyFn(dominance.key)
      }
    }
  } else {
    return {
      defaultMessage: config.summary.broad,
      values: { count }
    }
  }
}

export interface transformedDonutChartData {
  title: string
  unit: string
  data: { key: string, name: string, value: number }[]
  summary: {
    defaultMessage: string
    values: Record<string, string|number|undefined>
  }
}

const transformResponse = (response: Response, _: {}, payload: RequestPayload) => {
  return Object.entries(donutCharts)
    .filter(([key]) => payload.charts.includes(key))
    .map(([, value]) => value)
    .sort((a, b) => (a.order as number) - (b.order as number))
    .map(config => {
      const metricData = response.incident[config.dimensionAlias || config.dimension]
      return {
        title: config.title,
        unit: config.unit,
        data: metricData.data.map(item => ({
          ...item,
          name: (config.transformKeyFn && config.transformKeyFn(item.key)) as string,
          value: (config.transformValueFn && config.transformValueFn(item.value)) as number
        })),
        summary: generateNetworkImpactSummary(metricData, config, payload.incident)
      }
    })
    .reduce((agg, chart) => {
      agg[chart.title] = chart
      return agg
    }, {} as Record<string, transformedDonutChartData>)
}

export const donutChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    donutCharts: build.query<
      Record<string, transformedDonutChartData>,
      RequestPayload
    >({
      query: (payload) => {
        const queries = payload.charts.map(
          chart => gql`
            ${donutCharts[chart].dimensionAlias || donutCharts[chart].dimension}: topN(
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
