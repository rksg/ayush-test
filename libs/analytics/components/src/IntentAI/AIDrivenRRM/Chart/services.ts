import { gql } from 'graphql-request'

import { intentAIApi } from '@acx-ui/store'

type Response = {
  channel: number
  apCount: number
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    apChannelDistribution: build.query<Response[], {
      root: string, sliceId: string, code: string }>({
        query: ({ root, sliceId, code }) => ({
          document: gql`
            query APChannelDistribution($root: String!, $sliceId: String!, $code: String!) {
              intent(root: $root, sliceId: $sliceId, code: $code) {
                apChannelDistribution {
                  channel
                  apCount
                }
              }
            }
          `,
          variables: { root, sliceId, code }
        }),
        transformResponse: (response: { intent: { apChannelDistribution: Response[] } }) => {
          return response.intent.apChannelDistribution
        }
      })
  })
})

export const { useApChannelDistributionQuery } = api
