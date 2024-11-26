import { createContext } from 'react'

import { SwitchSlot } from '@acx-ui/rc/utils'

import { VlanSettingInterface } from './PortProfileModal'

export interface VlanPortsType {
  editMode: boolean
  currentVlanId?: string
  vlanSettingValues: VlanSettingInterface
  setVlanSettingValues: (data: VlanSettingInterface) => void
  isSwitchLevel?: boolean
  switchFamilyModel?: string
  portSlotsData?: SwitchSlot[][]
  vlanId?: number
}
const VlanPortsContext = createContext({} as VlanPortsType)

export default VlanPortsContext