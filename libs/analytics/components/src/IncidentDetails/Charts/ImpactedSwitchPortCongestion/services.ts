
import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export type ImpactedSwitchPort = {
  portNumber: string
  connectedDevice: {
    name: string
    mac: string
  }
}
export interface ImpactedSwitch {
  name: string
  mac: string
  model: string
  firmware: string
  ports: ImpactedSwitchPort[]
}


export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    portImpactedSwitch: build.query<
      ImpactedSwitch, { id: Incident['id'], n: number,search: String }
    >({
      query: (variables) => ({
        variables,
        document: gql`
          query ImpactedSwitches($id: String, $n: Int, $search: String) {
            incident(id: $id) {
              impactedSwitches: getImpactedSwitches(n: $n, search: $search) {
                name mac model firmware 
                ports {
                  portNumber
                  connectedDevice {
                    name
                    mac
                  }
                }
              }
            }
          }`
      }),
      providesTags: [{ type: 'Monitoring', id: 'INCIDENT_CODE' }],
      transformResponse: (response: { incident: { impactedSwitches: ImpactedSwitch[] } } ) => {
        if(response.incident.impactedSwitches.length){
          return { ...response.incident.impactedSwitches[0],
            model: response.incident.impactedSwitches[0].model.split('-')[0] }
        }
        return response.incident.impactedSwitches[0]
      }
    })
  })
})

export const {
  usePortImpactedSwitchQuery
} = api
