import { find } from 'lodash'

import { useGetEdgeMvSdLanViewDataListQuery, useGetVLANPoolPolicyViewModelListQuery } from '@acx-ui/rc/services'
import { EdgeMvSdLanViewData, NetworkTypeEnum, VLANPoolViewModelType }                from '@acx-ui/rc/utils'

interface useEdgeMvSdLanDataProps {
  id: string,
  type: NetworkTypeEnum,
  venueId: string,
}
export const useEdgeMvSdLanData = (networkInfo: useEdgeMvSdLanDataProps | undefined): {
    venueSdLan?: EdgeMvSdLanViewData
    networkVlanPool?: VLANPoolViewModelType,
    isLoading: boolean
  } => {
  const networkId = networkInfo?.id
  const networkVenueId = networkInfo?.venueId

  const { venueSdLan, isLoading } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: [
        'id', 'name',
        'venueId',
        'edgeClusterId', 'guestEdgeClusterId', 'edgeClusterName', 'guestEdgeClusterName',
        'isGuestTunnelEnabled',
        'tunnelProfileId', 'tunnelProfileName',
        'tunneledWlans', 'tunneledGuestWlans'],
      filters: { 'tunneledWlans.venueId': [networkVenueId!] },
      pageSize: 1
    }
  }, {
    skip: !networkVenueId,
    selectFromResult: ({ data, isLoading }) => ({
      venueSdLan: data?.data[0],
      isLoading
    })
  })

  const { networkVlanPool, isVlanPoolLoading } = useGetVLANPoolPolicyViewModelListQuery({
    payload: {
      fields: ['id', 'name', 'wifiNetworkIds'],
      filters: { wifiNetworkIds: [networkId] }
    },
    enableRbac: true
  }, {
    skip: !networkId || !venueSdLan,
    selectFromResult: ({ data, isLoading }) => ({
      networkVlanPool: find(data?.data as VLANPoolViewModelType[], (item) => {
        return item.networkIds?.includes(networkId!)
      }) as VLANPoolViewModelType,
      isVlanPoolLoading: isLoading
    })
  })

  return {
    venueSdLan,
    networkVlanPool,
    isLoading: isLoading || isVlanPoolLoading
  }
}