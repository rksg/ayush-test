import { useMemo } from 'react'

import { Features }                      from '@acx-ui/feature-toggle'
import {
  useGetEdgeClusterListQuery,
  useGetEdgeMvSdLanViewDataListQuery,
  useGetEdgePinViewDataListQuery,
  useGetTunnelProfileViewDataListQuery
} from '@acx-ui/rc/services'
import { TunnelProfileViewData, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { getIntl }                               from '@acx-ui/utils'

import { getTunnelTypeDisplayName } from '../utils'

import { useIsEdgeFeatureReady } from './useIsEdgeFeatureReady'

interface GetAvailableTunnelProfileProps {
  serviceIds?: (string|undefined)[]
}

export const useGetAvailableTunnelProfile = (props?: GetAvailableTunnelProfileProps) => {
  const { serviceIds } = props || {}
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

  // Fetch SD-LAN data
  const { allSdLans, isSdLansLoading } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data, isLoading }) => ({
      allSdLans: data?.data?.filter(sdLan => !serviceIds?.includes(sdLan.id)),
      isSdLansLoading: isLoading
    })
  })

  // Fetch PIN data
  const { allPins, isPinsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    }
  }, {
    skip: !isEdgePinReady,
    selectFromResult: ({ data, isLoading }) => ({
      allPins: data?.data?.filter(pin => !serviceIds?.includes(pin.id)),
      isPinsLoading: isLoading
    })
  })


  // Fetch Tunnel Profile data
  const { allTunnelProfiles, isTunnelProfilesLoading } = useGetTunnelProfileViewDataListQuery({
    payload: {
      fields: [
        'id', 'name', 'tunnelType', 'destinationEdgeClusterId', 'destinationEdgeClusterName',
        'type', 'mtuType', 'forceFragmentation', 'ageTimeMinutes', 'keepAliveInterval',
        'keepAliveRetry'
      ],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data, isLoading }) => ({
      allTunnelProfiles: data?.data,
      isTunnelProfilesLoading: isLoading
    })
  })

  // Get used tunnel profiles and their associated clusters
  const { usedTunnelProfiles, usedClusterIds } = useMemo(() => {
    const usedTunnelProfileIds = new Set<string>()
    const usedClusterIds = new Set<string>()

    // Collect used profile IDs from SD-LANs
    allSdLans?.forEach(sdLan => {
      if (sdLan.tunnelProfileId) usedTunnelProfileIds.add(sdLan.tunnelProfileId)
      sdLan.tunneledWlans?.forEach(wlan => {
        if (wlan.forwardingTunnelProfileId) {
          usedTunnelProfileIds.add(wlan.forwardingTunnelProfileId)
        }
      })
    })

    // Collect used profile IDs from PINs
    allPins?.forEach(pin => {
      if (pin.vxlanTunnelProfileId) {
        usedTunnelProfileIds.add(pin.vxlanTunnelProfileId)
      }
    })

    // Get cluster IDs from used profiles
    allTunnelProfiles?.forEach(profile => {
      if (usedTunnelProfileIds.has(profile.id) && profile.destinationEdgeClusterId) {
        usedClusterIds.add(profile.destinationEdgeClusterId)
      }
    })

    return {
      usedTunnelProfiles: Array.from(usedTunnelProfileIds),
      usedClusterIds: Array.from(usedClusterIds)
    }
  }, [allSdLans, allPins, allTunnelProfiles])

  // Get venue-associated cluster IDs
  const { edgeClusterList } = useGetEdgeClusterListQuery({
    payload: {
      fields: ['clusterId', 'venueId'],
      pageSize: 10000
    }
  }, {
    skip: !usedClusterIds.length,
    selectFromResult: ({ data }) => ({
      edgeClusterList: data?.data
    })
  })

  const venueAssociatedClusterIds = useMemo(() => {
    if (!edgeClusterList?.length || !usedClusterIds.length) return []

    const usedVenueIds = new Set(
      edgeClusterList
        .filter(cluster => usedClusterIds.includes(cluster.clusterId ?? ''))
        .map(cluster => cluster.venueId)
    )

    return edgeClusterList
      .filter(cluster => usedVenueIds.has(cluster.venueId))
      .map(cluster => cluster.clusterId)
  }, [edgeClusterList, usedClusterIds])

  // Filter available tunnel profiles
  const availableTunnelProfiles = useMemo(() => {
    const isL2GreOrHasCluster = (profile: TunnelProfileViewData) =>
      profile.tunnelType === TunnelTypeEnum.L2GRE || !!profile.destinationEdgeClusterId

    const isNotUsed = (profile: TunnelProfileViewData) =>
      !usedTunnelProfiles.includes(profile.id) &&
      !(profile.destinationEdgeClusterId &&
        venueAssociatedClusterIds.includes(profile.destinationEdgeClusterId))

    return allTunnelProfiles?.filter(profile =>
      isL2GreOrHasCluster(profile) && isNotUsed(profile)
    ) ?? []
  }, [allTunnelProfiles, usedTunnelProfiles, venueAssociatedClusterIds])

  return {
    isDataLoading: isSdLansLoading || isPinsLoading || isTunnelProfilesLoading,
    availableTunnelProfiles
  }
}

const maxL2oGreCount = 8
const maxVxLanGpeCount = 1

export const transToOptions = (
  tunnelProfiles: TunnelProfileViewData[],
  activatedTunnelProfileIds?: string[]
) => {
  const { $t } = getIntl()
  const validActivatedTunnelProfileIds = activatedTunnelProfileIds?.filter(Boolean) ?? []
  const activatedTunnelProfileIdSet = new Set(validActivatedTunnelProfileIds)

  const currentTunnelType = validActivatedTunnelProfileIds.length > 0
    // eslint-disable-next-line max-len
    ? tunnelProfiles.find(profile => profile.id === validActivatedTunnelProfileIds[0])?.tunnelType ?? ''
    : ''

  const getDisabledState = (tunnelProfile: TunnelProfileViewData) => {
    if (currentTunnelType && tunnelProfile.tunnelType !== currentTunnelType) {
      return {
        disabled: true,
        title: $t({
          defaultMessage: 'All forwarding destinations must use tunnel profiles of the same type.'
        }, {
          profileType: tunnelProfile.tunnelType,
          currentTunnelType
        })
      }
    }

    // Check L2GRE limit
    if (currentTunnelType === TunnelTypeEnum.L2GRE &&
      activatedTunnelProfileIdSet.size >= maxL2oGreCount &&
      !activatedTunnelProfileIdSet.has(tunnelProfile.id)) {
      return {
        disabled: true,
        title: $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'A SD-LAN service can only support {maxL2oGreCount} L2GRE tunnel profiles.'
        }, { maxL2oGreCount })
      }
    }

    // Check VXLAN-GPE limit
    if (currentTunnelType === TunnelTypeEnum.VXLAN_GPE &&
      activatedTunnelProfileIdSet.size >= maxVxLanGpeCount &&
      !activatedTunnelProfileIdSet.has(tunnelProfile.id)) {
      return {
        disabled: true,
        title: $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'A SD-LAN service can only support {maxVxLanGpeCount} VxLAN-GPE tunnel profile.'
        }, { maxVxLanGpeCount })
      }
    }

    return { disabled: false, title: undefined }
  }

  return tunnelProfiles.map(tunnelProfile => ({
    label: `${tunnelProfile.name} (${getTunnelTypeDisplayName(tunnelProfile.tunnelType)})`,
    value: tunnelProfile.id,
    ...getDisabledState(tunnelProfile)
  }))
}
