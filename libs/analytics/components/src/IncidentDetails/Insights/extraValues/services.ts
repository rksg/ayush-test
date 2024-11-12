import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/store'

export interface RogueAP {
  rogueApMac: string
  rogueSSID: string
  rogueType: string
  maxRogueSNR: number
  apName: string
  apMac: string
}

export interface RequestPayload {
  id: string
  search: string
  n: number
  impactedStart?: string
  impactedEnd?: string
}

interface Response <T> {
  incident: T
}

export const drawerApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    rogueAPs: build.query<{ rogueAPs: RogueAP[], rogueAPCount: number }, RequestPayload>({
      query: (payload) => ({
        document: gql`
          query rogueAPs(
            $id: String,
            $n: Int,
            $search: String,
            $impactedStart: DateTime,
            $impactedEnd: DateTime
          ) {
            incident(id: $id, impactedStart: $impactedStart, impactedEnd: $impactedEnd) {
              rogueAPCount
              rogueAPs(n: $n, search: $search) {
                rogueApMac rogueSSID rogueType maxRogueSNR apName apMac
              }
            }
          }
        `,
        variables: payload
      }),
      transformResponse: (response: Response<{ rogueAPs: RogueAP[], rogueAPCount: number }>) =>
        response.incident
    })
  })
})

export const { useRogueAPsQuery } = drawerApi
