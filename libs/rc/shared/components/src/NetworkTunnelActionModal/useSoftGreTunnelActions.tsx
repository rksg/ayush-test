import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { useGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'

export interface SoftGreNetworkTunnel {
    venueId: string
    networkIds: string[]
    profileId: string
    profileName: string
}

export function useGetSoftGreScopeVenueMap () {
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const { venuesMap } = useGetSoftGreViewDataListQuery({
    payload: {
      page: 1,
      pageSize: 10_000,
      fields: ['name', 'id', 'activations'],
      filters: {}
    } }, {
    skip: !isSoftGreEnabled,
    selectFromResult: ({ data }) => {
      const venuesMap = {} as Record<string, SoftGreNetworkTunnel[]>
      data?.data?.forEach(item => {
        item.activations?.forEach(activation => {
          const venuesMapItem = venuesMap[activation.venueId] || []
          venuesMapItem.push({
            venueId: activation.venueId,
            networkIds: activation.wifiNetworkIds,
            profileId: item.id,
            profileName: item.name
          })
          venuesMap[activation.venueId] = venuesMapItem
        })
      })
      return { venuesMap }
    }
  })
  return venuesMap
}

export function useGetSoftGreScopeNetworkMap (networkId?: string) {
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const { venuesMap } = useGetSoftGreViewDataListQuery({
    payload: {
      page: 1,
      pageSize: 10_000,
      fields: ['name', 'id', 'activations'],
      filters: {}
    } }, {
    skip: !isSoftGreEnabled || !networkId,
    selectFromResult: ({ data }) => {
      const venuesMap = {} as Record<string, SoftGreNetworkTunnel[]>
      data?.data?.forEach(item => {
        item.activations?.forEach(activation => {
          if (networkId && activation.wifiNetworkIds.includes(networkId)) {
            const venueId = activation.venueId
            const venuesMapItem = venuesMap[venueId]|| []
            venuesMapItem.push({
              venueId,
              networkIds: activation.wifiNetworkIds,
              profileId: item.id,
              profileName: item.name
            })
            venuesMap[venueId] = venuesMapItem
          }
        })
      })
      return { venuesMap }
    }
  })
  return venuesMap
}

