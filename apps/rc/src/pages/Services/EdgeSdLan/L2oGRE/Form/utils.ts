import { DefaultOptionType } from 'antd/lib/select'
import { isNil }             from 'lodash'

import { EdgeMvSdLanViewData, EdgeSdLanServiceProfile, MtuTypeEnum, Network, NetworkSegmentTypeEnum, NetworkTypeEnum, TunnelProfileViewData, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                                                                                                            from '@acx-ui/utils'

import { EdgeSdLanFormType } from '.'


export const transformToApiData = (formData: EdgeSdLanFormType): EdgeSdLanServiceProfile => {
  return {
    id: formData.id,
    name: formData.name,
    tunnelProfileId: formData.tunnelProfileId,
    activeNetwork: formData.activatedNetworks
      ? Object.entries(formData.activatedNetworks)
        .map(([venueId, networks]) => networks.map(({ networkId, tunnelProfileId }) => ({
          venueId, networkId, tunnelProfileId
        }))).flat()
      : [],
    activeNetworkTemplate: formData.activatedNetworkTemplates
      ? Object.entries(formData.activatedNetworkTemplates)
        .map(([venueId, networks]) => networks.map(({ networkId, tunnelProfileId }) => ({
          venueId, networkId, tunnelProfileId
        }))).flat()
      : undefined
  }
}

export const transformToFormData = (viewData?: EdgeMvSdLanViewData): EdgeSdLanFormType => {
  return viewData ? {
    id: viewData.id,
    name: viewData.name ?? '',
    tunnelProfileId: viewData.tunnelProfileId ?? '',
    activatedNetworks: viewData.tunneledWlans
      ?.reduce((acc, curr) => {
        acc[curr.venueId] = [...(acc[curr.venueId] || []), {
          networkId: curr.networkId,
          networkName: curr.networkName,
          tunnelProfileId: curr.forwardingTunnelProfileId ?? ''
        }]
        return acc
      }, {} as EdgeSdLanFormType['activatedNetworks']) ?? {},
    activatedNetworkTemplates: viewData.tunneledWlanTemplates
      ?.reduce((acc, curr) => {
        acc![curr.venueId] = [...(acc![curr.venueId] || []), {
          networkId: curr.networkId,
          networkName: curr.networkName,
          tunnelProfileId: curr.forwardingTunnelProfileId ?? ''
        }]
        return acc
      }, {} as EdgeSdLanFormType['activatedNetworkTemplates']) ?? {}
  } : {} as EdgeSdLanFormType
}

export const getFilteredTunnelProfileOptions = (
  row: Network,
  tunnelProfileOptions: DefaultOptionType[],
  availableTunnelProfiles: TunnelProfileViewData[]
) => {
  const { $t } = getIntl()
  const isVlanPooling = !isNil(row.vlanPool)
  const isCaptivePortal = row.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL

  return tunnelProfileOptions
    .map(item => {
      if(item.value) {
        const profile = availableTunnelProfiles?.find(profile => profile.id === item.value)
        const isTunnelEncryptionEnabled = Boolean(profile?.ipsecProfileId)

        // Skip none VLAN_VXLAN tunnel profile options
        if(profile?.type !== NetworkSegmentTypeEnum.VLAN_VXLAN) {
          return null
        }

        // Skip VXLAN-GPE options for non-CAPTIVEPORTAL networks
        if (!isCaptivePortal && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
          return null
        }

        // Skip invalid DMZ options: VXLAN-GPE options for
        // captive portal networks with non-manual MTU or NAT traversal enabled or IPSec enabled
        // eslint-disable-next-line max-len
        if(isCaptivePortal && (profile?.mtuType !== MtuTypeEnum.MANUAL || profile?.natTraversalEnabled || isTunnelEncryptionEnabled)) {
          return null
        }

        // Disable VXLAN-GPE options for vlan pooling networks
        if (isVlanPooling && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
          return {
            ...item,
            disabled: true,
            title: $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
          }
        }
      }

      return item
    })
    .filter((item): item is DefaultOptionType => item !== null)
}