import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'


export interface ImpactedSwitchPort {
  portNumber: string
  portMac: string
}

export interface ImpactedSwitch {
  name: string
  mac: string
  ports: ImpactedSwitchPort[]
}

interface CongestedUplinkPortsRes {
  uplinkPortCount: number
  impactedSwitches: ImpactedSwitch[]
}

interface Response<T> {
  incident: T
}

const document = gql`
  query ImpactedSwitches($id: String) {
    incident(id: $id) {
      uplinkPortCount
      impactedSwitches: getImpactedSwitches(n: 999999, search: "") {
        name
        mac
        ports {
          portNumber
          portMac
        }
      }
    }
  }
`
export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedSwitches: build.query<CongestedUplinkPortsRes, { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<CongestedUplinkPortsRes>) => {
        return response.incident
      }
    })
  })
})

export const {
  useImpactedSwitchesQuery
} = impactedApi
