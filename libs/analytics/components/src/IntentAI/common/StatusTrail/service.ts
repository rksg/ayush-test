import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { get }         from '@acx-ui/config'
import { intentAIApi } from '@acx-ui/store'

import { Intent }          from '../../config'
import { useIntentParams } from '../../useIntentDetailsQuery'

type Payload = ReturnType<typeof useIntentParams> & {
  loadStatusMetadata?: boolean
}
type LegacyResponse = Intent['statusTrail']
type Response = {
  total: number
  data: Intent['statusTrail']
}

function isLegacyResponse (response: LegacyResponse | Response): response is LegacyResponse {
  return Array.isArray(response)
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentStatusTrail: build.query<Response, Payload>({
      query: ({ loadStatusMetadata, ...variables }) => {
        const coldTierDays = parseInt(get('DRUID_COLD_TIER_DAYS'), 10)
        const since = moment().subtract(coldTierDays, 'days').toJSON()
        return {
          variables: { ...variables, since },
          document: loadStatusMetadata ? gql`
            query IntentStatusTrail(
              $root: String!
              $sliceId: String!
              $code: String!
              $since: DateTime!
            ) {
              intent(root: $root, sliceId: $sliceId, code: $code) {
                statusTrail: statusTrailList {
                  total data(since: $since) {
                    status statusReason displayStatus createdAt
                    metadata {
                      scheduledAt: field(prop: "scheduledAt")
                      failures: field(prop: "failures")
                      error: field(prop: "error")
                      changedByName: field(prop: "changedByName")
                      retries: field(prop: "retries")
                    }
                  }
                }
              }
            }
          ` : gql`
            query IntentStatusTrail($root: String!, $sliceId: String!, $code: String!) {
              intent(root: $root, sliceId: $sliceId, code: $code) {
                statusTrail { status statusReason displayStatus createdAt }
              }
            }
          `
        }
      },
      transformResponse: (response: { intent: { statusTrail: LegacyResponse | Response } }) => {
        if (isLegacyResponse(response.intent.statusTrail)) {
          return {
            total: response.intent.statusTrail.length,
            data: response.intent.statusTrail
          }
        }
        return response.intent.statusTrail
      },
      providesTags: [{ type: 'Intent', id: 'INTENT_STATUS_TRAIL' }]
    })
  })
})

export const { useIntentStatusTrailQuery } = api
