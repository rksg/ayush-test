import { FetchArgs } from '@reduxjs/toolkit/query'

import {
  ApiVersionEnum,
  APMesh,
  ClientIsolationViewModel,
  EthernetPortProfile,
  FloorPlanMeshAP,
  GetApiVersionHeader,
  NewAPModel,
  IpsecViewData,
  ProfileLanVenueActivations,
  SoftGreViewData,
  VenueConfigTemplateUrlsInfo,
  VenueLanPorts,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

interface RequestPayloadWith6gChannelEnableSeparation extends RequestPayload {
  enableSeparation?: boolean
}

// eslint-disable-next-line max-len
export type QueryFnFor6GChannelSeparation = ({ params, enableRbac, enableSeparation }: RequestPayloadWith6gChannelEnableSeparation) => FetchArgs

type ApiInfoType =
  'getVenueDefaultRegulatoryChannels' |
  'getDefaultRadioCustomization' |
  'getVenueRadioCustomization' |
  'updateVenueRadioCustomization'

type TemplateRbacApiInfoType =
  'getVenueDefaultRegulatoryChannelsRbac' |
  'getDefaultRadioCustomizationRbac' |
  'getVenueRadioCustomizationRbac' |
  'updateVenueRadioCustomizationRbac'

// eslint-disable-next-line max-len
function createVenueRadioRelatedFetchArgs (apiType: ApiInfoType, templateRbacApiType: TemplateRbacApiInfoType, isTemplate = false): QueryFnFor6GChannelSeparation {
  return ({ params, payload, enableRbac, enableSeparation = false }) => {
    const useRbacApi = enableSeparation || enableRbac
    const regularApiInfo = (useRbacApi ? WifiRbacUrlsInfo : WifiUrlsInfo)[apiType]
    const templateApiInfo = VenueConfigTemplateUrlsInfo[useRbacApi ? templateRbacApiType : apiType]
    // eslint-disable-next-line max-len
    const rbacApiVersion = enableSeparation ? ApiVersionEnum.v1_1 : (enableRbac ? ApiVersionEnum.v1 : undefined)
    const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

    return {
      ...createHttpRequest(isTemplate ? templateApiInfo : regularApiInfo, params, apiCustomHeader),
      ...(payload ? { body: JSON.stringify(payload) } : {})
    }
  }
}

// eslint-disable-next-line max-len
export function createVenueDefaultRegulatoryChannelsFetchArgs (isTemplate = false): QueryFnFor6GChannelSeparation {
  // eslint-disable-next-line max-len
  return createVenueRadioRelatedFetchArgs('getVenueDefaultRegulatoryChannels', 'getVenueDefaultRegulatoryChannelsRbac', isTemplate)
}

// eslint-disable-next-line max-len
export function createVenueDefaultRadioCustomizationFetchArgs (isTemplate = false): QueryFnFor6GChannelSeparation {
  // eslint-disable-next-line max-len
  return createVenueRadioRelatedFetchArgs('getDefaultRadioCustomization', 'getDefaultRadioCustomizationRbac', isTemplate)
}

// eslint-disable-next-line max-len
export function createVenueRadioCustomizationFetchArgs (isTemplate = false): QueryFnFor6GChannelSeparation {
  // eslint-disable-next-line max-len
  return createVenueRadioRelatedFetchArgs('getVenueRadioCustomization', 'getVenueRadioCustomizationRbac', isTemplate)
}

// eslint-disable-next-line max-len
export function createVenueUpdateRadioCustomizationFetchArgs (isTemplate = false): QueryFnFor6GChannelSeparation {
  // eslint-disable-next-line max-len
  return createVenueRadioRelatedFetchArgs('updateVenueRadioCustomization', 'updateVenueRadioCustomizationRbac', isTemplate)
}

export const convertToApMeshDataList = (newApModels: NewAPModel[], members: NewAPModel[]) => {
  return newApModels.map((newApModel) => {
    const { name, macAddress, serialNumber, model,
      meshRole, meshStatus, networkStatus, venueId, clientCount } = newApModel
    const { uplinks, downlinks, hopCount, radios } = meshStatus || {}

    const newApMesh = {
      name,
      apMac: macAddress,
      serialNumber,
      meshRole,
      model,
      IP: networkStatus?.ipAddress,
      clientCount,
      hops: hopCount,
      venueId,
      meshBand: radios?.flatMap(r => r.band).join(', ')
    } as APMesh

    if (Array.isArray(uplinks) && uplinks.length > 0) {
      newApMesh.apUpRssi = uplinks[0].rssi
    }

    if (Array.isArray(downlinks) && downlinks.length > 0) {
      const downlinkApMacList = downlinks.map(downlink => downlink.macAddress)
      const downLinkAps = members.filter(member => downlinkApMacList.includes(member.macAddress!))
      if (downLinkAps.length) {
        const children = convertToApMeshDataList(downLinkAps, members)

        newApMesh.children = children.map(child => {
          const macAddress = child.apMac
          return {
            ...child,
            apDownRssi: downlinks.find(downlinkAp => downlinkAp.macAddress === macAddress)?.rssi
          }
        })
      }
    }

    return newApMesh
  })
}

export const convertToMeshTopologyDataList = (newApModels: NewAPModel[], members: NewAPModel[]) => {
  return newApModels.map((newApModel) => {
    const { name, macAddress, serialNumber,
      meshRole, meshStatus,
      venueId, floorplanId } = newApModel

    const { uplinks, downlinks, hopCount } = meshStatus || {}

    const newApMesh = {
      name,
      apMac: macAddress,
      serialNumber,
      meshRole,
      hops: hopCount,
      venueId,
      floorplanId
    } as FloorPlanMeshAP

    if (Array.isArray(uplinks) && uplinks.length > 0) {
      newApMesh.apUpRssi = uplinks[0].rssi
    }

    if (Array.isArray(downlinks) && downlinks.length > 0) {
      const downlinkApMacList = downlinks.map(downlink => downlink.macAddress)
      const downLinkAps = members.filter(member => downlinkApMacList.includes(member.macAddress!))
      if (downLinkAps.length) {
        const children = convertToMeshTopologyDataList(downLinkAps, members)

        newApMesh.downlink = children.map(child => {
          const macAddress = child.apMac
          return {
            ...child,
            apDownRssi: downlinks.find(downlinkAp => downlinkAp.macAddress === macAddress)?.rssi
          }
        })
        newApMesh.downlinkCount = children.length
      }
    }

    return newApMesh
  })
}

export const mappingLanPortWithEthernetPortProfile = (
  venueLanPortSettings: VenueLanPorts[],
  ethernetPortProfiles: EthernetPortProfile[],
  venueId: string
) =>{
  ethernetPortProfiles.forEach((profile) => {
    if (profile.venueActivations) {
      profile.venueActivations.forEach((activity)=>{
        const targetLanPort = getTargetLanPortByActivations(
          venueLanPortSettings,
          activity,
          venueId
        )
        if(targetLanPort) {
          targetLanPort.ethernetPortProfileId = profile.id
        }
      })
    }
  })

}

export const mappingLanPortWithSoftGreProfile = (
  venueLanPortSettings: VenueLanPorts[],
  softGreProfiles: SoftGreViewData[],
  venueId: string
) => {
  softGreProfiles.forEach((profile) => {
    if (profile.venueActivations) {
      profile.venueActivations.forEach((activity) => {
        const targetLanPort = getTargetLanPortByActivations(
          venueLanPortSettings,
          activity,
          venueId
        )
        if(targetLanPort) {
          targetLanPort.softGreProfileId = profile.id
          targetLanPort.softGreEnabled = true
        }
      })
    }
  })
}

export const mappingLanPortWithIpsecProfile = (
  venueLanPortSettings: VenueLanPorts[],
  ipsecProfiles: IpsecViewData[],
  venueId: string
) => {
  ipsecProfiles.forEach((profile) => {
    if (profile.venueActivations) {
      profile.venueActivations.forEach((activity) => {
        const targetLanPort = getTargetLanPortByActivations(
          venueLanPortSettings,
          activity,
          venueId
        )
        if(targetLanPort) {
          targetLanPort.ipsecProfileId = profile.id
          targetLanPort.ipsecEnabled = true
        }
      })
    }
  })
}

export const mappingLanPortWithClientIsolationPolicy = (
  venueLanPortSettings: VenueLanPorts[],
  clientIsolationProfiles: ClientIsolationViewModel[],
  venueId: string
) => {
  clientIsolationProfiles.forEach((profile) => {
    if (profile.venueActivations) {
      profile.venueActivations.forEach((activity) => {
        const targetLanPort = getTargetLanPortByActivations(
          venueLanPortSettings,
          activity,
          venueId)
        if(targetLanPort) {
          targetLanPort.clientIsolationProfileId = profile.id
        }
      })
    }
  })
}

export const getTargetLanPortByActivations = (
  venueLanPortSettings: VenueLanPorts[],
  activity:ProfileLanVenueActivations,
  venueId: string
) => {
  return venueLanPortSettings.find(
    setting => setting.model === activity.apModel &&
    venueId === activity.venueId)
    ?.lanPorts.find(lanPort => lanPort.portId?.toString() === activity.portId?.toString())
}
