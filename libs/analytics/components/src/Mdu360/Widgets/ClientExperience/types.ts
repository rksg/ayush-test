export interface SLAConfig {
  title: string
  shortText?: string
}

export type TimeseriesData = Array<number | null>

export interface TimeseriesPayload {
  start: string
  end: string
}

export interface ClientExperienceTimeseriesResponse {
  franchisorTimeseries: FranchisorTimeseries
}

export interface FranchisorTimeseries {
  time: string[]
  timeToConnectSLA: number[]
  clientThroughputSLA: number[]
  connectionSuccessSLA: number[]
  errors: Array<{
    sla: string
    error: string
  }>
}
