import { createContext } from 'react'

import { NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'
export interface NetworkFormContextType {
  modalMode?: boolean,
  createType?: NetworkTypeEnum,
  editMode: boolean,
  cloneMode: boolean,
  data: NetworkSaveData | null
  setData?: (data: NetworkSaveData) => void
}
const NetworkFormContext = createContext({} as NetworkFormContextType)

export default NetworkFormContext

