import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface ImpactedSwitch {
  name: string
  mac: string
  serial: string
  switchGroup: string
}

export interface ImpactedVlan {
  vlanId: string
  name?: string
  switches: ImpactedSwitch[]
}

interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedVLANs($id: String) {
    incident(id: $id) {
      impactedVLANs: getImpactedVLANs(n: 999999999) {
        vlanId: id
        switches {
          name
          mac
          serial
          switchGroup
        }
      }
    }
  }
`

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedVlans: build.query<[ImpactedVlan], { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<{ impactedVLANs: [ImpactedVlan] }>) => {
        return response.incident.impactedVLANs
      }
    })
  }
  )
})

export const {
  useImpactedVlansQuery
} = impactedApi
