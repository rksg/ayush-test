import { createContext } from 'react'

import { VlanSettingInterface } from './VlanPortsModal'

export interface VlanPortsType {
  vlanSettingValues: VlanSettingInterface;
  setVlanSettingValues: (data: VlanSettingInterface) => void
}
const VlanPortsContext = createContext({} as VlanPortsType)

export default VlanPortsContext