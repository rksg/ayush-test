import { useMemo } from 'react'

import { find } from 'lodash'

import { Features }                           from '@acx-ui/feature-toggle'
import { useGetEdgeMvSdLanViewDataListQuery } from '@acx-ui/rc/services'
import {  FILTER }                            from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

export const useEdgeMvSdlanData = (filters?: FILTER, skip = false) => {
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const allSdLansQuery = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'name',
        'venueId',
        'edgeClusterId', 'guestEdgeClusterId', 'edgeClusterName', 'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'tunneledWlans', 'tunneledGuestWlans'],
      filters,
      pageSize: 10000
    }
  }, { skip: !isEdgeSdLanMvEnabled || skip })

  const allSdLans = allSdLansQuery.data?.data

  const getVenueSdLan = (networkVenueId: string) => {
    return find(allSdLans, (sdlan) =>
      Boolean(sdlan?.tunneledWlans?.find(wlan => wlan.venueId === networkVenueId)))
  }

  const exported = useMemo(() => {
    return {
      allSdLans: allSdLans ?? [],
      getVenueSdLan
    }
  }, [allSdLans])

  return exported
}