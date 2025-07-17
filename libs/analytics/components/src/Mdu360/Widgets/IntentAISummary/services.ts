import { gql } from 'graphql-request'

import { intentAIApi } from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

export type HighlightItem = {
  new: number
  active: number
  paused: number
  verified: number
}

export type IntentHighlight = {
  rrm?: HighlightItem
  probeflex?: HighlightItem
  ops?: HighlightItem
  ecoflex?: HighlightItem
}

export interface Payload {
  path: NetworkPath
}

interface Response <IntentHighlight> {
  highlights: IntentHighlight
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAISummary: build.query<
      IntentHighlight,
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
        variables: {
          path: payload.path
        }
      }),
      transformResponse: (response: Response<IntentHighlight>) =>
        response.highlights
    })
  })
})

export const { useIntentAISummaryQuery } = api
