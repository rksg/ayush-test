import { createContext, useContext, ReactNode } from 'react'

import { Loader }                                                             from '@acx-ui/components'
import { Features }                                                           from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                              from '@acx-ui/rc/components'
import { useGetEdgeMvSdLanViewDataListQuery, useGetEdgePinViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData, PersonalIdentityNetworksViewData }              from '@acx-ui/rc/utils'

export interface EdgeMvSdLanContextType {
  allSdLans: Pick<EdgeMvSdLanViewData, 'id' | 'venueId' | 'edgeClusterId' | 'guestEdgeClusterId'
   | 'tunneledWlans' | 'tunneledGuestWlans'>[]
  allPins: Pick<PersonalIdentityNetworksViewData, 'id' | 'venueId' | 'edgeClusterInfo'
   | 'tunneledWlans'>[]
}

export const EdgeMvSdLanContext = createContext({} as EdgeMvSdLanContextType)

export function useEdgeMvSdLanContext () {
  return useContext(EdgeMvSdLanContext)
}

export function EdgeMvSdLanContextProvider (props: { children: ReactNode }) {
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

  const allSdLansQuery = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'venueId', 'edgeClusterId', 'guestEdgeClusterId',
        'tunneledWlans', 'tunneledGuestWlans'],
      pageSize: 10000
    } })

  const allSdLans = allSdLansQuery.data?.data ?? []

  const allPinsQuery = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id','venueId', 'edgeClusterInfo', 'tunneledWlans'],
      pageSize: 10000
    } }, { skip: !isEdgePinReady })

  const allPins = isEdgePinReady ? allPinsQuery.data?.data ?? [] : []

  return <EdgeMvSdLanContext.Provider value={{ allSdLans, allPins }}>
    <Loader states={[allSdLansQuery, allPinsQuery]}>
      {props.children}
    </Loader>
  </EdgeMvSdLanContext.Provider>
}