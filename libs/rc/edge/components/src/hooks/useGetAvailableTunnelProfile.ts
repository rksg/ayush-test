import { useMemo } from 'react'

import {
  useGetEdgeMvSdLanViewDataListQuery,
  useGetEdgePinViewDataListQuery,
  useGetTunnelProfileViewDataListQuery
} from '@acx-ui/rc/services'
import { TunnelProfileViewData, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { getIntl }                               from '@acx-ui/utils'

import { getTunnelTypeDisplayName } from '../utils'

interface GetAvailableTunnelProfileProps {
  serviceIds?: (string|undefined)[]
}

export const useGetAvailableTunnelProfile = (props?: GetAvailableTunnelProfileProps) => {
  const { serviceIds } = props || {}

  const { allSdLans, isSdLansLoading } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } }, {
    selectFromResult: ({ data, isLoading }) => ({
      allSdLans: data?.data?.filter(sdLan => !serviceIds?.includes(sdLan.id)),
      isSdLansLoading: isLoading
    })
  })

  const { allPins, isPinsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } },{
    selectFromResult: ({ data, isLoading }) => ({
      allPins: data?.data?.filter(pin => !serviceIds?.includes(pin.id)),
      isPinsLoading: isLoading
    })
  })

  const {
    allTunnelProfiles,
    isTunnelProfilesLoading
  } = useGetTunnelProfileViewDataListQuery({
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
  },{
    selectFromResult: ({ data, isLoading }) => ({
      allTunnelProfiles: data?.data,
      isTunnelProfilesLoading: isLoading
    })
  })

  const availableTunnelProfiles = useMemo(() => {
    return allTunnelProfiles
      ?.filter((tunnelProfile) =>
        !!tunnelProfile.destinationEdgeClusterId ||
        tunnelProfile.tunnelType === TunnelTypeEnum.L2GRE)
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
