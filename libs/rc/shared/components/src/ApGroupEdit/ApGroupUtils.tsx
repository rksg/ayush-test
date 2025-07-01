/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

import { isEmpty, uniq } from 'lodash'

import { useLazyApListQuery } from '@acx-ui/rc/services'
import {
  APExtended,
  ApGroupRadioCustomization,
  ApRadioParamsDual5G,
  BandModeEnum,
  VenueRadioCustomization
} from '@acx-ui/rc/utils'

import {
  RadioType
} from '../RadioSettings/RadioSettingsContents'


export const convertVenueRadioSettingsToApGroupRadioSettings = (data: VenueRadioCustomization ) => {
  const getVenue5GRadioSetting = (radioParams: any) => {
    if (!radioParams) {
      return undefined
    }

    const { allowedIndoorChannels, allowedOutdoorChannels, changeInterval, channelBandwidth, method, scanInterval, txPower } = radioParams
    return {
      allowedIndoorChannels,
      allowedOutdoorChannels,
      changeInterval,
      channelBandwidth,
      method,
      scanInterval,
      txPower
    }
  }

  const getVenue6GRadioSetting = (radioParams: any) => {
    if (!radioParams) {
      return undefined
    }

    const { allowedIndoorChannels, allowedOutdoorChannels, changeInterval, channelBandwidth, method, txPower, bssMinRate6G, mgmtTxRate6G, channelBandwidth320MhzGroup, enableAfc, enableMulticastDownlinkRateLimiting, enableMulticastRateLimiting, enableMulticastUplinkRateLimiting, multicastDownlinkRateLimiting, multicastUplinkRateLimiting, scanInterval } = radioParams
    return {
      allowedIndoorChannels,
      allowedOutdoorChannels,
      changeInterval,
      channelBandwidth,
      method,
      txPower,
      bssMinRate6G,
      mgmtTxRate6G,
      channelBandwidth320MhzGroup,
      enableAfc,
      enableMulticastDownlinkRateLimiting,
      enableMulticastRateLimiting,
      enableMulticastUplinkRateLimiting,
      multicastDownlinkRateLimiting,
      multicastUplinkRateLimiting,
      scanInterval
    }
  }

  const {
    radioParams24G: venueRadioParams24G,
    radioParams50G,
    radioParamsDual5G,
    radioParams6G } = data

  const venueRadioParams50G = getVenue5GRadioSetting(radioParams50G)
  const venueRadioParamsUpper5G = getVenue5GRadioSetting(radioParamsDual5G?.radioParamsUpper5G)
  const venueRadioParamsLower5G = getVenue5GRadioSetting(radioParamsDual5G?.radioParamsLower5G)
  const venueRadioParamsDual5G = (venueRadioParamsUpper5G || venueRadioParamsLower5G)? new ApRadioParamsDual5G() : undefined
  const venueRadioParams6G = getVenue6GRadioSetting(radioParams6G)

  if (venueRadioParamsDual5G) {
    venueRadioParamsDual5G.enabled = (radioParamsDual5G?.enabled === true)
    venueRadioParamsDual5G.lower5gEnabled = true
    venueRadioParamsDual5G.upper5gEnabled = true
    venueRadioParamsDual5G.radioParamsLower5G = venueRadioParamsLower5G
    venueRadioParamsDual5G.radioParamsUpper5G = venueRadioParamsUpper5G
  }

  return {
    radioParams24G: {
      enabled: true,
      ...venueRadioParams24G
    },
    radioParams50G: {
      enabled: true,
      ...venueRadioParams50G
    },
    radioParamsDual5G: {
      enabled: true,
      ...venueRadioParamsDual5G
    },
    radioParams6G: {
      enabled: true,
      ...venueRadioParams6G
    }
  }
}

export const useVenueTriBandApModels = (
  triBandApModels: string[],
  venueId: string | undefined,
  tenantId: string | undefined
) => {
  const [ apList ] = useLazyApListQuery()

  const [venueTriBandApModels, setVenueTriBandApModels] = useState<string[]>([])

  useEffect(() => {
    const triBandApModelNames = isEmpty(triBandApModels) ? ['R760', 'R560'] : triBandApModels
    const filters = { model: triBandApModelNames, venueId: [venueId] }

    const payload = {
      fields: ['name', 'model', 'venueId', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters
    }

    if (apList && venueId) {
      apList({ params: { tenantId }, payload, enableRbac: true }, true)
        .unwrap()
        .then((res) => {
          const { data } = res || {}
          if (data) {
            const venueTriBandApModels = data
              .filter((ap: APExtended) => ap.venueId === venueId)
              .map((ap: APExtended) => ap.model)
            setVenueTriBandApModels(uniq(venueTriBandApModels))
          }
        })
    }
  }, [triBandApModels, venueId, apList, tenantId])

  return venueTriBandApModels
}

export const handleDual5GBandModeSpecialCase = (
  bandModeSettings: { model: string; bandMode: BandModeEnum }[] | undefined,
  dual5gModels: string[],
  dual5GData: { enabled?: boolean } | undefined
) => {
  if (!bandModeSettings) return []
  const dual5g = bandModeSettings.filter(vbm => dual5gModels.includes(vbm.model))
  const nonDual5g = bandModeSettings.filter(vbm => !dual5gModels.includes(vbm.model))

  if (dual5GData && dual5g.length > 0) {
    const updatedDual5g = dual5g.map(bandModel => ({
      model: bandModel.model,
      bandMode: dual5GData.enabled ? BandModeEnum.DUAL : BandModeEnum.TRIPLE
    }))
    return [...nonDual5g, ...updatedDual5g]
  }
  return [...bandModeSettings]
}

export const createCacheApGroupSettings = (
  currentSettings: ApGroupRadioCustomization | undefined,
  cacheSettings: ApGroupRadioCustomization | undefined,
  radioType: RadioType
): ApGroupRadioCustomization | undefined => {
  if (!currentSettings && !cacheSettings) {
    return undefined
  }

  if(!currentSettings) {
    return cacheSettings
  }

  if (!cacheSettings) {
    return currentSettings
  }

  switch (radioType) {
    case RadioType.Normal24GHz:
      return {
        ...cacheSettings,
        ...currentSettings.radioParams24G
          ? { radioParams24G: currentSettings.radioParams24G }
          : undefined
      }
    case RadioType.Normal5GHz:
      return {
        ...cacheSettings,
        ...currentSettings.radioParams50G ? { radioParams50G: currentSettings.radioParams50G } : undefined
      }
    case RadioType.Normal6GHz:
      return {
        ...cacheSettings,
        ...currentSettings.radioParams6G ? { radioParams6G: currentSettings.radioParams6G } : undefined
      }
    case RadioType.Lower5GHz:
      return {
        ...cacheSettings,
        radioParamsDual5G:
          { ...cacheSettings?.radioParamsDual5G,
            ...currentSettings.radioParamsDual5G?.radioParamsLower5G ? { radioParamsLower5G: currentSettings.radioParamsDual5G?.radioParamsLower5G } : undefined
          }
      }
    case RadioType.Upper5GHz:
      return {
        ...cacheSettings,
        radioParamsDual5G:
          { ...cacheSettings?.radioParamsDual5G,
            ...currentSettings.radioParamsDual5G?.radioParamsUpper5G ? { radioParamsUpper5G: currentSettings.radioParamsDual5G?.radioParamsUpper5G } : undefined
          }
      }
    default:
      return currentSettings
  }
}

export const applySettings = (currentSettings: ApGroupRadioCustomization | undefined, applySettings: ApGroupRadioCustomization, radioType: RadioType): ApGroupRadioCustomization | undefined => {
  if (!currentSettings && !applySettings) {
    return
  }

  if (!currentSettings) {
    return applySettings
  }

  switch (radioType) {
    case RadioType.Normal24GHz:
      return {
        ...currentSettings,
        radioParams24G: applySettings.radioParams24G
      }
    case RadioType.Normal5GHz:
      return {
        ...currentSettings,
        radioParams50G: applySettings.radioParams50G
      }
    case RadioType.Normal6GHz:
      return {
        ...currentSettings,
        radioParams6G: applySettings?.radioParams6G
      }
    case RadioType.Lower5GHz:
      return { ...currentSettings,
        radioParamsDual5G:
          { ...currentSettings?.radioParamsDual5G,
            radioParamsLower5G: applySettings?.radioParamsDual5G?.radioParamsLower5G } }
    case RadioType.Upper5GHz:
      return { ...currentSettings,
        radioParamsDual5G:
          { ...currentSettings?.radioParamsDual5G,
            radioParamsUpper5G: applySettings?.radioParamsDual5G?.radioParamsUpper5G } }
    default:
      return applySettings
  }
}

export const mergeRadioData = (data: ApGroupRadioCustomization, apGroupData: ApGroupRadioCustomization) => {
  let mergedData = {} as ApGroupRadioCustomization
  const { radioParams24G, radioParams50G, radioParams6G, radioParamsDual5G } = data
  const { radioParams24G: apGroupRadioParams24G, radioParams50G: apGroupRadioParams50G, radioParams6G: apGroupRadioParams6G, radioParamsDual5G: apGroupRadioParamsDual5G } = apGroupData
  return {
    ...mergedData,
    radioParams24G: {
      ...(apGroupRadioParams24G?.useVenueSettings ? radioParams24G : apGroupRadioParams24G)
    },
    radioParams50G: {
      ...(apGroupRadioParams50G?.useVenueSettings ? radioParams50G : apGroupRadioParams50G)
    },
    radioParams6G: {
      ...(apGroupRadioParams6G?.useVenueSettings ? radioParams6G : apGroupRadioParams6G)
    },
    radioParamsDual5G: {
      ...radioParamsDual5G,
      radioParamsLower5G: {
        ...(apGroupRadioParamsDual5G?.radioParamsLower5G?.useVenueSettings || apGroupRadioParamsDual5G?.radioParamsLower5G === undefined
          ? radioParamsDual5G?.radioParamsLower5G
          : apGroupRadioParamsDual5G?.radioParamsLower5G
        ),
        useVenueSettings: apGroupRadioParamsDual5G?.radioParamsLower5G?.useVenueSettings
      },
      radioParamsUpper5G: {
        ...(apGroupRadioParamsDual5G?.radioParamsUpper5G?.useVenueSettings || apGroupRadioParamsDual5G?.radioParamsUpper5G === undefined
          ? radioParamsDual5G?.radioParamsUpper5G
          : apGroupRadioParamsDual5G?.radioParamsUpper5G
        ),
        useVenueSettings: apGroupRadioParamsDual5G?.radioParamsUpper5G?.useVenueSettings
      }
    }
  } as ApGroupRadioCustomization
}
