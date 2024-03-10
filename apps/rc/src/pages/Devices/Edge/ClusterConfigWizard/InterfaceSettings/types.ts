import { EdgeLag, EdgePort, EdgeSerialNumber, VirtualIpSetting } from '@acx-ui/rc/utils'

export interface InterfaceSettingsFormType {
  portSettings: Record<EdgeSerialNumber, { [portId:string]: EdgePort[] }>
  lagSettings: Record<EdgeSerialNumber, EdgeLag[]>
  virtualIpSettings: VirtualIpSetting[]
}

export interface InterfacePortFormCompatibility {
    ports: { isError?: boolean, value: number },
    corePorts: { isError?: boolean, value: number },
    portTypes: { [portType:string]:
       { isError?: boolean, value: number } }
}