import { createContext, useContext, ReactNode } from 'react'

import { find } from 'lodash'

import { Loader }                             from '@acx-ui/components'
import { Features }                           from '@acx-ui/feature-toggle'
import { useGetEdgeMvSdLanViewDataListQuery } from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData }                from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

export interface EdgeMvSdLanContextType {
  allSdLans: EdgeMvSdLanViewData[],
  getVenueSdLan: (networkVenueId: string) => EdgeMvSdLanViewData | undefined
}

export const EdgeMvSdLanContext = createContext({} as EdgeMvSdLanContextType)

export function useEdgeMvSdLanContext () {
  return useContext(EdgeMvSdLanContext)
}

export function EdgeMvSdLanContextProvider (props: { children: ReactNode }) {
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const allSdLansQuery = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'name',
        'venueId',
        'edgeClusterId', 'guestEdgeClusterId', 'edgeClusterName', 'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'tunneledWlans', 'tunneledGuestWlans'],
      pageSize: 10000
    }
  }, { skip: !isEdgeSdLanMvEnabled })

  const allSdLans = allSdLansQuery.data?.data ?? []

  const getVenueSdLan = (networkVenueId: string) => {
    return find(allSdLans, (sdlan) =>
      Boolean(sdlan?.tunneledWlans?.find(wlan => wlan.venueId === networkVenueId)))
  }

  return <EdgeMvSdLanContext.Provider value={{ allSdLans, getVenueSdLan }}>
    <Loader states={[allSdLansQuery]}>
      {props.children}
    </Loader>
  </EdgeMvSdLanContext.Provider>
}