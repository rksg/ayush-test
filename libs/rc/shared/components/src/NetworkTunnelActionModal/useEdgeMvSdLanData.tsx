import { find } from 'lodash'

import { Features }                                                                   from '@acx-ui/feature-toggle'
import { useGetEdgeMvSdLanViewDataListQuery, useGetVLANPoolPolicyViewModelListQuery } from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData, NetworkTypeEnum, VLANPoolViewModelType }                from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

interface useEdgeMvSdLanDataProps {
  id: string,
  type: NetworkTypeEnum,
  venueId: string,
}
export const useEdgeMvSdLanData = (networkInfo: useEdgeMvSdLanDataProps | undefined): {
    venueSdLan?: EdgeMvSdLanViewData
    networkVlanPool?: VLANPoolViewModelType
  } => {
  const networkId = networkInfo?.id
  const networkVenueId = networkInfo?.venueId
  const isEdgeSdLanP2Enabled = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const { venueSdLan } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: [
        'id', 'name',
        'venueId',
        'edgeClusterId', 'guestEdgeClusterId', 'edgeClusterName', 'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'tunneledWlans', 'tunneledGuestWlans'],
      filters: { 'tunneledWlans.venueId': [networkVenueId!] },
      pageSize: 1
    }
  }, {
    skip: !(isEdgeSdLanP2Enabled || isEdgeSdLanMvEnabled) || !networkVenueId,
    selectFromResult: ({ data }) => ({
      venueSdLan: data?.data[0]
    })
  })

  const { networkVlanPool } = useGetVLANPoolPolicyViewModelListQuery({
    payload: {
      fields: ['id', 'name', 'wifiNetworkIds'],
      filters: { wifiNetworkIds: [networkId] }
    },
    enableRbac: true
  }, {
    skip: !isEdgeSdLanMvEnabled || !networkId || !venueSdLan,
    selectFromResult: ({ data }) => ({
      networkVlanPool: find(data?.data as VLANPoolViewModelType[], (item) => {
        return item.networkIds?.includes(networkId!)
      }) as VLANPoolViewModelType
    })
  })

  return { venueSdLan, networkVlanPool }
}