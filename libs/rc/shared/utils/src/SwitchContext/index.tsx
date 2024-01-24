import { createContext, useContext } from 'react'

import type { Params } from '@acx-ui/react-router-dom'

export const SwitchContext = createContext({} as Params<string>)

export function useSwitchContext () {
  return useContext(SwitchContext)
}
