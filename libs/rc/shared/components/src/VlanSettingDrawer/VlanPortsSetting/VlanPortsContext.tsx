import { createContext } from 'react'

import { Vlan, SwitchSlot } from '@acx-ui/rc/utils'

import { PortsUsedByProps } from '..'

import { VlanSettingInterface } from './VlanPortsModal'

export interface VlanPortsType {
  editMode: boolean
  currentVlanId?: string
  vlanSettingValues: VlanSettingInterface
  setVlanSettingValues: (data: VlanSettingInterface) => void
  vlanList: Vlan[]
  isSwitchLevel?: boolean
  switchFamilyModel?: string
  portSlotsData?: SwitchSlot[][]
  portsUsedBy?: PortsUsedByProps
  vlanId?: number
}
const VlanPortsContext = createContext({} as VlanPortsType)

export default VlanPortsContext