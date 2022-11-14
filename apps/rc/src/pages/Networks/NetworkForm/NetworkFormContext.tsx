import { createContext } from 'react'

import { NetworkSaveData } from '@acx-ui/rc/utils'
export interface NetworkFormContextType {
  editMode: boolean,
  cloneMode: boolean,
  data: NetworkSaveData | null
  setData?: (data: NetworkSaveData) => void
}
const NetworkFormContext = createContext({} as NetworkFormContextType)

export default NetworkFormContext

