import { gql } from 'graphql-request'

import { intentAIApi } from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

export type SummaryItem = {
  new: number
  active: number
  paused: number
  verified: number
}

export type IntentSummary = {
  rrm: SummaryItem
  probeflex: SummaryItem
  ops: SummaryItem
  ecoflex: SummaryItem
}

export interface Payload {
  path: NetworkPath
}

interface Response <IntentSummary> {
  highlights: IntentSummary
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAISummary: build.query<
      IntentSummary,
      Payload
    >({
      query: (payload) => ({
        document: gql`
          query IntentAISummary(
            $path: [HierarchyNodeInput]
          ) {
            highlights(path: $path) {
              rrm {
                new
                active
                paused
                verified
              }
              probeflex {
                new
                active
                paused
                verified
              }
              ops {
                new
                active
                paused
                verified
              }
              ecoflex {
                new
                active
                paused
                verified
              }
            }
          }
        `,
        variables: payload
      }),
      transformResponse: (response: Response<IntentSummary>) =>
        response.highlights
    })
  })
})

export const { useIntentAISummaryQuery } = api
