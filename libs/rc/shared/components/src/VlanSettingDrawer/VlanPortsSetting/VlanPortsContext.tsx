import { createContext } from 'react'

import { Vlan } from '@acx-ui/rc/utils'

import { VlanSettingInterface } from './VlanPortsModal'

export interface VlanPortsType {
  editMode: boolean
  currentVlanId?: string
  vlanSettingValues: VlanSettingInterface
  setVlanSettingValues: (data: VlanSettingInterface) => void
  vlanList: Vlan[]
  // isSwitchLevel?: boolean
  // switchFamilyModel?: string
  portsUsedByLag?: string[]
}
const VlanPortsContext = createContext({} as VlanPortsType)

export default VlanPortsContext