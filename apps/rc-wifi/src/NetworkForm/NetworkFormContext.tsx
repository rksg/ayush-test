import { createContext } from 'react'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'
export interface NetworkFormContextType {
  networkType?: NetworkTypeEnum
  setNetworkType: (networkType: NetworkTypeEnum) => void
  editMode: boolean
}
const NetworkFormContext = createContext({} as NetworkFormContextType)

export default NetworkFormContext

