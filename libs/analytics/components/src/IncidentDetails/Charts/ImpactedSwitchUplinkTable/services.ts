import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface VLAN {
  id: number
  name: string
}

export interface SwitchPortConnectedDevice {
  deviceName: string
  deviceMac: string
  devicePortMac: string
  devicePort: string
}

export interface ImpactedSwitchPort {
  portNumber: string
  portMac: string
  connectedDevice?: SwitchPortConnectedDevice
}

export interface ImpactedSwitch {
  name: string
  mac: string
  serial: string
  ports: ImpactedSwitchPort[]
}

export type ImpactedSwitchPortRow = ImpactedSwitchPort
  & Pick<ImpactedSwitch, 'name' | 'mac' | 'serial' >
  & { key?: string, index?: number }

interface CongestedUplinkPortsResponse {
  uplinkPortCount: number
  impactedSwitches: ImpactedSwitch[]
}

interface Response<T> {
  incident: T
}

const document = gql`
  query ImpactedSwitchesUplink($id: String) {
    incident(id: $id) {
      uplinkPortCount
      impactedSwitches: getImpactedSwitches(n: 100, search: "") {
        name
        mac
        serial
        ports {
          portNumber
          connectedDevice {
            deviceMac: mac
            devicePortMac: portMac
            deviceName: name
            devicePort: port
          }
        }
      }
    }
  }
`

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedSwitchesUplink: build.query<CongestedUplinkPortsResponse, { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<CongestedUplinkPortsResponse>) => {
        return response.incident
      }
    })
  })
})

export const {
  useImpactedSwitchesUplinkQuery
} = impactedApi
