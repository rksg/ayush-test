import { createContext } from 'react'

import { NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'
export interface NetworkFormContextType {
  networkType?: NetworkTypeEnum
  setNetworkType: (networkType: NetworkTypeEnum) => void
  editMode: boolean,
  cloneMode: boolean,
  data: NetworkSaveData | undefined
}
const NetworkFormContext = createContext({} as NetworkFormContextType)

export default NetworkFormContext

