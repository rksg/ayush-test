import { createContext, ReactNode } from 'react'

import { Loader } from '@acx-ui/components'

export interface EdgeMspSdLanContextType {
}

export const EdgeMspSdLanContext = createContext({} as EdgeMspSdLanContextType)

export const EdgeMspSdLanContextProvider = (props: { children: ReactNode }) => {
  return <EdgeMspSdLanContext.Provider value={{}}>
    <Loader>
      {props.children}
    </Loader>
  </EdgeMspSdLanContext.Provider>
}