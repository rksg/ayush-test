import { createContext } from 'react'

import { DHCPSaveData } from '@acx-ui/rc/utils'
export interface DHCPFormContextType {
  // dhcpConfigType?: DHCPConfigTypeEnum
  // setDHCPConfigType: (dhcpConfigType: DHCPConfigTypeEnum) => void
  editMode: boolean,
  saveState: DHCPSaveData,
  updateSaveState: (data: DHCPSaveData) => void
}
const DHCPFormContext = createContext({} as DHCPFormContextType)

export default DHCPFormContext

