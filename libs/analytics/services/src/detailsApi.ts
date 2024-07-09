import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

interface APDetails {
  name: string
  networkPath: NetworkPath
}

interface SwitchDetails {
  name: string
  networkPath: NetworkPath
}

interface DetailsPayload {
  path?: NetworkPath
  startDate: string
  endDate: string,
  mac: string
}

export const detailsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    apDetails: build.query<APDetails, DetailsPayload>({
      query: (payload) => ({
        document: gql`
        query APDetails(
          $path: [HierarchyNodeInput], $startDate: DateTime,
          $endDate: DateTime, $mac: String
        ){
          network(start: $startDate, end: $endDate) {
            ap(path: $path mac: $mac) {
              name
              networkPath {
                name
                type
              }
            }
          }
        }
      `,
        variables: {
          ...payload
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'AP_DETAILS' }],
      transformResponse: (response: { network: { ap: APDetails } }) => response.network.ap
    }),
    switchDetails: build.query<SwitchDetails, DetailsPayload>({
      query: (payload) => ({
        document: gql`
        query SwitchDetails(
          $path: [HierarchyNodeInput], $startDate: DateTime,
          $endDate: DateTime, $mac: String
        ){
          network(start: $startDate, end: $endDate) {
            switch(path: $path mac: $mac) {
              name
              networkPath {
                name
                type
              }
            }
          }
        }
      `,
        variables: {
          ...payload
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'SWITCH_DETAILS' }],
      transformResponse: (response:
        { network: { switch: SwitchDetails } }) => response.network.switch
    })
  })
})
export const { useApDetailsQuery, useSwitchDetailsQuery } = detailsApi