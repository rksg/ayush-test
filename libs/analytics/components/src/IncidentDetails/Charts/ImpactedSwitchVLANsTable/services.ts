import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface VLAN {
  id: number
  name: string
}

export interface SwitchPortConnectedDevice <Metadata = Record<string, unknown>> {
  isAP: boolean
  type: string
  name: string
  mac: string
  portMac: string
  port: string
  description: string
  vlans: VLAN[]
  untaggedVlan: VLAN | null
  metadata?: Metadata
}

interface ImpactedSwitchPort {
  portNumber: string
  portMac: string
  vlans: VLAN[]
  untaggedVlan: VLAN | null
  mismatchedVlans: VLAN[]
  mismatchedUntaggedVlan: VLAN | null
  connectedDevice: SwitchPortConnectedDevice
}

export interface ImpactedSwitch {
  name: string
  mac: string
  ports: ImpactedSwitchPort[]
}

export type ImpactedSwitchPortRow = ImpactedSwitchPort
  & Pick<ImpactedSwitch, 'name' | 'mac'>
  & { key?: string, index?: number }

interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedSwitchVLANs($id: String) {
    incident(id: $id) {
      impactedSwitchVLANs: getImpactedSwitches(n: 100, search: "") {
        name
        mac
        ports {
          portNumber
          portMac
          vlans { id name }
          untaggedVlan { id name }
          mismatchedVlans { id name }
          mismatchedUntaggedVlan { id name }
          connectedDevice {
            mac portMac name type isAP port description
            vlans { id name }
            untaggedVlan { id name }
          }
        }
      }
    }
  }
`

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedSwitchVLANs: build.query<ImpactedSwitchPortRow[], { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<{ impactedSwitchVLANs: ImpactedSwitch[] }>) => {
        return response.incident.impactedSwitchVLANs
          .flatMap(({ name, mac, ports }) => ports.map(port => ({ name, mac, ...port })))
      }
    })
  })
})

export const {
  useImpactedSwitchVLANsQuery
} = impactedApi
