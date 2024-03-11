import { ClusterNetworkSettings, EdgePort, EdgeSerialNumber } from '@acx-ui/rc/utils'

import { VirtualIpFormType } from '../../EditEdgeCluster/VirtualIp'

export interface InterfaceSettingsFormType {
  portSettings: Record<EdgeSerialNumber, { [portId:string]: EdgePort[] }>
  lagSettings: ClusterNetworkSettings['lagSettings']
  timeout: number
  vipConfig: VirtualIpFormType['vipConfig']
}

export interface InterfacePortFormCompatibility {
    ports: { isError?: boolean, value: number },
    corePorts: { isError?: boolean, value: number },
    portTypes: { [portType:string]:
       { isError?: boolean, value: number } }
}