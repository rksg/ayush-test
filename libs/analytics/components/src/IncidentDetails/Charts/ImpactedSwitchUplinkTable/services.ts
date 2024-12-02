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
  deviceIp: string
}

interface ImpactedSwitchPort {
  portNumber: string
  portMac: string
  connectedDevice?: SwitchPortConnectedDevice
}

export interface ImpactedSwitch {
  name: string
  mac: string
  ip: string
  ports: ImpactedSwitchPort[]
}

export type ImpactedSwitchPortRow = ImpactedSwitchPort
  & Pick<ImpactedSwitch, 'name' | 'mac' | 'ip'>
  & { key?: string, index?: number }

interface Response <T> {
  incident: T
}

const document = gql`
  query ImpactedSwitchesUplink($id: String) {
    incident(id: $id) {
      impactedSwitches: getImpactedSwitches(n: 100, search: "") {
        name
        mac
        ip
        ports {
          portNumber
          portMac
          connectedDevice {
            deviceMac: mac
            devicePortMac: portMac
            deviceName: name
            devicePort: port
            deviceIp: ip
          }
        }
      }
    }
  }
`

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedSwitchesUplink: build.query<ImpactedSwitchPortRow[], { id: Incident['id'] }>({
      query: (variables) => ({ document, variables }),
      transformResponse: (response: Response<{ impactedSwitches: ImpactedSwitch[] }>) => {
        return response.incident.impactedSwitches
          .flatMap(({ name, mac, ip, ports }) => ports.map(port => ({ name, mac, ip, ...port })))
      }
    })
  })
})

export const {
  useImpactedSwitchesUplinkQuery
} = impactedApi
