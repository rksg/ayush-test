import React, { useContext } from 'react'

import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'

import { IncidentDetailsProps } from './types'

// interface incidentFilterProps {
//   id: String
// }

// const defaultIncidentFilter = {
//   id: ''
// } as const

// const IncidentFilterContext = React.createContext<incidentFilterProps>(defaultIncidentFilter)

// type IncidentFilter = ReturnType<typeof useIncidentFilter>

// function useIncidentFilter () {
//   const { id } = useContext(IncidentFilterContext)
//   return {
//     id
//   } as const
// }

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentDetails: build.query({
      query: (payload) => ({
        document: gql`
          query IncidentDetails ($id: String) {
            incident(id: $id) {
              id
              code
            }
          }
        `,
        variables: {
          id: payload.id
        }
      })
    })
  })
})

export const { useIncidentDetailsQuery } = api
