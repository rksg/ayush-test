import { createContext } from 'react'

import { Vlan } from '@acx-ui/rc/utils'

import { VlanSettingInterface } from './VlanPortsModal'

export interface VlanPortsType {
  vlanSettingValues: VlanSettingInterface
  setVlanSettingValues: (data: VlanSettingInterface) => void
  vlanList: Vlan[]
}
const VlanPortsContext = createContext({} as VlanPortsType)

export default VlanPortsContext