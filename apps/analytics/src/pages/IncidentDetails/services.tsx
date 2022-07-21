import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'

import { IncidentDetailsProps } from './types'

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentDetails: build.query({
      query: (payload) => {
        return {
          document: gql`
          query IncidentDetails ($id: String) {
            incident(id: $id) {
              id
              code
            }
          }
        `,
          variables: {
            id: payload
          }
        }}
    })
  })
})

export const { useIncidentDetailsQuery } = api
