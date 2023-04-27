import { createContext, useContext } from 'react'

import type { Params } from '@acx-ui/react-router-dom'

export const ApContext = createContext({} as Params<string>)

export function useApContext () {
  return useContext(ApContext)
}

