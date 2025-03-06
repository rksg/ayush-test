import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  useActivateIpsecMutation,
  useActivateSoftGreMutation,
  useDectivateIpsecMutation,
  useDectivateSoftGreMutation,
  useGetSoftGreViewDataListQuery
} from '@acx-ui/rc/services'

import { NetworkTunnelActionForm, NetworkTunnelTypeEnum } from './types'

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

export function useSoftGreTunnelActions () {
  const isSoftGreEnabled = useIsSplitOn(Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
  const isIpSecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const [ activateSoftGre ] = useActivateSoftGreMutation()
  const [ dectivateSoftGre ] = useDectivateSoftGreMutation()
  const [ activateIpSec ] = useActivateIpsecMutation()
  const [ dectivateIpSec ] = useDectivateIpsecMutation()

  const activateSoftGreTunnel = (
    venueId: string, networkId: string, formValues: NetworkTunnelActionForm) => {
    if (isSoftGreEnabled && formValues.tunnelType === NetworkTunnelTypeEnum.SoftGre &&
        formValues.softGre?.newProfileId &&
        formValues.softGre?.oldProfileId !== formValues.softGre?.newProfileId) {
      return activateSoftGre({
        params: {
          venueId,
          networkId,
          policyId: formValues.softGre.newProfileId
        } }).unwrap()
    }
    return Promise.resolve()

  }

  const dectivateSoftGreTunnel = (
    venueId: string, networkId: string, formValues: NetworkTunnelActionForm) => {
    if (isSoftGreEnabled && formValues.tunnelType !== NetworkTunnelTypeEnum.SoftGre
      && formValues.softGre?.oldProfileId && !formValues.softGre?.newProfileId) {
      return dectivateSoftGre({
        params: {
          venueId,
          networkId,
          policyId: formValues.softGre.oldProfileId
        } }).unwrap()
    }
    return Promise.resolve()
  }

  const activateIpSecOverSoftGre = (
    venueId: string, networkId: string, formValues: NetworkTunnelActionForm) => {
    if (isSoftGreEnabled && isIpSecEnabled
      && formValues.tunnelType === NetworkTunnelTypeEnum.SoftGre &&
      formValues.ipsec?.enableIpsec === true &&
      formValues.ipsec?.newProfileId &&
      formValues.ipsec?.oldProfileId !== formValues.ipsec?.newProfileId) {
      return activateIpSec({
        params: {
          venueId,
          networkId,
          softGreProfileId: formValues.softGre.newProfileId,
          ipsecProfileId: formValues.ipsec.newProfileId
        } }).unwrap()
    }
    return Promise.resolve()
  }

  const deactivateIpSecOverSoftGre = (
    venueId: string, networkId: string, formValues: NetworkTunnelActionForm) => {
    if (isSoftGreEnabled && isIpSecEnabled
      && formValues.tunnelType !== NetworkTunnelTypeEnum.SoftGre
      && formValues.ipsec?.oldProfileId && !formValues.ipsec?.newProfileId) {
      return dectivateIpSec({
        params: {
          venueId,
          networkId,
          softGreProfileId: formValues.softGre.newProfileId,
          ipsecProfileId: formValues.ipsec.oldProfileId
        } }).unwrap()
    }
    return Promise.resolve()
  }

  return {
    activateSoftGreTunnel,
    dectivateSoftGreTunnel,
    activateIpSecOverSoftGre,
    deactivateIpSecOverSoftGre
  }
}