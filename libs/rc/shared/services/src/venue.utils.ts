import { FetchArgs } from '@reduxjs/toolkit/query'

import { ApiVersionEnum, GetApiVersionHeader, VenueConfigTemplateUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                   from '@acx-ui/types'
import { createHttpRequest }                                                                                from '@acx-ui/utils'

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

type TemplateApiInfoType =
  'getVenueDefaultRegulatoryChannelsRbac' |
  'getDefaultRadioCustomizationRbac' |
  'getVenueRadioCustomizationRbac' |
  'updateVenueRadioCustomizationRbac'

// eslint-disable-next-line max-len
function createVenueRadioRelatedFetchArgs (apiType: ApiInfoType, templateApiType: TemplateApiInfoType, isTemplate = false): QueryFnFor6GChannelSeparation {
  return ({ params, payload, enableRbac, enableSeparation = false }) => {
    // eslint-disable-next-line max-len
    const regularApiInfo = ((enableSeparation || enableRbac) ? WifiRbacUrlsInfo : WifiUrlsInfo)[apiType]
    const templateApiInfo = VenueConfigTemplateUrlsInfo[enableRbac ? templateApiType : apiType]
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
