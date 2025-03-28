import { useMemo } from 'react'

import {
  useGetEdgeMvSdLanViewDataListQuery,
  useGetEdgePinViewDataListQuery,
  useGetTunnelProfileViewDataListQuery
} from '@acx-ui/rc/services'

interface GetAvailableTunnelProfileProps {
  sdLanServiceId?: string
}

export const useGetAvailableTunnelProfile = (props?: GetAvailableTunnelProfileProps) => {
  const { sdLanServiceId } = props || {}

  const { allSdLans, isSdLansLoading } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } }, {
    selectFromResult: ({ data, isLoading }) => ({
      allSdLans: data?.data?.filter(sdLan => sdLan.id !== sdLanServiceId),
      isSdLansLoading: isLoading
    })
  })

  const { allPins, isPinsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } },{
    selectFromResult: ({ data, isLoading }) => ({
      allPins: data?.data,
      isPinsLoading: isLoading
    })
  })

  const {
    allTunnelProfiles,
    isTunnelProfilesLoading
  } = useGetTunnelProfileViewDataListQuery({
    payload: {
      fields: [
        'id', 'name', 'tunnelType', 'destinationEdgeClusterId', 'destinationEdgeClusterName'
      ],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  },{
    selectFromResult: ({ data, isLoading }) => ({
      allTunnelProfiles: data?.data,
      isTunnelProfilesLoading: isLoading
    })
  })

  const availableTunnelProfiles = useMemo(() => {
    return allTunnelProfiles?.filter((tunnelProfile) => !!tunnelProfile.destinationEdgeClusterId)
      .filter((tunnelProfile) => {
        return !allSdLans?.some((sdLan) => sdLan.tunnelProfileId === tunnelProfile.id ||
        sdLan.tunneledWlans?.some((wlan) => wlan.forwardingTunnelProfileId === tunnelProfile.id)) &&
          !allPins?.some((pin) => pin.vxlanTunnelProfileId === tunnelProfile.id)
      }) ?? []
  }, [allSdLans, allPins, allTunnelProfiles])

  return {
    isDataLoading: isSdLansLoading || isPinsLoading || isTunnelProfilesLoading,
    availableTunnelProfiles
  }
}