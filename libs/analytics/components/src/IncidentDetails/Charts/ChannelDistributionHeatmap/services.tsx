import { gql }                from 'graphql-request'
import moment, { unitOfTime } from 'moment-timezone'

import { Incident, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                        from '@acx-ui/store'

import { HeatmapResponse } from '.'

export type BufferConfig = {
  value: number;
  unit: unitOfTime.Base;
}
export type BufferType = { front: BufferConfig, back: BufferConfig }

 interface Response <HeatmapResponse> {
  network: {
    hierarchyNode: HeatmapResponse
  }
}
export type HeatmapConfig = {
  key: string;
  value: string;
  channel: string;
  count: string;
  countText: string;
}
export interface ChannelDistributionHeatMapProps {
  heatMapConfig: HeatmapConfig;
  incident: Incident;
  buffer: BufferType;
  minGranularity: string
}
export type heatmapType = 'apDistribution' | 'rogueDistribution' | 'dfsEvents'
export function getIncidentTimeSeriesPeriods (incident: Incident, incidentBuffer: BufferType) {
  const { startTime, endTime } = incident
  return {
    start: moment(startTime).subtract(
      incidentBuffer.front.value,
      incidentBuffer.front.unit as unitOfTime.DurationConstructor
    ),
    end: moment(endTime).add(
      incidentBuffer.back.value,
      incidentBuffer.back.unit as unitOfTime.DurationConstructor
    )
  }
}

const apDistribution = (code: string) => `
    apDistribution: timeSeries(granularity: $granularity) {
        time
        heatmap: apDistributionByChannel(filter: {code: "${code}"}) {
        timestamp
        channel
        apCount
        }
    }`
export const rogueDistributionByChannelQuery = (code: string) => `
    rogueDistribution: timeSeries(granularity: $granularity) {
        time
        heatmap: rogueDistributionByChannel(filter: {code: "${code}"}) {
        timestamp
        rogueChannel
        rogueApCount
        }
    }`
export const dfsEventsByChannelQuery = (code: string) => `
    dfsEvents: timeSeries(granularity: $granularity) {
        time
        heatmap: dfsEventsByChannel(filter: {code: "${code}"}) {
        timestamp
        channel
        eventCount
        }
    }`
export const HeatMapChannelFragment = (
  type: heatmapType, code: string
) => {
  switch (type) {
    case 'apDistribution':
      return apDistribution(code)
    case 'rogueDistribution':
      return rogueDistributionByChannelQuery(code)
    case 'dfsEvents':
      return dfsEventsByChannelQuery(code)
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    heatmapDistributionByChannel: build.query<
    HeatmapResponse,
    ChannelDistributionHeatMapProps
    >({
      query: (payload) => {
        return {
          document: gql`
            query IncidentTimeSeries(
              $path: [HierarchyNodeInput]
              $start: DateTime
              $end: DateTime
              $granularity: String
            ) {
              network(start: $start, end: $end) {
                hierarchyNode(path: $path) {
                    ${HeatMapChannelFragment(
                      payload.heatMapConfig.key as heatmapType, payload.incident.code)}
                }
              }
            }
          `,
          variables: {
            ...getIncidentTimeSeriesPeriods(payload.incident, payload.buffer),
            path: payload.incident.path,
            granularity: calculateGranularity(
              payload.incident.startTime,
              payload.incident.endTime,
              payload.minGranularity
            )
          }
        }
      },
      transformResponse: (response: Response<HeatmapResponse>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useHeatmapDistributionByChannelQuery } = api
