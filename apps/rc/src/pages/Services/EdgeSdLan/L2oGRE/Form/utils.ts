import { EdgeMvSdLanViewData, EdgeSdLanServiceProfile } from '@acx-ui/rc/utils'

import { EdgeSdLanFormType } from '.'

export const transformToApiData = (formData: EdgeSdLanFormType): EdgeSdLanServiceProfile => {
  return {
    id: formData.id,
    name: formData.name,
    tunnelProfileId: formData.tunnelProfileId,
    activeNetwork: Object.entries(formData.activatedNetworks)
      .map(([venueId, networks]) => networks.map(({ networkId, tunnelProfileId }) => ({
        venueId, networkId, tunnelProfileId
      }))).flat(),
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