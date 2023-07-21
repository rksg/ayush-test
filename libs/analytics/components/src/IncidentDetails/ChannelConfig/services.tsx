import { gql } from 'graphql-request'

import type { Incident } from '@acx-ui/analytics/utils'
import { dataApi }       from '@acx-ui/store'
import { noDataDisplay } from '@acx-ui/utils'

type ChannelDetails = {
  channel: string,
  channelRange: string,
  channelWidth: string
}
export type ChannelResponse = Record<'apGroup' | 'zone', {
  channel: { values: string[] }[],
  channelRange: { values: string[] }[],
  channelWidth: { values: string[] }[]
}>

const configQuery = (key: string) => `
  configs(
    key: "initialState.${key}"
    sources: $sources
  ) {
    time
    key
    id
    values
  }
`
const getConfig = (data: ChannelResponse, name: keyof ChannelDetails): string => {
  for (const level of ['apGroup', 'zone']) {
    if (data[level as keyof ChannelResponse][name].length) {
      return data[level as keyof ChannelResponse][name].slice(-1)[0].values.join(', ')
    }
  }
  return noDataDisplay
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    channelDetails: build.query<ChannelDetails, Incident>({
      query: incident => {
        const radio = incident.code.includes('24g') ? '24g' : '5g'
        return {
          document: gql`
            query Config(
              $apGroupPath: [HierarchyNodeInput],
              $zonePath: [HierarchyNodeInput],
              $start: DateTime,
              $end: DateTime,
              $sources: [String]
            ) {
              network(start: $start, end: $end) {
                apGroup: hierarchyNode(path: $apGroupPath) {
                  channel: ${configQuery(`CcmApGroup.radio${radio}.radio.channel`)}
                  channelWidth: ${configQuery(`CcmApGroup.radio${radio}.radio.channel_width`)}
                  channelRange: ${configQuery(`CcmApGroup.radio${radio}.radio.channel_range`)}
                }
                zone: hierarchyNode(path: $zonePath) {
                  channel: ${configQuery(`ccmZone.radio${radio}.radio.channel`)}
                  channelWidth: ${configQuery(`ccmZone.radio${radio}.radio.channel_width`)}
                  channelRange: ${configQuery(`ccmZone.radio${radio}.radio.channel_range`)}
                }
              }
            }
          `,
          variables: {
            apGroupPath: incident.path,
            zonePath: incident.path.slice(0,-1),
            start: incident.startTime,
            end: incident.endTime,
            sources: ['mlisa-data.sz.initial-state', null]
          }
        }
      },
      transformResponse: (response: { network: ChannelResponse }) => ({
        channel: getConfig(response.network, 'channel'),
        channelRange: getConfig(response.network, 'channelRange'),
        channelWidth: getConfig(response.network, 'channelWidth')
      })
    })
  })
})

export const { useChannelDetailsQuery } = api
