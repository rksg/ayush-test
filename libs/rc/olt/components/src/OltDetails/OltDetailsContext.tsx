import { createContext } from 'react'

import { Olt } from '@acx-ui/olt/utils'

export const OltDetailsContext = createContext({} as {
  oltDetailsContextData: Olt
})