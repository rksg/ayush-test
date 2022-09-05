import { createContext } from 'react'

import { DHCPPool } from '@acx-ui/rc/utils'
export interface PoolDetailContextType {
  data: DHCPPool | undefined
}
const PoolDetailContext = createContext({} as PoolDetailContextType)

export default PoolDetailContext

