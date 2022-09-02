import { createContext } from 'react'

import { MdnsProxySaveData } from '@acx-ui/rc/utils'

export interface MdnsProxyFormContextType {
  editMode: boolean,
  data?: MdnsProxySaveData
}
const MdnsProxyFormContext = createContext({} as MdnsProxyFormContextType)

export default MdnsProxyFormContext

