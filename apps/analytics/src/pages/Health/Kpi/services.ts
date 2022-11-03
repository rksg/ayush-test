import { gql } from 'graphql-request'

import { healthApi, KPITimeseriesResponse } from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig }       from '@acx-ui/analytics/utils'

export type { KPITimeseriesResponse }

export type KPIHistogramResponse = {
  data: number []
}

interface HistogramResponse <HistogramData> {
  histogram: HistogramData
}

export type KpiPayload = AnalyticsFilter & {
  kpi: string;
  threshold?: string;
  granularity?: string;
}

const getHistogramQuery = (kpi: string) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { apiMetric, splits } = Object(config).histogram
  return `
    query histogramKPI($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime) {
      histogram: histogram(path: $path, start: $start, end: $end) {
        data: ${apiMetric}(splits: [${splits.join(', ')}])
      }
    }
  `
}
export const api = healthApi.injectEndpoints({
  endpoints: (build) => ({
    kpiHistogram: build.query<
    KPIHistogramResponse,
    KpiPayload
    >({
      query: (payload) => ({
        document: gql`${getHistogramQuery(payload.kpi)}`,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'HISTOGRAM_PILL' }],
      transformResponse: (response: HistogramResponse<KPIHistogramResponse>) =>
        response.histogram
    })
  })
})

export const {
  useKpiHistogramQuery,
  useKpiTimeseriesQuery
} = api
