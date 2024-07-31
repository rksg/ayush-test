import { createContext, useContext, ReactNode } from 'react'

import { Loader }                             from '@acx-ui/components'
import { useGetEdgeMvSdLanViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData }                from '@acx-ui/rc/utils'

export interface EdgeMvSdLanContextType {
  allSdLans: Pick<EdgeMvSdLanViewData, 'id' | 'venueId' | 'tunneledWlans' | 'tunneledGuestWlans'>[]
}

export const EdgeMvSdLanContext = createContext({} as EdgeMvSdLanContextType)

export function useEdgeMvSdLanContext () {
  return useContext(EdgeMvSdLanContext)
}

export function EdgeMvSdLanContextProvider (props: { children: ReactNode }) {
  const allSdLansQuery = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'venueId', 'tunneledWlans', 'tunneledGuestWlans'],
      pageSize: 10000
    } })

  const allSdLans = allSdLansQuery.data?.data ?? []
  return <EdgeMvSdLanContext.Provider value={{ allSdLans }}>
    <Loader states={[allSdLansQuery]}>
      {props.children}
    </Loader>
  </EdgeMvSdLanContext.Provider>
}