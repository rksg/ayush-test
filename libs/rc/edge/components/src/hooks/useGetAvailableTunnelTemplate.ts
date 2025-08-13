import { useMemo } from 'react'

import {
  useGetEdgeClusterListQuery,
  useGetEdgeMvSdLanViewDataListQuery,
  useGetTunnelProfileTemplateViewDataListSkipRecRewriteQuery
} from '@acx-ui/rc/services'
import { TunnelProfileViewData, TunnelTypeEnum } from '@acx-ui/rc/utils'

interface GetAvailableTunnelTemplateProps {
  serviceIds?: (string|undefined)[]
}

export const useGetAvailableTunnelTemplate = (props?: GetAvailableTunnelTemplateProps) => {
  const { serviceIds } = props || {}

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

  // Fetch Tunnel Profile data
  const {
    allTunnelTemplates,
    isTunnelTemplatesLoading
  } = useGetTunnelProfileTemplateViewDataListSkipRecRewriteQuery({
    payload: {
      fields: [
        'id', 'name', 'tunnelType', 'destinationEdgeClusterId', 'destinationEdgeClusterName',
        'type', 'mtuType', 'forceFragmentation', 'ageTimeMinutes', 'keepAliveInterval',
        'keepAliveRetry', 'natTraversalEnabled'
      ],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data, isLoading }) => ({
      allTunnelTemplates: data?.data,
      isTunnelTemplatesLoading: isLoading
    })
  })

  // Get used tunnel profiles and their associated clusters
  const { usedTunnelTemplateIds, usedClusterIds } = useMemo(() => {
    const usedTunnelTemplateIds = new Set<string>()
    const usedClusterIds = new Set<string>()

    // Collect used profile IDs from SD-LANs
    allSdLans?.forEach(sdLan => {
      if (sdLan.tunnelProfileId) usedTunnelTemplateIds.add(sdLan.tunnelProfileId)
      sdLan.tunneledWlans?.forEach(wlan => {
        if (wlan.forwardingTunnelProfileId) {
          usedTunnelTemplateIds.add(wlan.forwardingTunnelProfileId)
        }
      })
    })

    // Get cluster IDs from used profiles
    allTunnelTemplates?.forEach(profile => {
      if (usedTunnelTemplateIds.has(profile.id) && profile.destinationEdgeClusterId) {
        usedClusterIds.add(profile.destinationEdgeClusterId)
      }
    })

    return {
      usedTunnelTemplateIds: Array.from(usedTunnelTemplateIds),
      usedClusterIds: Array.from(usedClusterIds)
    }
  }, [allSdLans, allTunnelTemplates])

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
  const availableTunnelTemplates = useMemo(() => {
    const isL2GreOrHasCluster = (profile: TunnelProfileViewData) =>
      profile.tunnelType === TunnelTypeEnum.L2GRE || !!profile.destinationEdgeClusterId

    const isNotUsed = (profile: TunnelProfileViewData) =>
      !usedTunnelTemplateIds.includes(profile.id) &&
      !(profile.destinationEdgeClusterId &&
        venueAssociatedClusterIds.includes(profile.destinationEdgeClusterId))

    return allTunnelTemplates?.filter(profile =>
      isL2GreOrHasCluster(profile) && isNotUsed(profile)
    ) ?? []
  }, [allTunnelTemplates, usedTunnelTemplateIds, venueAssociatedClusterIds])

  return {
    isDataLoading: isSdLansLoading || isTunnelTemplatesLoading,
    availableTunnelTemplates
  }
}