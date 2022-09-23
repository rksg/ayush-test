import { gql } from 'graphql-request'

import moment from 'moment-timezone'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { kpiConfig } from './config'
import { calcGranularity } from '../../../utils'

type datum = number []
export type KPITimeseriesResponse = {
  data: datum[]
  time: string[]
}

interface Response <TimeSeriesData> {
  timeSeries: TimeSeriesData   
}
export type KPIHistogramResponse = {
  data: number []
}

interface HistogramResponse <HistogramData> {
  histogram: HistogramData   
}

type KpiPayload = AnalyticsFilter & { kpi: string }
const getKPIMetric = (kpi: string) : string => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { timeseries: { apiMetric } } = config
  const histogram  = Object(config).histogram || null
  return histogram
    ? `${apiMetric}(threshold: ${histogram.initialThreshold})`
    : apiMetric
}
export function getMaxGranularity (...durations: string[]) {
  let max = null
  for (let i = 0; i < durations.length; i++) {
    const duration = durations[i]
    if (!max) {
      max = duration
      continue
    }
    if (duration === 'all') return 'all'
    if (moment.duration(duration).asSeconds() > moment.duration(max).asSeconds()) {
      max = durations[i]
    }
  }
  return max
}
const getGranularity = (start: string, end: string, kpi: string) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { timeseries: { minGranularity } } = config
  return getMaxGranularity(
    calcGranularity(start, end),
    minGranularity
  )
}
export const timeseriesApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    kpiTimeseries: build.query<
    KPITimeseriesResponse,
    KpiPayload
    >({
      query: (payload) => ({
        document: gql`
        query timeseriesKPI(
          $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $granularity: String
        ) {
          timeSeries: timeSeries(
            path: $path
            start: $start
            end: $end
            granularity: $granularity
          ) {
            time
            data: ${getKPIMetric(payload.kpi)}
          }
        }
      `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: getGranularity(payload.startDate, payload.endDate, payload.kpi)
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'KPI_TIMESERIES' }],
      transformResponse: (response: Response<KPITimeseriesResponse>) =>
        response.timeSeries
    })
  })
})
const getHistogramQuery = (kpi: string) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { apiMetric, splits } = Object(config).histogram
  return `
    query pillKPI($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime) {
      histogram: histogram(path: $path, start: $start, end: $end) {
        data: ${apiMetric}(splits: [${splits.join(', ')}])
      }
    }
  `
}
export const histogramApi = dataApi.injectEndpoints({
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

export const { useKpiTimeseriesQuery } = timeseriesApi
export const { useKpiHistogramQuery } = histogramApi
