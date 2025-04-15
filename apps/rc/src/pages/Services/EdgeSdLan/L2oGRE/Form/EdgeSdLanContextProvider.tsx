import { createContext, ReactNode, useContext } from 'react'

import { Loader }                                                                       from '@acx-ui/components'
import { useGetAvailableTunnelProfile }                                                 from '@acx-ui/edge/components'
import { useGetEdgePinViewDataListQuery, useGetEdgeMvSdLanViewDataListQuery }           from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData, PersonalIdentityNetworksViewData, TunnelProfileViewData } from '@acx-ui/rc/utils'

export interface EdgeSdLanContextType {
  allSdLans: Pick<EdgeMvSdLanViewData, 'id' | 'venueId' | 'edgeClusterId' | 'guestEdgeClusterId'
   | 'tunneledWlans' | 'tunneledGuestWlans'>[]
  allPins: Pick<PersonalIdentityNetworksViewData, 'id' | 'venueId' | 'edgeClusterInfo'
   | 'tunneledWlans'>[]
  availableTunnelProfiles: TunnelProfileViewData[]
}

export const EdgeSdLanContext = createContext({} as EdgeSdLanContextType)

export function useEdgeSdLanContext () {
  return useContext(EdgeSdLanContext)
}

export function EdgeSdLanContextProvider (props: { children: ReactNode, serviceId?: string }) {
  const {
    isDataLoading,
    availableTunnelProfiles
  } = useGetAvailableTunnelProfile({ serviceIds: [props.serviceId] })

  const { allSdLans = [], isSdLansLoading } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } }, {
    selectFromResult: ({ data, isLoading }) => ({
      allSdLans: data?.data,
      isSdLansLoading: isLoading
    })
  })

  const { allPins = [], isPinsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } },{
    selectFromResult: ({ data, isLoading }) => ({
      allPins: data?.data,
      isPinsLoading: isLoading
    })
  })

  const loadingStates = [{
    isLoading: isDataLoading || isSdLansLoading || isPinsLoading
  }]

  return <EdgeSdLanContext.Provider value={{
    allSdLans,
    allPins,
    availableTunnelProfiles
  }}>
    <Loader states={loadingStates}>
      {props.children}
    </Loader>
  </EdgeSdLanContext.Provider>
}