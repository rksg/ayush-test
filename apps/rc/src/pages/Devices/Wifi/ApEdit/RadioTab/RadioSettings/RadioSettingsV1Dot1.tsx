/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { Col, Form, Radio, RadioChangeEvent, Row, Space }              from 'antd'
import { cloneDeep, flatten, includes, isEmpty, isEqual, isUndefined } from 'lodash'
import { FormattedMessage, useIntl }                                   from 'react-intl'

import {
  AnchorContext,
  Button,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Tabs,
  Tooltip,
  showActionModal } from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import {
  CorrectRadioChannels,
  GetSupportBandwidth,
  SupportRadioChannelsContext,
  VenueRadioContext,
  ApRadioTypeEnum,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  findIsolatedGroupByChannel,
  ApRadioTypeDataKeyMap,
  isCurrentTabUseVenueSettings,
  toggleState,
  getRadioTypeDisplayName,
  RadioType,
  StateOfIsUseVenueSettings
} from '@acx-ui/rc/components'
import {
  useGetApRadioCustomizationQuery,
  useGetApValidChannelQuery,
  useLazyGetVenueRadioCustomizationQuery,
  useUpdateApRadioCustomizationMutation,
  useLazyGetVenueApModelBandModeSettingsQuery,
  useGetApBandModeSettingsQuery,
  useUpdateApBandModeSettingsMutation,
  useApGroupsListQuery,
  useGetApGroupsTemplateListQuery,
  useGetApOperationalQuery
} from '@acx-ui/rc/services'
import {
  ApRadioCustomization,
  ApRadioParamsDual5G,
  ChannelBandwidth6GEnum,
  VenueExtended,
  VenueRadioCustomization,
  BandModeEnum,
  ApBandModeSettings
} from '@acx-ui/rc/utils'
import { ApGroupViewModel, TableResult, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                           from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'

import { ApBandManagementV1Dot1 } from './ApBandManagementV1Dot1'
import { ApSingleRadioSettings }  from './ApSingleRadioSettings'

export const isUseVenueSettings = (settings: ApRadioCustomization, radioType: RadioType): boolean => {
  const state = {
    isUseVenueSettings24G: settings.apRadioParams24G.useVenueSettings,
    isUseVenueSettings5G: settings?.apRadioParams50G?.useVenueSettings,
    isUseVenueSettings6G: settings?.apRadioParams6G?.useVenueSettings,
    isUseVenueSettingsLower5G: settings.apRadioParamsDual5G?.radioParamsLower5G?.useVenueSettings,
    isUseVenueSettingsUpper5G: settings.apRadioParamsDual5G?.radioParamsUpper5G?.useVenueSettings
  }

  return isCurrentTabUseVenueSettings(state, radioType)
}

export const extractStateOfIsUseVenueSettings = (apRadioCustomization: ApRadioCustomization): StateOfIsUseVenueSettings => {
  return {
    isUseVenueSettings24G: apRadioCustomization.apRadioParams24G.useVenueSettings,
    isUseVenueSettings5G: apRadioCustomization.apRadioParams50G?.useVenueSettings,
    isUseVenueSettings6G: apRadioCustomization.apRadioParams6G?.useVenueSettings,
    isUseVenueSettingsLower5G: apRadioCustomization.apRadioParamsDual5G?.radioParamsLower5G?.useVenueSettings,
    isUseVenueSettingsUpper5G: apRadioCustomization.apRadioParamsDual5G?.radioParamsUpper5G?.useVenueSettings
  }
}

export const summarizedStateOfIsUseVenueSettings = (state: StateOfIsUseVenueSettings): StateOfIsUseVenueSettings => {
  return { ...state }

}

export const createCacheSettings = (
  currentSettings: ApRadioCustomization | undefined,
  cacheSettings: ApRadioCustomization | undefined,
  radioType: RadioType
): ApRadioCustomization | undefined => {
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
      return { ...cacheSettings,
        enable24G: currentSettings.enable24G,
        ...currentSettings.apRadioParams24G ? { apRadioParams24G: currentSettings.apRadioParams24G } : undefined
      }
    case RadioType.Normal5GHz:
      return { ...cacheSettings,
        enable50G: currentSettings.enable50G,
        ...currentSettings.apRadioParams50G ? { apRadioParams50G: currentSettings.apRadioParams50G } : undefined
      }
    case RadioType.Normal6GHz:
      return {
        ...cacheSettings,
        enable6G: currentSettings.enable6G,
        ...currentSettings.apRadioParams6G ? { apRadioParams6G: currentSettings.apRadioParams6G } : undefined
      }
    case RadioType.Lower5GHz:
      return { ...cacheSettings,
        apRadioParamsDual5G:
          { ...cacheSettings?.apRadioParamsDual5G,
            lower5gEnabled: currentSettings?.apRadioParamsDual5G?.lower5gEnabled,
            ...currentSettings.apRadioParamsDual5G?.radioParamsLower5G ? { radioParamsLower5G: currentSettings.apRadioParamsDual5G?.radioParamsLower5G } : undefined
          }
      }
    case RadioType.Upper5GHz:
      return { ...cacheSettings,
        apRadioParamsDual5G:
          { ...cacheSettings?.apRadioParamsDual5G,
            upper5gEnabled: currentSettings?.apRadioParamsDual5G?.upper5gEnabled,
            ...currentSettings.apRadioParamsDual5G?.radioParamsUpper5G ? { radioParamsUpper5G: currentSettings.apRadioParamsDual5G?.radioParamsUpper5G } : undefined
          }
      }
    default:
      return currentSettings
  }
}

export const applySettings = (currentSettings: ApRadioCustomization | undefined, applySettings: ApRadioCustomization, radioType: RadioType): ApRadioCustomization | undefined => {
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
        enable24G: applySettings.enable24G,
        apRadioParams24G: applySettings.apRadioParams24G
      }
    case RadioType.Normal5GHz:
      return {
        ...currentSettings,
        enable50G: applySettings.enable50G,
        apRadioParams50G: applySettings.apRadioParams50G
      }
    case RadioType.Normal6GHz:
      return {
        ...currentSettings,
        enable6G: applySettings?.enable6G,
        apRadioParams6G: applySettings?.apRadioParams6G
      }
    case RadioType.Lower5GHz:
      return { ...currentSettings,
        apRadioParamsDual5G:
          { ...currentSettings?.apRadioParamsDual5G,
            lower5gEnabled: applySettings?.apRadioParamsDual5G?.lower5gEnabled,
            radioParamsLower5G: applySettings?.apRadioParamsDual5G?.radioParamsLower5G } }
    case RadioType.Upper5GHz:
      return { ...currentSettings,
        apRadioParamsDual5G:
          { ...currentSettings?.apRadioParamsDual5G,
            upper5gEnabled: applySettings?.apRadioParamsDual5G?.upper5gEnabled,
            radioParamsUpper5G: applySettings?.apRadioParamsDual5G?.radioParamsUpper5G } }
    default:
      return applySettings
  }
}

export const applyState = (state: StateOfIsUseVenueSettings, settings: ApRadioCustomization): ApRadioCustomization => {
  const cloneData = cloneDeep(settings)

  if (!isUndefined(cloneData) && !isUndefined(cloneData.apRadioParams24G)) {
    cloneData.apRadioParams24G.useVenueSettings = state.isUseVenueSettings24G
  }
  if (!isUndefined(cloneData) && !isUndefined(cloneData.apRadioParams50G)) {
    cloneData.apRadioParams50G.useVenueSettings = state.isUseVenueSettings5G
  }
  if (!isUndefined(cloneData) && !isUndefined(cloneData.apRadioParams6G)) {
    cloneData.apRadioParams6G.useVenueSettings = state.isUseVenueSettings6G
  }
  if (!isUndefined(cloneData) && !isUndefined(cloneData.apRadioParamsDual5G) && !isUndefined(cloneData.apRadioParamsDual5G.radioParamsLower5G)) {
    cloneData.apRadioParamsDual5G.radioParamsLower5G.useVenueSettings = state.isUseVenueSettingsLower5G
  }
  if (!isUndefined(cloneData) && !isUndefined(cloneData.apRadioParamsDual5G) && !isUndefined(cloneData.apRadioParamsDual5G.radioParamsUpper5G)) {
    cloneData.apRadioParamsDual5G.radioParamsUpper5G.useVenueSettings = state.isUseVenueSettingsUpper5G
  }

  return cloneData
}

export const isHasRadio5G = (isSupportTriBandRadioAp: boolean, isDual5gMode: boolean, lengthOfBandwidth5GOptions: number) => (!isSupportTriBandRadioAp || !isDual5gMode) && lengthOfBandwidth5GOptions > 0
export const isHasRadioDual5G = (isSupportDual5GAp: boolean, isDual5gMode: boolean) => isSupportDual5GAp && isDual5gMode
export const isHasRadio6G = (isSupportTriBandRadioAp: boolean, isDual5gMode: boolean, lengthOfBandwidth6GOptions: number) => (isSupportTriBandRadioAp && !isDual5gMode) && lengthOfBandwidth6GOptions > 0

export function VenueNameDisplay ({ venue }: { venue: VenueExtended | undefined }) {
  return (venue ?
    <TenantLink
      to={`venues/${venue.id}/venue-details/overview`}>{venue?.name}
    </TenantLink> : <span></span>
  )
}

export function RadioSettingsV1Dot1 (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { serialNumber, tenantId } = useParams()
  const { isAllowEdit=true } = props

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData,
    apViewContextData
  } = useContext(ApEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const afcFeatureflag = get('AFC_FEATURE_ENABLED').toLowerCase() === 'true'

  const wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)
  const ap70BetaFlag = useIsTierAllowed(TierFeatures.AP_70)
  const supportWifi7_320MHz = ap70BetaFlag && wifi7_320Mhz_FeatureFlag

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const is6gChannelSeparation = useIsSplitOn(Features.WIFI_6G_INDOOR_OUTDOOR_SEPARATION)

  const isWifiSwitchableRfEnabled = useIsSplitOn(Features.WIFI_SWITCHABLE_RF_TOGGLE)

  const isVenueChannelSelectionManualEnabled = useIsSplitOn(Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)

  const { apData, apCapabilities, venueData } = useContext(ApDataContext)
  const venueId = venueData?.id
  const params = {
    venueId,
    serialNumber
  }

  const {
    has160MHzChannelBandwidth = false,
    maxChannelization5G = 160,
    maxChannelization6G = 160,
    supportTriRadio = false,
    supportDual5gMode = false,
    supportBandCombination = false,
    bandCombinationCapabilities = [],
    isOutdoor = false
  } = apCapabilities || {}

  const getApAvailableChannels = useGetApValidChannelQuery({
    params,
    enableRbac: isUseRbacApi,
    enableSeparation: is6gChannelSeparation
  }, { skip: !venueId })

  const defaultStateOfIsUseVenueSettings: StateOfIsUseVenueSettings = {
    isUseVenueSettings24G: true,
    isUseVenueSettings5G: true,
    isUseVenueSettingsLower5G: true,
    isUseVenueSettingsUpper5G: true,
    isUseVenueSettings6G: true
  }

  const formRef = useRef<StepsFormLegacyInstance<ApRadioCustomization>>()
  const venueRef = useRef<ApRadioCustomization>()
  const cachedDataRef = useRef<ApRadioCustomization>()
  const operationCache = useRef<boolean>()
  const prevoiusBendModeRef = useRef<BandModeEnum>()

  const [stateOfIsUseVenueSettings, setStateOfIsUseVenueSettings] = useState(defaultStateOfIsUseVenueSettings)

  const [isEnable24g, setIsEnable24g] = useState(true)
  const [isEnable5g, setIsEnable5g] = useState(true)
  const [isEnable6g, setIsEnable6g] = useState(true)
  const [isEnableLower5g, setIsEnableLower5g] = useState(true)
  const [isEnableUpper5g, setIsEnableUpper5g] = useState(true)
  const [venueBandMode, setVenueBandMode] = useState(BandModeEnum.DUAL)
  const [venueRadioData, setVenueRadioData] = useState({} as VenueRadioCustomization)

  const [isDual5gMode, setIsDual5gMode] = useState(false)

  const [initApRadioData, setInitApRadioData] = useState({} as ApRadioCustomization)
  const [isApRadioDataInitializing, setIsApRadioDataInitializing] = useState(true)

  const [currentApBandModeData, setCurrentApBandModeData] = useState({} as ApBandModeSettings)
  const [initApBandModeData, setInitApBandModeData] = useState({} as ApBandModeSettings)
  const [isApBandModeDataInitializing, setIsApBandModeDataInitializing] = useState(true)

  const [isApDataLoaded, setIsApDataLoaded] = useState(false)

  const [stateOfUseVenueEnabled, setStateOfUseVenueEnabled] = useState<boolean>()
  const [venueOrApGroupDisplayName, setVenueOrApGroupDisplayName] = useState('')

  const { data: apRadioSavedData } =
    useGetApRadioCustomizationQuery({ params, enableRbac: isUseRbacApi }, { skip: !venueId })

  const [ updateApRadio, { isLoading: isUpdatingApRadio } ] =
    useUpdateApRadioCustomizationMutation()

  const [ updateApBandMode, { isLoading: isUpdatingApBandMode } ] =
    useUpdateApBandModeSettingsMutation()

  const [getVenueCustomization] = useLazyGetVenueRadioCustomizationQuery()
  const [getVenueApModelBandModeSettings] = useLazyGetVenueApModelBandModeSettingsQuery()

  const getCurrentBandMode: (() => BandModeEnum) = useCallback(() => {
    return (currentApBandModeData?.useVenueSettings ?? true) ? venueBandMode : currentApBandModeData?.bandMode
  }, [currentApBandModeData, venueBandMode])


  const { apModelType, supportRadioChannels, supportRadioDfsChannels, bandwidthRadioOptions } = useMemo(() => {
    const apModelType = (isOutdoor)? 'outdoor' : 'indoor'
    const availableChannels = getApAvailableChannels.data
    const is5GHas160Mhz = (has160MHzChannelBandwidth && maxChannelization5G >= 160)
    const is6GHas160Mhz = (has160MHzChannelBandwidth && maxChannelization6G >= 160)
    const is6GHas320Mhz = supportWifi7_320MHz && maxChannelization6G >= 320

    // 2.4G
    const supportCh24g = (availableChannels && availableChannels['2.4GChannels']) || {}
    const bandwidth24G = GetSupportBandwidth(channelBandwidth24GOptions, supportCh24g)

    // 5G
    const availableCh5g = (availableChannels && availableChannels['5GChannels'])
    const supportCh5g = (availableCh5g && availableCh5g[apModelType]) || {}
    const supportDfsCh5g = (availableCh5g && availableCh5g.dfs) || {}
    const bandwidth5g = GetSupportBandwidth(channelBandwidth5GOptions, supportCh5g, {
      isSupport160Mhz: is5GHas160Mhz
    })

    // dual 5g - lower
    const availableChLower5g = (availableChannels && availableChannels['5GLowerChannels'])
    const supportChLower5g = (availableChLower5g && availableChLower5g[apModelType]) || {}
    const supportDfsChLower5g = (availableChLower5g && availableChLower5g.dfs) || {}
    const bandwidthLower5g = GetSupportBandwidth(channelBandwidth5GOptions, supportChLower5g, {
      isSupport160Mhz: is5GHas160Mhz
    })

    // dual 5g - Upper
    const availableChUpper5g = (availableChannels && availableChannels['5GUpperChannels'])
    const supportChUpper5g = (availableChUpper5g && availableChUpper5g[apModelType]) || {}
    const supportDfsChUpper5g = (availableChUpper5g && availableChUpper5g.dfs) || {}
    const bandwidthUpper5g = GetSupportBandwidth(channelBandwidth5GOptions, supportChUpper5g, {
      isSupport160Mhz: is5GHas160Mhz
    })

    // 6G
    const availableCh6g = (availableChannels && availableChannels['6GChannels'])
    const supportCh6g =
      (is6gChannelSeparation ? (availableCh6g && availableCh6g[apModelType]) : availableCh6g) || {}
    const bandwidth6g = GetSupportBandwidth(channelBandwidth6GOptions, supportCh6g, {
      isSupport160Mhz: is6GHas160Mhz,
      isSupport320Mhz: is6GHas320Mhz
    })

    const supportRadioChannels = {
      [ApRadioTypeEnum.Radio24G]: supportCh24g,
      [ApRadioTypeEnum.Radio5G]: supportCh5g,
      [ApRadioTypeEnum.Radio6G]: supportCh6g,
      [ApRadioTypeEnum.RadioLower5G]: supportChLower5g,
      [ApRadioTypeEnum.RadioUpper5G]: supportChUpper5g
    }

    const supportRadioDfsChannels = {
      [ApRadioTypeEnum.Radio24G]: undefined,
      [ApRadioTypeEnum.Radio5G]: supportDfsCh5g,
      [ApRadioTypeEnum.Radio6G]: undefined,
      [ApRadioTypeEnum.RadioLower5G]: supportDfsChLower5g,
      [ApRadioTypeEnum.RadioUpper5G]: supportDfsChUpper5g
    }

    const bandwidthRadioOptions = {
      [ApRadioTypeEnum.Radio24G]: bandwidth24G,
      [ApRadioTypeEnum.Radio5G]: bandwidth5g,
      [ApRadioTypeEnum.Radio6G]: bandwidth6g,
      [ApRadioTypeEnum.RadioLower5G]: bandwidthLower5g,
      [ApRadioTypeEnum.RadioUpper5G]: bandwidthUpper5g
    }

    return {
      apModelType,
      supportRadioChannels,
      supportRadioDfsChannels,
      bandwidthRadioOptions
    }

  }, [getApAvailableChannels.data, has160MHzChannelBandwidth, isOutdoor, maxChannelization5G, maxChannelization6G, supportWifi7_320MHz])

  const afcProps = useMemo(() => {
    const availableChannels = getApAvailableChannels.data
    return {
      featureFlag: afcFeatureflag,
      isAFCEnabled: availableChannels?.afcEnabled,
      afcInfo: apViewContextData.apStatusData?.afcInfo
    }

  }, [getApAvailableChannels.data, afcFeatureflag, apViewContextData.apStatusData?.afcInfo])

  const { isSupportTriBandRadioAp, isSupportBandManagementAp, isSupportDual5GAp, display6GHzTab } = useMemo(() => {
    const isSupportTriBandRadioAp = supportTriRadio ||
    (isWifiSwitchableRfEnabled && supportBandCombination && includes(bandCombinationCapabilities, BandModeEnum.TRIPLE))

    const isSupportBandManagementAp = isWifiSwitchableRfEnabled && supportTriRadio &&
    (supportBandCombination || supportDual5gMode)

    const isSupportDual5GAp = supportTriRadio && supportDual5gMode

    const display6GHzTab = isSupportTriBandRadioAp && !isDual5gMode && (!isSupportBandManagementAp || getCurrentBandMode() === BandModeEnum.TRIPLE)

    return {
      isSupportTriBandRadioAp,
      isSupportBandManagementAp,
      isSupportDual5GAp,
      display6GHzTab
    }

  }, [bandCombinationCapabilities, isWifiSwitchableRfEnabled, supportBandCombination, supportDual5gMode, supportTriRadio, isDual5gMode, getCurrentBandMode])

  const { data: apBandModeSavedData } =
  useGetApBandModeSettingsQuery({ params, enableRbac: isUseRbacApi },
    { skip: !venueId || isSupportDual5GAp || !isSupportBandManagementAp })

  const isSupportDual5G = (isSupportDual5GAp &&
           bandwidthRadioOptions[ApRadioTypeEnum.RadioLower5G].length > 0 &&
           bandwidthRadioOptions[ApRadioTypeEnum.RadioUpper5G].length > 0)

  useEffect(() => {
    const availableChannels = getApAvailableChannels.data
    if (!isApDataLoaded && venueId && availableChannels) {
      const setData = async () => {
        if (isSupportBandManagementAp && !isSupportDual5GAp) {
          const venueApModelBandModeSettings = (await getVenueApModelBandModeSettings({
            params: { venueId } }, true).unwrap())

          setVenueBandMode(venueApModelBandModeSettings?.find(apModelBandMode => apModelBandMode.model === apData?.model)?.bandMode || apCapabilities?.defaultBandCombination as BandModeEnum)
        }

        setIsApDataLoaded(true)
      }

      setData()
    }
  }, [apData, getApAvailableChannels, isApDataLoaded, getVenueApModelBandModeSettings, isSupportBandManagementAp, isSupportDual5GAp, apCapabilities?.defaultBandCombination, venueId])

  useEffect(() => {
    if (isEmpty(venueData)) {
      return
    }

    const setData = async () => {
      const convertVenueRadioSetingsToApRadioSettings = (data: VenueRadioCustomization ) => {
        const getVenue5GRadioSetting = (radioParams: any) => {
          if (!radioParams) {
            return undefined
          }

          const allowedChannels = (apModelType === 'indoor')? radioParams.allowedIndoorChannels : radioParams.allowedOutdoorChannels
          const { changeInterval, channelBandwidth, method, scanInterval, txPower } = radioParams
          return {
            allowedChannels,
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

          const allowedChannels = (apModelType === 'indoor') ? radioParams.allowedIndoorChannels : radioParams.allowedOutdoorChannels
          const { changeInterval, channelBandwidth, method, txPower, bssMinRate6G, mgmtTxRate6G, channelBandwidth320MhzGroup, enableAfc } = radioParams
          return {
            allowedChannels,
            changeInterval,
            channelBandwidth,
            method,
            txPower,
            bssMinRate6G,
            mgmtTxRate6G,
            channelBandwidth320MhzGroup,
            enableAfc
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
          venueRadioParamsDual5G.enabled = isSupportDual5GAp && (radioParamsDual5G?.enabled === true)
          venueRadioParamsDual5G.lower5gEnabled = true
          venueRadioParamsDual5G.upper5gEnabled = true
          venueRadioParamsDual5G.radioParamsLower5G = venueRadioParamsLower5G
          venueRadioParamsDual5G.radioParamsUpper5G = venueRadioParamsUpper5G
        }

        return {
          enable24G: true,
          enable50G: true,
          enable6G: true,
          apRadioParams24G: venueRadioParams24G,
          apRadioParams50G: venueRadioParams50G,
          apRadioParamsDual5G: venueRadioParamsDual5G,
          apRadioParams6G: venueRadioParams6G
        }
      }

      const venueRadioData = (await getVenueCustomization({
        params: { venueId },
        enableRbac: isUseRbacApi,
        enableSeparation: is6gChannelSeparation
      }, true).unwrap())

      setVenueRadioData(venueRadioData)
      const apVenueData = convertVenueRadioSetingsToApRadioSettings(venueRadioData)
      venueRef.current = apVenueData

      if (isSupportBandManagementAp && isSupportDual5GAp) {
        setVenueBandMode(apVenueData.apRadioParamsDual5G?.enabled ? BandModeEnum.DUAL : BandModeEnum.TRIPLE)
      }
    }

    setData()
  }, [isSupportBandManagementAp, isSupportDual5GAp, venueId, apModelType, getVenueCustomization])

  const updateFormData = (data: ApRadioCustomization) => {
    formRef?.current?.setFieldsValue(data)
  }

  useEffect(() => {
    if (apRadioSavedData){

      const correctApiRadioChannelData = (apiData: ApRadioCustomization) => {
        const data = cloneDeep(apiData)
        const { apRadioParams24G, apRadioParams50G, apRadioParams6G, apRadioParamsDual5G } = data


        if (apRadioParams24G) {
          const supportCh24g = supportRadioChannels[ApRadioTypeEnum.Radio24G]
          data.apRadioParams24G = CorrectRadioChannels(apRadioParams24G, supportCh24g)
        }

        if (apRadioParams50G) {
          const supportCh5g = supportRadioChannels[ApRadioTypeEnum.Radio5G]
          data.apRadioParams50G = CorrectRadioChannels(apRadioParams50G, supportCh5g)
        }

        if (apRadioParams6G) {
          const supportCh6g = supportRadioChannels[ApRadioTypeEnum.Radio6G]
          data.apRadioParams6G = CorrectRadioChannels(apRadioParams6G, supportCh6g)
        }

        if (apRadioParamsDual5G) {
          const {
            enabled,
            lower5gEnabled,
            upper5gEnabled,
            radioParamsLower5G,
            radioParamsUpper5G
          } = apRadioParamsDual5G

          if (enabled) {
            if (lower5gEnabled && radioParamsLower5G) {
              const supportChLower5g = supportRadioChannels[ApRadioTypeEnum.RadioLower5G]
              data.apRadioParamsDual5G!.radioParamsLower5G = CorrectRadioChannels(radioParamsLower5G, supportChLower5g)
            }

            if (upper5gEnabled === false && radioParamsUpper5G) {
              const supportChUpper5g = supportRadioChannels[ApRadioTypeEnum.RadioUpper5G]
              data.apRadioParamsDual5G!.radioParamsUpper5G = CorrectRadioChannels(radioParamsUpper5G, supportChUpper5g)
            }
          }
        }

        return data
      }

      const updateRadioFormData = (radioParams: any) => {
        if (!radioParams) {
          return
        }

        const { method, manualChannel } = radioParams
        if (method === 'MANUAL') {
          if (isVenueChannelSelectionManualEnabled) {
            // Use venue settings & channel selection method is "manual", ap's allowedChannels = venue's allowedChannels.
            if (!radioParams.useVenueSettings) {
              radioParams.allowedChannels = [manualChannel.toString()]
            }
          } else {
            radioParams.allowedChannels = [manualChannel.toString()]
          }
        }
      }

      const apRadioData = correctApiRadioChannelData(apRadioSavedData)

      const {
        apRadioParams24G,
        apRadioParams50G,
        apRadioParams6G,
        apRadioParamsDual5G
      } = apRadioData

      updateRadioFormData(apRadioParams24G)
      updateRadioFormData(apRadioParams50G)
      updateRadioFormData(apRadioParams6G)

      const {
        radioParamsLower5G,
        radioParamsUpper5G } = apRadioParamsDual5G || {}

      updateRadioFormData(radioParamsLower5G)
      updateRadioFormData(radioParamsUpper5G)

      cachedDataRef.current = apRadioData

      setInitApRadioData(apRadioData)
      setIsApRadioDataInitializing(false)

      if (isSupportBandManagementAp && isSupportDual5GAp) {
        setInitApBandModeData({ useVenueSettings: apRadioParamsDual5G?.useVenueEnabled ?? true,
          bandMode: apRadioParamsDual5G?.enabled ? BandModeEnum.DUAL : BandModeEnum.TRIPLE })
        setCurrentApBandModeData({ useVenueSettings: apRadioParamsDual5G?.useVenueEnabled ?? true,
          bandMode: apRadioParamsDual5G?.enabled ? BandModeEnum.DUAL : BandModeEnum.TRIPLE })
        setIsApBandModeDataInitializing(false)
      }

      setReadyToScroll?.(r => [...(new Set(r.concat('Wi-Fi-Radio')))])
    }
  }, [apRadioSavedData, isSupportBandManagementAp, isSupportDual5GAp, setReadyToScroll, supportRadioChannels])

  useEffect(() => {
    if (apBandModeSavedData) {
      const initApBandModeData: ApBandModeSettings = {
        useVenueSettings: apBandModeSavedData.useVenueSettings ?? true,
        bandMode: apBandModeSavedData.bandMode ?? venueBandMode
      }
      setInitApBandModeData({ ...initApBandModeData } as ApBandModeSettings)
      setCurrentApBandModeData({ ...initApBandModeData } as ApBandModeSettings)
      setIsApBandModeDataInitializing(false)
    }
  }, [apBandModeSavedData, venueBandMode])

  useEffect(() => {
    if (!isSupportBandManagementAp) {
      return
    }

    //console.info('[RadioSettings] currentApBandModeData = ', currentApBandModeData) // eslint-disable-line no-console
    const currentBendMode = getCurrentBandMode()

    if (currentBendMode !== prevoiusBendModeRef.current) {
      const isDual5gEnabled = (currentBendMode === BandModeEnum.DUAL)

      if (isSupportDual5GAp) { // ex: R760
        setIsDual5gMode(isDual5gEnabled)
        formRef.current?.setFieldValue(['apRadioParamsDual5G', 'enabled'], isDual5gEnabled)
        formRef.current?.setFieldValue(['apRadioParamsDual5G', 'useVenueEnabled'], currentApBandModeData?.useVenueSettings)

        if (prevoiusBendModeRef.current) {
          formRef.current?.setFieldValue(['apRadioParamsDual5G', 'lower5gEnabled'], isDual5gEnabled)
          formRef.current?.setFieldValue(['apRadioParamsDual5G', 'upper5gEnabled'], isDual5gEnabled)
          formRef.current?.setFieldValue(['enable50G'], !isDual5gEnabled)
          formRef.current?.setFieldValue(['enable6G'], !isDual5gEnabled)

          handleEnableChanged(isDual5gEnabled, ApRadioTypeEnum.RadioLower5G)
          handleEnableChanged(isDual5gEnabled, ApRadioTypeEnum.RadioUpper5G)
          handleEnableChanged(!isDual5gEnabled, ApRadioTypeEnum.Radio5G)
          handleEnableChanged(!isDual5gEnabled, ApRadioTypeEnum.Radio6G)
        }
      } else { // ex: R670 ...etc
        if (prevoiusBendModeRef.current) {
          formRef.current?.setFieldValue(['enable6G'], !isDual5gEnabled)
          handleEnableChanged(!isDual5gEnabled, ApRadioTypeEnum.Radio6G)
        }
      }

      prevoiusBendModeRef.current = currentBendMode
    }

    onTabChange('Normal24GHz')

    if (!isEqual(currentApBandModeData, initApBandModeData)) {
      handleChange()
    }
  }, [currentApBandModeData, initApBandModeData, isSupportBandManagementAp, isSupportDual5GAp])

  useEffect(() => {
    if (!isEmpty(initApRadioData)) {
      const apRadioData = { ...initApRadioData }
      const {
        apRadioParamsDual5G,
        enable24G = false,
        enable50G = false,
        enable6G = false
      } = apRadioData

      setIsEnable24g(enable24G)
      setIsEnable5g(enable50G)
      setIsEnable6g(enable6G)

      const {
        lower5gEnabled = false,
        upper5gEnabled = false
      } = apRadioParamsDual5G || {}

      setIsEnableLower5g(isSupportDual5G && lower5gEnabled)
      setIsEnableUpper5g(isSupportDual5G && upper5gEnabled)

      const isDual5gMode = (isSupportDual5G && apRadioData.apRadioParamsDual5G?.enabled) || false
      setIsDual5gMode(isDual5gMode)

      const state = summarizedStateOfIsUseVenueSettings(extractStateOfIsUseVenueSettings(apRadioData))
      setStateOfIsUseVenueSettings(state)

      setStateOfUseVenueEnabled(apRadioParamsDual5G?.useVenueEnabled ?? true)
    }

  }, [initApRadioData, isSupportDual5G])

  const [currentTab, setCurrentTab] = useState(RadioType.Normal24GHz)

  const onTabChange = (tab: string) => {
    setCurrentTab((Object.keys(RadioType).find(key => key === tab) || RadioType.Normal24GHz) as RadioType)
  }

  const validateEnableAFCField = async (): Promise<boolean | undefined> => {
    return formRef?.current?.validateFields([[...ApRadioTypeDataKeyMap[ApRadioTypeEnum.Radio6G], 'enableAfc']])
      .then(()=> Promise.resolve(true))
      .catch((errorInfo)=> {
        showActionModal({
          type: 'error',
          width: 450,
          title: $t({ defaultMessage: 'You Have Invalid Changes' }),
          content: $t({ defaultMessage: 'You have invalid changes, please see technical detail for more information.' }),
          customContent: {
            action: 'SHOW_ERRORS',
            errorDetails: {
              error: flatten(errorInfo.errorFields.map((errorFields: any) => errorFields.errors[0])) as unknown as string
            }
          }
        })
        return Promise.reject(false)
      })
  }

  const handleEnableChanged = (value: boolean, radioType: ApRadioTypeEnum) => {
    switch(radioType) {
      case ApRadioTypeEnum.Radio24G:
        setIsEnable24g(value)
        break
      case ApRadioTypeEnum.Radio5G:
        setIsEnable5g(value)
        break
      case ApRadioTypeEnum.Radio6G:
        setIsEnable6g(value)
        break
      case ApRadioTypeEnum.RadioLower5G:
        setIsEnableLower5g(value)
        break
      case ApRadioTypeEnum.RadioUpper5G:
        setIsEnableUpper5g(value)
        break
      default:
        return
    }
  }

  const validRadioChannels = ( data: ApRadioCustomization,
    hasRadio5G: boolean, hasRadioDual5G: boolean, hasRadio6G: boolean ) => {

    const { apRadioParams24G, apRadioParams50G, apRadioParams6G, apRadioParamsDual5G } = data

    const validateChannels = (channels: unknown | undefined, method: string | undefined, title: string) => {
      if (Array.isArray(channels)) {
        const channelsLen = channels.length

        let content = ''
        if (method === 'MANUAL') {
          if (channelsLen !== 1) {
            content = $t({ defaultMessage: 'Please select one channel' })
          }
        } else if (channelsLen <2) {
          content = $t({ defaultMessage: 'Please select at least two channels' })
        }

        if (content !== '') {
          showActionModal({
            type: 'error',
            title: title,
            content: content
          })
          return false
        }
      }
      return true
    }

    const validate320MHzIsolatedGroup = (channels: unknown[] | undefined, method: string | undefined, title: string) => {
      const typeSafeChannels = channels as string[]
      if (method !== 'MANUAL') {
        const isolatedGroup = findIsolatedGroupByChannel(typeSafeChannels)
        if (isolatedGroup.length > 0) {
          showActionModal({
            type: 'error',
            title: title,
            content: $t({ defaultMessage: 'Please select two adjacent 160Mhz channels to combine one 320 MHz channel' })
          })
          return false
        }
      }
      return true
    }

    let title = ''
    const { allowedChannels: channel24, method: method24 } = apRadioParams24G || {}
    title = $t({ defaultMessage: '2.4 GHz - Channel selection' })
    if (!validateChannels(channel24, method24, title)) return false


    if (hasRadio5G) {
      const { allowedChannels: channel5, method: method5 } = apRadioParams50G || {}
      title = $t({ defaultMessage: '5 GHz - Channel selection' })
      if (!validateChannels(channel5, method5, title)) return false
    }

    if (hasRadio6G) {
      const { allowedChannels: channel6, method: method6, channelBandwidth } = apRadioParams6G || {}
      title = $t({ defaultMessage: '6 GHz - Channel selection' })
      if (!validateChannels(channel6, method6, title)) return false
      // Validate the isolated group only when bandwidth is 320Mhz
      if (channelBandwidth === ChannelBandwidth6GEnum._320MHz){
        if (!validate320MHzIsolatedGroup(channel6, method6, title)) return false
      }
    }

    if (hasRadioDual5G) {
      const { radioParamsLower5G, radioParamsUpper5G } = apRadioParamsDual5G || {}

      const { allowedChannels: channelLower5, method: methodLower5 } = radioParamsLower5G || {}
      title = $t({ defaultMessage: 'Lower 5 GHz - Channel selection' })
      if (!validateChannels(channelLower5, methodLower5, title)) return false

      const { allowedChannels: channelUpper5, method: methodUpper5 } = radioParamsUpper5G || {}
      title = $t({ defaultMessage: 'Upper 5 GHz - Channel selection' })
      if (!validateChannels(channelUpper5, methodUpper5, title)) return false

    }

    return true
  }

  const handleUpdateRadioSettings = async (form: StepsFormLegacyInstance) => {

    const updateRadioParams = (radioParams: any, supportCh: any) => {
      if (!radioParams) {
        return
      }

      const { method, allowedChannels, channelBandwidth } = radioParams
      const bandwidth = (channelBandwidth === 'AUTO') ? 'auto' : channelBandwidth

      if (method === 'MANUAL') {
        radioParams.manualChannel = (allowedChannels && parseInt(allowedChannels[0], 10)) || 0
        radioParams.allowedChannels = supportCh[bandwidth]
      } else {
        radioParams.manualChannel = 0
        if (!allowedChannels) {
          radioParams.allowedChannels = supportCh[bandwidth]
        }
      }
    }
    try {

      setEditContextData?.({
        ...editContextData,
        isDirty: false
      })

      const payload = { ...form.getFieldsValue() }
      const {
        apRadioParamsDual5G
      } = payload
      const fieldDual5GEnable = formRef.current?.getFieldValue(['apRadioParamsDual5G', 'enabled'])
      const hasRadio5G = isHasRadio5G(isSupportTriBandRadioAp, fieldDual5GEnable, bandwidthRadioOptions[ApRadioTypeEnum.Radio5G].length)
      const hasRadioDual5G = isHasRadioDual5G(isSupportDual5GAp, fieldDual5GEnable)
      const hasRadio6G = isHasRadio6G(isSupportTriBandRadioAp, fieldDual5GEnable, bandwidthRadioOptions[ApRadioTypeEnum.Radio6G].length)

      if (!validRadioChannels(payload, hasRadio5G, hasRadioDual5G, hasRadio6G)) {
        return
      }

      updateRadioParams(payload.apRadioParams24G, supportRadioChannels[ApRadioTypeEnum.Radio24G])

      if (hasRadio5G) {
        updateRadioParams(payload.apRadioParams50G, supportRadioChannels[ApRadioTypeEnum.Radio5G])
      } else {
        delete payload.apRadioParams50G
      }

      if (hasRadio6G) {
        updateRadioParams(payload.apRadioParams6G, supportRadioChannels[ApRadioTypeEnum.Radio6G])
        // 6Ghz still exist under AP Band dual situation
        // if 6Ghz tab doesn't show on the view, then no needs to do Enable AFC validation
        // Also set EnableAFC false.
        if(display6GHzTab){
          const validationResult = await validateEnableAFCField()
          if(!validationResult) return
        } else {
          payload.apRadioParams6G.enableAfc = false
        }
      } else {
        delete payload.apRadioParams6G
      }

      if (hasRadioDual5G) {
        const radioDual5G = apRadioParamsDual5G || new ApRadioParamsDual5G()
        updateRadioParams(radioDual5G.radioParamsLower5G, supportRadioChannels[ApRadioTypeEnum.RadioLower5G])
        updateRadioParams(radioDual5G.radioParamsUpper5G, supportRadioChannels[ApRadioTypeEnum.RadioUpper5G])
        payload.apRadioParamsDual5G = radioDual5G
      }
      else if (isSupportDual5GAp) {
        if (!apRadioParamsDual5G) {
          const radioDual5G = new ApRadioParamsDual5G()
          radioDual5G.enabled = false
          radioDual5G.radioParamsLower5G = undefined
          radioDual5G.radioParamsUpper5G = undefined
          payload.apRadioParamsDual5G = radioDual5G
        }
      }
      else {
        delete payload.apRadioParamsDual5G
      }

      if (hasRadio6G && !afcProps.isAFCEnabled) {
        delete payload.apRadioParams6G.enableAfc
      }


      if (isSupportBandManagementAp && !isSupportDual5GAp) {
        await updateApBandMode({
          params,
          payload: currentApBandModeData,
          enableRbac: isUseRbacApi
        }).unwrap()
      }

      await updateApRadio({
        params,
        payload: payload,
        enableRbac: isUseRbacApi
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  // remove the function after the WifiSwitchableRfEnabled always ON
  const handleTriBandTypeRadioChange = (e: RadioChangeEvent) => {
    const isDual5gEnabled = e.target.value
    setIsDual5gMode(isDual5gEnabled)
    formRef.current?.setFieldValue(['apRadioParamsDual5G', 'enabled'], isDual5gEnabled)
    onTabChange('Normal24GHz')
  }

  const handleOnUseVenueEnabledChange = () => {
    const flipState = !stateOfUseVenueEnabled
    // Enable venue setting
    if (flipState) {
      operationCache.current = formRef.current?.getFieldValue(['apRadioParamsDual5G', 'enabled'])
      formRef.current?.setFieldValue(['apRadioParamsDual5G', 'enabled'], venueRef?.current?.apRadioParamsDual5G?.enabled)
      setIsDual5gMode(venueRef?.current?.apRadioParamsDual5G?.enabled ?? true)
      formRef?.current?.setFieldValue(['apRadioParamsDual5G', 'useVenueEnabled'], flipState)
    // Customize
    } else {
      if (operationCache.current !== undefined) {
        formRef.current?.setFieldValue(['apRadioParamsDual5G', 'enabled'], operationCache.current)
        setIsDual5gMode(operationCache.current)
      }
      formRef?.current?.setFieldValue(['apRadioParamsDual5G', 'useVenueEnabled'], flipState)
    }
    setStateOfUseVenueEnabled(flipState)
    handleChange()
  }

  const handleStateOfIsUseVenueSettingsChange = () => {
    // 1. set updatedState
    const updatedState = summarizedStateOfIsUseVenueSettings(
      toggleState(stateOfIsUseVenueSettings, currentTab))

    setStateOfIsUseVenueSettings(updatedState)

    const currentSettings = formRef?.current?.getFieldsValue()
    // 2. save cached if isUseVenue is true
    // (that means toggle radio settings from useCustomize to useVenue, therefore we save current customized settings to cache for restoring later)
    const isUseVenue= isCurrentTabUseVenueSettings(updatedState, currentTab)
    if (isUseVenue) {
      cachedDataRef.current = createCacheSettings(currentSettings, cachedDataRef.current, currentTab)
    }
    // 3. update data
    const useSettings = isUseVenue ? venueRef.current : cachedDataRef.current
    const updatedSettings = useSettings ? applySettings(currentSettings, useSettings, currentTab) : undefined
    if (updatedSettings) {
      updateFormData(applyState(updatedState, updatedSettings))
    }
    // 4. set IsDual5gMode
    setIsDual5gMode((isSupportDual5G && updatedSettings?.apRadioParamsDual5G?.enabled) || false)
    // 5. update EditContext
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const updateEditContext = (form: StepsFormLegacyInstance, isDirty: boolean) => {
    setEditContextData?.({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: isDirty
    })
    setEditRadioContextData?.({
      ...editRadioContextData,
      updateWifiRadio: () => handleUpdateRadioSettings(form),
      discardWifiRadioChanges: () => handleDiscard()
    })
  }

  const handleDiscard = () => {
    const state = summarizedStateOfIsUseVenueSettings(
      extractStateOfIsUseVenueSettings(initApRadioData))
    setStateOfIsUseVenueSettings(state)
    formRef?.current?.setFieldsValue(initApRadioData)
    setCurrentApBandModeData({ ...initApBandModeData } as ApBandModeSettings)
  }

  const handleChange = async () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const { data: apGroupInfo } = useConfigTemplateQueryFnSwitcher<TableResult<ApGroupViewModel>>({
    useQueryFn: useApGroupsListQuery,
    useTemplateQueryFn: useGetApGroupsTemplateListQuery,
    payload: {
      searchString: '',
      fields: [ 'id', 'venueId', 'name'],
      filters: { venueId: [venueData?.id] },
      pageSize: 10000
    },
    skip: !venueData?.id
  })

  const {
    data: apDetails
  } = useGetApOperationalQuery({
    params: {
      tenantId,
      serialNumber: serialNumber ? serialNumber : '',
      venueId: venueData ? venueData.id : ''
    }
  })

  useEffect(() => {
    if (apGroupInfo?.data && apDetails) {
      setVenueOrApGroupDisplayName(apGroupInfo.data.filter((group) => group.id === apDetails.apGroupId)[0].name)
    }
  }, [apGroupInfo, apDetails])

  const displayVenueSettingAndCustomize = () => {
    return (
      <Row gutter={20}>
        <Col span={12}>
          <Space style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            paddingBottom: '20px' }}
          >
            {
              <Radio.Group
                data-testid='ap-radiosettings'
                value={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, currentTab)}
                onChange={handleStateOfIsUseVenueSettingsChange}
              >
                <Space direction='vertical'>
                  <Radio value={true} data-testid='ap-radiosettings-useVenueOrApGroupSettings'>
                    <FormattedMessage
                      defaultMessage={'Use inherited <radioTypeName></radioTypeName> settings from <venueOrApGroupName></venueOrApGroupName>'}
                      values={{
                        venueOrApGroupName: () => {
                          return venueOrApGroupDisplayName ? 'AP Group' : 'Venue'
                        },
                        radioTypeName: () => getRadioTypeDisplayName(currentTab)
                      }}
                    />
                  </Radio>
                  <Radio value={false} data-testid='ap-radiosettings-customize'>
                    <FormattedMessage
                      defaultMessage={'Custom <radioTypeName></radioTypeName> settings'}
                      values={{
                        radioTypeName: () => getRadioTypeDisplayName(currentTab)
                      }}
                    />
                  </Radio>
                </Space>
              </Radio.Group>
            }
          </Space>
        </Col>
      </Row>
    )

  }

  return (
    <Loader states={[{
      isLoading: !isApDataLoaded || isApRadioDataInitializing || (isSupportBandManagementAp && isApBandModeDataInitializing),
      isFetching: isUpdatingApRadio || (isWifiSwitchableRfEnabled && isUpdatingApBandMode)
    }]}>
      <StepsFormLegacy
        formRef={formRef}
        onFormChange={handleChange}
      >
        <StepsFormLegacy.StepForm data-testid='radio-settings' initialValues={initApRadioData}>
          { !isSupportBandManagementAp && isSupportDual5GAp && <div style={{ marginTop: '1em' }}>
            <Row gutter={0}>
              <Col span={5}>
                <span>{$t({ defaultMessage: 'How to handle tri-band radio?' })}</span>
              </Col>
              <>
                {stateOfUseVenueEnabled && <Col span={2}><VenueNameDisplay venue={venueData} /></Col>}
                <Col span={3}>
                  <Form.Item
                    name={['apRadioParamsDual5G', 'useVenueEnabled']}
                    hidden
                    children={<></>}
                  />
                  <Button type='link' onClick={handleOnUseVenueEnabledChange}>
                    { stateOfUseVenueEnabled ? $t({ defaultMessage: 'Change' }) : $t({ defaultMessage: 'Same as <VenueSingular></VenueSingular>' }) }
                  </Button>
                </Col>
              </>
              <Col span={2}>
                <Tooltip.Question
                  title={$t({ defaultMessage: 'This applies only to AP models that support tri-band, such as the R760' })}
                  placement='bottom'
                />
              </Col>
            </Row>
            <Form.Item
              name={['apRadioParamsDual5G', 'enabled']}
            >
              <Radio.Group
                disabled={stateOfUseVenueEnabled}
                style={{ display: 'flex', flexDirection: 'column' }}
                onChange={handleTriBandTypeRadioChange}
                options={[
                  { label: $t({ defaultMessage: 'Split 5GHz into lower and upper bands' }), value: true },
                  { label: $t({ defaultMessage: 'Use 5 and 6 GHz bands' }), value: false }
                ]}
              />
            </Form.Item>
          </div>
          }
          { isSupportBandManagementAp &&
          <>
            { isSupportDual5GAp &&
            <>
              <Form.Item
                name={['apRadioParamsDual5G', 'useVenueEnabled']}
                hidden
                children={<></>}
              />
              <Form.Item
                name={['apRadioParamsDual5G', 'enabled']}
                hidden
                children={<></>}
              />
            </>
            }
            <ApBandManagementV1Dot1
              venueBandMode={venueBandMode}
              currentApBandModeData={currentApBandModeData}
              setCurrentApBandModeData={setCurrentApBandModeData}
              venueOrApGroupDisplayName={venueOrApGroupDisplayName} />
          </>
          }
          <Tabs onChange={onTabChange}
            activeKey={currentTab}
            type='third'>
            <Tabs.TabPane tab={$t({ defaultMessage: '2.4 GHz' })} key={RadioType.Normal24GHz} />
            {(!isSupportTriBandRadioAp || !isDual5gMode) &&
              <Tabs.TabPane tab={$t({ defaultMessage: '5 GHz' })} key={RadioType.Normal5GHz} />
            }
            { isSupportDual5GAp && isDual5gMode &&
              <>
                <Tabs.TabPane
                  tab={$t({ defaultMessage: 'Lower 5 GHz' })}
                  key='Lower5GHz' />
                <Tabs.TabPane
                  tab={$t({ defaultMessage: 'Upper 5 GHz' })}
                  key='Upper5GHz' />
              </>
            }
            { display6GHzTab && <Tabs.TabPane tab={$t({ defaultMessage: '6 GHz' })} key={RadioType.Normal6GHz} /> }
          </Tabs>
          {displayVenueSettingAndCustomize()}
          <SupportRadioChannelsContext.Provider value={{
            bandwidthRadioOptions,
            supportRadioChannels,
            supportRadioDfsChannels }}>
            <div style={{ display: currentTab === RadioType.Normal24GHz ? 'block' : 'none' }}>
              <ApSingleRadioSettings
                isEnabled={isEnable24g}
                radioTypeName={getRadioTypeDisplayName(RadioType.Normal24GHz)}
                useVenueSettingsFieldName={['apRadioParams24G', 'useVenueSettings']}
                enabledFieldName={['enable24G']}
                onEnableChanged={handleEnableChanged}
                radioType={ApRadioTypeEnum.Radio24G}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Normal24GHz)}
              />
            </div>
            <div style={{ display: currentTab === RadioType.Normal5GHz ? 'block' : 'none' }}>
              <ApSingleRadioSettings
                isEnabled={isEnable5g}
                radioTypeName={getRadioTypeDisplayName(RadioType.Normal5GHz)}
                useVenueSettingsFieldName={['apRadioParams50G', 'useVenueSettings']}
                enabledFieldName={['enable50G']}
                onEnableChanged={handleEnableChanged}
                radioType={ApRadioTypeEnum.Radio5G}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Normal5GHz)}
              />
            </div>
            <VenueRadioContext.Provider value={{ venue: venueData, venueRadio: venueRadioData }}>
              <div style={{ display: currentTab === RadioType.Normal6GHz ? 'block' : 'none' }}>
                <ApSingleRadioSettings
                  isEnabled={isEnable6g}
                  radioTypeName={getRadioTypeDisplayName(RadioType.Normal6GHz)}
                  useVenueSettingsFieldName={['apRadioParams6G', 'useVenueSettings']}
                  enabledFieldName={['enable6G']}
                  onEnableChanged={handleEnableChanged}
                  radioType={ApRadioTypeEnum.Radio6G}
                  disabled={!isAllowEdit}
                  handleChanged={handleChange}
                  isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Normal6GHz)}
                  afcProps={afcProps}
                />
              </div>
            </VenueRadioContext.Provider>
            {isSupportDual5GAp && (
              <>
                <div style={{ display: currentTab === RadioType.Lower5GHz ? 'block' : 'none' }}>
                  <ApSingleRadioSettings
                    isEnabled={isEnableLower5g}
                    radioTypeName={getRadioTypeDisplayName(RadioType.Lower5GHz)}
                    useVenueSettingsFieldName={['apRadioParamsDual5G', 'radioParamsLower5G', 'useVenueSettings']}
                    enabledFieldName={['apRadioParamsDual5G', 'lower5gEnabled']}
                    onEnableChanged={handleEnableChanged}
                    radioType={ApRadioTypeEnum.RadioLower5G}
                    disabled={!isAllowEdit}
                    handleChanged={handleChange}
                    isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Lower5GHz)}
                  />
                </div>
                <div style={{ display: currentTab === RadioType.Upper5GHz ? 'block' : 'none' }}>
                  <ApSingleRadioSettings
                    isEnabled={isEnableUpper5g}
                    radioTypeName={getRadioTypeDisplayName(RadioType.Upper5GHz)}
                    useVenueSettingsFieldName={['apRadioParamsDual5G', 'radioParamsUpper5G', 'useVenueSettings']}
                    enabledFieldName={['apRadioParamsDual5G', 'upper5gEnabled']}
                    onEnableChanged={handleEnableChanged}
                    radioType={ApRadioTypeEnum.RadioUpper5G}
                    disabled={!isAllowEdit}
                    handleChanged={handleChange}
                    isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Upper5GHz)}
                  />
                </div>
              </>
            )}
          </SupportRadioChannelsContext.Provider>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}
