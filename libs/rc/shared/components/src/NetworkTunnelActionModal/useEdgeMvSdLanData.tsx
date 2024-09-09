import { useMemo } from 'react'

import { find } from 'lodash'

import { Features }                                                                   from '@acx-ui/feature-toggle'
import { useGetEdgeMvSdLanViewDataListQuery, useGetVLANPoolPolicyViewModelListQuery } from '@acx-ui/rc/services'
import {  FILTER, VLANPoolViewModelType }                                             from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

interface useEdgeMvSdLanDataProps {
  sdLanQueryOptions?: {
    filters?: FILTER
    skip?: boolean
  }
  networkId?: string
}
export const useEdgeMvSdLanData = (props: useEdgeMvSdLanDataProps = {}) => {
  const { sdLanQueryOptions, networkId } = props
  const isEdgeSdLanP2Enabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const allSdLansQuery = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'name',
        'venueId',
        'edgeClusterId', 'guestEdgeClusterId', 'edgeClusterName', 'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'tunneledWlans', 'tunneledGuestWlans'],
      filters: sdLanQueryOptions?.filters,
      pageSize: 10000
    }
  }, { skip: !(isEdgeSdLanP2Enabled || isEdgeSdLanMvEnabled) || sdLanQueryOptions?.skip })

  const { networkVlanPool } = useGetVLANPoolPolicyViewModelListQuery({
    payload: {
      fields: ['id', 'name', 'wifiNetworkIds'],
      filters: { wifiNetworkIds: [networkId] }
    },
    enableRbac: true
  }, {
    skip: !isEdgeSdLanMvEnabled || !networkId,
    selectFromResult: ({ data }) => ({
      networkVlanPool: find(data?.data as VLANPoolViewModelType[], (item) => {
        return item.networkIds?.includes(networkId!)
      }) as VLANPoolViewModelType
    })
  })

  const allSdLans = allSdLansQuery.data?.data

  const getVenueSdLan = (networkVenueId: string) => {
    return find(allSdLans, (sdlan) =>
      Boolean(sdlan?.tunneledWlans?.find(wlan => wlan.venueId === networkVenueId)))
  }

  const exported = useMemo(() => {
    return {
      allSdLans: allSdLans ?? [],
      networkVlanPool,
      getVenueSdLan
    }
  }, [allSdLans, networkVlanPool])

  return exported
}