/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  Col,
  Divider,
  Form,
  Radio,
  RadioChangeEvent,
  Row, Space,
  Switch
} from 'antd'
import {
  isEmpty,
  isEqual,
  dropRight,
  uniq,
  flatten,
  cloneDeep,
  set, isUndefined
} from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  AnchorContext, Loader, showActionModal, StepsFormLegacy,
  StepsFormLegacyInstance, Tabs, Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures }                           from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                                       from '@acx-ui/icons'
import {
  useLazyApListQuery,
  useGetVenueRadioCustomizationQuery,
  useUpdateVenueTripleBandRadioSettingsMutation,
  useGetVenueApModelBandModeSettingsQuery,
  useUpdateVenueApModelBandModeSettingsMutation,
  useGetVenueTemplateTripleBandRadioSettingsQuery,
  useGetVenueTripleBandRadioSettingsQuery,
  useGetVenueTemplateRadioCustomizationQuery,
  useUpdateVenueTemplateTripleBandRadioSettingsMutation,
  useGetVenueTemplateApModelBandModeSettingsQuery,
  useUpdateVenueTemplateApModelBandModeSettingsMutation,
  useLazyGetVenueRadioCustomizationQuery,
  useGetApGroupRadioCustomizationQuery,
  useUpdateApGroupRadioCustomizationMutation, useGetApGroupDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  VenueRadioCustomization,
  ChannelBandwidth6GEnum,
  BandModeEnum,
  VenueApModelBandModeSettings,
  TriBandSettings,
  useConfigTemplate,
  ScanMethodEnum,
  ApGroupApModelBandModeSettings,
  ApGroupDefaultRegulatoryChannels,
  useSupportedApModelTooltip,
  ApGroupRadioCustomization, ApRadioParamsDual5G
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import {
  RadioSettingsContents,
  RadioSettingsUtils,
  RadioLegends
} from '../../RadioSettings'
import {
  ApGroupRadioTypeDataKeyMap,
  ApRadioTypeEnum, getRadioTypeDisplayName,
  isCurrentTabUseVenueSettings,
  RadioType,
  StateOfIsUseVenueSettings, toggleState
} from '../../RadioSettings/RadioSettingsContents'
import {
  findIsolatedGroupByChannel
} from '../../RadioSettingsChannels/320Mhz/ChannelComponentStates'
import {
  useApGroupConfigTemplateMutationFnSwitcher,
  useApGroupConfigTemplateQueryFnSwitcher
} from '../apGroupConfigTemplateApiSwitcher'
import { ApGroupEditContext }          from '../context'
import { ApGroupRadioConfigItemProps } from '../index'
import { RadioLabel }                  from '../styledComponents'

import { ApGroupSingleRadioSettings } from './ApGroupSingleRadioSettings'

const { channelBandwidth24GOptions, channelBandwidth5GOptions,
  channelBandwidth6GOptions, split5GChannels, SupportRadioChannelsContext } = RadioSettingsContents

const {
  CorrectRadioChannels,
  GetSupportBandwidth,
  GetSupportIndoorOutdoorBandwidth
} = RadioSettingsUtils

const createCacheSettings = (
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
      return { ...cacheSettings,
        ...currentSettings.radioParams24G
          ? { radioParams24G: currentSettings.radioParams24G }
          : undefined
      }
    case RadioType.Normal5GHz:
      return { ...cacheSettings,
        ...currentSettings.radioParams50G ? { radioParams50G: currentSettings.radioParams50G } : undefined
      }
    case RadioType.Normal6GHz:
      return {
        ...cacheSettings,
        ...currentSettings.radioParams6G ? { radioParams6G: currentSettings.radioParams6G } : undefined
      }
    case RadioType.Lower5GHz:
      return { ...cacheSettings,
        radioParamsDual5G:
          { ...cacheSettings?.radioParamsDual5G,
            ...currentSettings.radioParamsDual5G?.radioParamsLower5G ? { radioParamsLower5G: currentSettings.radioParamsDual5G?.radioParamsLower5G } : undefined
          }
      }
    case RadioType.Upper5GHz:
      return { ...cacheSettings,
        radioParamsDual5G:
          { ...cacheSettings?.radioParamsDual5G,
            ...currentSettings.radioParamsDual5G?.radioParamsUpper5G ? { radioParamsUpper5G: currentSettings.radioParamsDual5G?.radioParamsUpper5G } : undefined
          }
      }
    default:
      return currentSettings
  }
}

const applySettings = (currentSettings: ApGroupRadioCustomization | undefined, applySettings: ApGroupRadioCustomization, radioType: RadioType): ApGroupRadioCustomization | undefined => {
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

export function RadioSettings (props: ApGroupRadioConfigItemProps) {
  const { $t } = useIntl()
  const { isAllowEdit=true } = props

  const wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)
  const ap70BetaFlag = useIsTierAllowed(TierFeatures.AP_70)
  const supportWifi7_320MHz = ap70BetaFlag && wifi7_320Mhz_FeatureFlag

  const isWifiSwitchableRfEnabled = useIsSplitOn(Features.WIFI_SWITCHABLE_RF_TOGGLE)

  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const is6gChannelSeparation = useIsSplitOn(Features.WIFI_6G_INDOOR_OUTDOOR_SEPARATION)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseRbacApi
  const isVenueChannelSelectionManualEnabled = useIsSplitOn(Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)

  const defaultStateOfIsUseVenueSettings: StateOfIsUseVenueSettings = {
    isUseVenueSettings24G: true,
    isUseVenueSettings5G: true,
    isUseVenueSettingsLower5G: true,
    isUseVenueSettingsUpper5G: true,
    isUseVenueSettings6G: true
  }

  const [stateOfIsUseVenueSettings, setStateOfIsUseVenueSettings] = useState(defaultStateOfIsUseVenueSettings)

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData,
    venueId,
    venueData,
    apGroupApCaps
  } = useContext(ApGroupEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const { tenantId, apGroupId } = useParams()

  const formRef = useRef<StepsFormLegacyInstance<ApGroupRadioCustomization>>()
  const venueRef = useRef<ApGroupRadioCustomization>()
  const cachedDataRef = useRef<ApGroupRadioCustomization>()
  const isTriBandRadioRef = useRef<boolean>(false)
  const [isTriBandRadio, setIsTriBandRadio] = useState(false)
  const [isDual5gMode, setIsDual5gMode] = useState(true)

  const [isLower5gInherit, setIsLower5gInherit] = useState(true)
  const [isUpper5gInherit, setIsUpper5gInherit] = useState(true)

  const [isEnable24g, setIsEnable24g] = useState(true)
  const [isEnable5g, setIsEnable5g] = useState(true)
  const [isEnable6g, setIsEnable6g] = useState(true)
  const [isEnableLower5g, setIsEnableLower5g] = useState(true)
  const [isEnableUpper5g, setIsEnableUpper5g] = useState(true)

  const [venueTriBandApModels, setVenueTriBandApModels] = useState<string[]>([])

  const [currentVenueBandModeData, setCurrentVenueBandModeData] = useState([] as ApGroupApModelBandModeSettings[])
  const [initVenueBandModeData, setInitVenueBandModeData] = useState([] as ApGroupApModelBandModeSettings[])

  const [defaultRadioSettings, setDefaultRadioSettings] = useState<ApGroupRadioCustomization | undefined>(undefined)

  const { data: tripleBandRadioSettingsData, isLoading: isLoadingTripleBandRadioSettingsData } =
    useApGroupConfigTemplateQueryFnSwitcher<TriBandSettings>({
      useQueryFn: useGetVenueTripleBandRadioSettingsQuery,
      useTemplateQueryFn: useGetVenueTemplateTripleBandRadioSettingsQuery,
      skip: resolvedRbacEnabled,
      extraParams: { venueId }
    })


  // available channels from this venue country code
  const { data: supportChannelsData, isLoading: isLoadingSupportChannelsData } =
    useApGroupConfigTemplateQueryFnSwitcher<ApGroupDefaultRegulatoryChannels>({
      useQueryFn: useGetApGroupDefaultRegulatoryChannelsQuery,
      useTemplateQueryFn: useGetApGroupDefaultRegulatoryChannelsQuery,
      extraParams: { venueId }
    })

  // Custom radio data
  const { data: venueSavedChannelsData, isLoading: isLoadingVenueData } =
    useApGroupConfigTemplateQueryFnSwitcher<VenueRadioCustomization>({
      useQueryFn: useGetVenueRadioCustomizationQuery,
      useTemplateQueryFn: useGetVenueTemplateRadioCustomizationQuery,
      enableRbac: isUseRbacApi,
      extraParams: { venueId },
      extraQueryArgs: {
        enableSeparation: is6gChannelSeparation
      }
    })

  const { data: apGroupRadioData, isLoading: isLoadingApGroupData } =
    useApGroupConfigTemplateQueryFnSwitcher<ApGroupRadioCustomization>({
      useQueryFn: useGetApGroupRadioCustomizationQuery,
      useTemplateQueryFn: useGetApGroupRadioCustomizationQuery,
      enableRbac: isUseRbacApi,
      extraParams: { venueId, apGroupId }
    })

  const [ updateApGroupRadioCustomization, { isLoading: isUpdatingApGroupRadio } ] = useApGroupConfigTemplateMutationFnSwitcher(
    useUpdateApGroupRadioCustomizationMutation,
    useUpdateApGroupRadioCustomizationMutation
  )

  const [ updateVenueTripleBandRadioSettings ] = useApGroupConfigTemplateMutationFnSwitcher(
    useUpdateVenueTripleBandRadioSettingsMutation,
    useUpdateVenueTemplateTripleBandRadioSettingsMutation
  )

  const { data: venueBandModeSavedData, isLoading: isLoadingVenueBandModeData } =
    useApGroupConfigTemplateQueryFnSwitcher<VenueApModelBandModeSettings[], void>({
      useQueryFn: useGetVenueApModelBandModeSettingsQuery,
      useTemplateQueryFn: useGetVenueTemplateApModelBandModeSettingsQuery,
      skip: !isWifiSwitchableRfEnabled,
      extraParams: { venueId }
    })

  const [getVenueCustomization] = useLazyGetVenueRadioCustomizationQuery()

  const [ updateVenueBandMode, { isLoading: isUpdatingVenueBandMode } ] =
    useApGroupConfigTemplateMutationFnSwitcher(
      useUpdateVenueApModelBandModeSettingsMutation,
      useUpdateVenueTemplateApModelBandModeSettingsMutation
    )

  const [ apList ] = useLazyApListQuery()

  const { supportRadioChannels, bandwidthRadioOptions, isSupport6GCountry } = useMemo(() => {
    const supportCh24g = (supportChannelsData && supportChannelsData['2.4GChannels']) || {}
    const supportCh5g = (supportChannelsData && supportChannelsData['5GChannels']) || {}
    const supportCh6g = (supportChannelsData && supportChannelsData['6GChannels']) || {}
    const supportChLower5g = (supportChannelsData && supportChannelsData['5GLowerChannels']) || {}
    const supportChUpper5g = (supportChannelsData && supportChannelsData['5GUpperChannels']) || {}

    const supportRadioChannels = {
      [ApRadioTypeEnum.Radio24G]: supportCh24g,
      [ApRadioTypeEnum.Radio5G]: supportCh5g,
      [ApRadioTypeEnum.Radio6G]: supportCh6g,
      [ApRadioTypeEnum.RadioLower5G]: supportChLower5g,
      [ApRadioTypeEnum.RadioUpper5G]: supportChUpper5g
    }

    const radio6GBandwidth = supportWifi7_320MHz
      ? channelBandwidth6GOptions
      : dropRight(channelBandwidth6GOptions)

    const bandwidthRadioOptions = {
      [ApRadioTypeEnum.Radio24G]: GetSupportBandwidth(channelBandwidth24GOptions, supportCh24g),
      [ApRadioTypeEnum.Radio5G]: GetSupportIndoorOutdoorBandwidth(channelBandwidth5GOptions, supportCh5g),
      [ApRadioTypeEnum.Radio6G]: is6gChannelSeparation ?
        GetSupportIndoorOutdoorBandwidth(radio6GBandwidth, supportCh6g) :
        GetSupportBandwidth(radio6GBandwidth, supportCh6g),
      [ApRadioTypeEnum.RadioLower5G]: GetSupportIndoorOutdoorBandwidth(channelBandwidth5GOptions, supportChLower5g),
      [ApRadioTypeEnum.RadioUpper5G]: GetSupportIndoorOutdoorBandwidth(channelBandwidth5GOptions, supportChUpper5g)
    }

    const isSupport6GCountry = bandwidthRadioOptions[ApRadioTypeEnum.Radio6G].length > 0

    return {
      supportRadioChannels,
      bandwidthRadioOptions,
      isSupport6GCountry
    }
  }, [supportChannelsData, supportWifi7_320MHz])

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

          const { allowedIndoorChannels, allowedOutdoorChannels, changeInterval, channelBandwidth, method, txPower, bssMinRate6G, mgmtTxRate6G, channelBandwidth320MhzGroup, enableAfc } = radioParams
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

      const venueRadioData = (await getVenueCustomization({
        params: { venueId },
        enableRbac: isUseRbacApi,
        enableSeparation: is6gChannelSeparation
      }, true).unwrap())

      const apVenueData = convertVenueRadioSetingsToApRadioSettings(venueRadioData)
      venueRef.current = apVenueData as ApGroupRadioCustomization
    }

    setData()
  }, [venueId, getVenueCustomization, apGroupId, venueData])

  const supportedApModelTooltip = useSupportedApModelTooltip()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { triBandApModels, dual5gApModels, bandModeCaps } = useMemo(() => {
    if (apGroupApCaps) {
      const apModels = apGroupApCaps.apModels
      const triBandApModels = apModels
        .filter(apCapability => apCapability.supportTriRadio === true)
        .map(triBandApCapability => triBandApCapability.model) as string[]

      const dual5gApModels = apModels
        .filter(apCapability => apCapability.supportDual5gMode === true)
        .map(dual5gApCapability => dual5gApCapability.model) as string[]

      const bandModeCaps = apModels
        .filter(apCapability => apCapability.supportBandCombination === true)
        .reduce((a, v) => ({ ...a, [v.model as string]: v.bandCombinationCapabilities }), {})

      return {
        triBandApModels,
        dual5gApModels,
        bandModeCaps
      }
    }

    return {
      triBandApModels: [],
      dual5gApModels: [],
      bandModeCaps: []
    }

  }, [apGroupApCaps])

  useEffect(() => {
    const triBandApModelNames = isEmpty(triBandApModels)? ['R760', 'R560'] : triBandApModels
    let filters = { model: triBandApModelNames, venueId: [venueId] }

    const payload = {
      fields: ['name', 'model', 'venueId', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters
    }

    if (apList && venueId) {
      apList({ params: { tenantId }, payload, enableRbac: isUseRbacApi }, true).unwrap()
        .then((res)=>{
          const { data } = res || {}
          if (data) {
            const venueTriBandApModels = data.filter((ap: APExtended) => ap.venueId === venueId)
              .map((ap: APExtended) => ap.model)
            setVenueTriBandApModels(uniq(venueTriBandApModels))
          }
        })
    }
  }, [triBandApModels, venueId])

  useEffect(() => {
    if (isWifiSwitchableRfEnabled) {
      return
    }
    const triBandEnabled = !!(tripleBandRadioSettingsData?.enabled)
    const isTriBandRadio = venueTriBandApModels.length > 0 || triBandEnabled
    setIsTriBandRadio(isTriBandRadio)
    isTriBandRadioRef.current = isTriBandRadio
  }, [isWifiSwitchableRfEnabled, tripleBandRadioSettingsData, venueTriBandApModels])

  useEffect(() => {
    const correctApiRadioChannelData = (apiData: ApGroupRadioCustomization) => {
      const data = cloneDeep(apiData)
      const { radioParams24G, radioParams50G, radioParams6G, radioParamsDual5G } = data

      if (radioParams24G) {
        const supportCh24g = supportRadioChannels[ApRadioTypeEnum.Radio24G]
        data.radioParams24G = CorrectRadioChannels(radioParams24G, supportCh24g)
      }

      if (radioParams50G) {
        const supportCh5g = supportRadioChannels[ApRadioTypeEnum.Radio5G]
        data.radioParams50G = CorrectRadioChannels(radioParams50G, supportCh5g)
      }

      if (radioParams6G) {
        const supportCh6g = supportRadioChannels[ApRadioTypeEnum.Radio6G]
        data.radioParams6G = CorrectRadioChannels(radioParams6G, supportCh6g)
      }

      if (radioParamsDual5G) {
        const {
          enabled,
          inheritParamsLower5G,
          inheritParamsUpper5G,
          radioParamsLower5G,
          radioParamsUpper5G
        } = radioParamsDual5G

        if (enabled) {
          if (inheritParamsLower5G === false && radioParamsLower5G) {
            const supportChLower5g = supportRadioChannels[ApRadioTypeEnum.RadioLower5G]
            data.radioParamsDual5G!.radioParamsLower5G = CorrectRadioChannels(radioParamsLower5G, supportChLower5g)
          }

          if (inheritParamsUpper5G === false && radioParamsUpper5G) {
            const supportChUpper5g = supportRadioChannels[ApRadioTypeEnum.RadioUpper5G]
            data.radioParamsDual5G!.radioParamsUpper5G = CorrectRadioChannels(radioParamsUpper5G, supportChUpper5g)
          }
        }
      }

      return data
    }

    const mergeRadioData = (data: ApGroupRadioCustomization, apGroupData: ApGroupRadioCustomization) => {
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
            ...(apGroupRadioParamsDual5G?.radioParamsUpper5G?.useVenueSettings || apGroupRadioParamsDual5G?.radioParamsUpper5G === undefined
              ? radioParamsDual5G?.radioParamsUpper5G
              : apGroupRadioParamsDual5G?.radioParamsUpper5G
            )
          }
        }
      } as ApGroupRadioCustomization
    }

    const setRadioFormData = (data: ApGroupRadioCustomization) => {
      // set EditRadioContext enableAfc false if AFC is not enable
      // Otherwise the data could be true and it will case backend throw error
      const isAFCEnabled = supportChannelsData?.afcEnabled
      if (!isAFCEnabled) {
        set(data, 'radioParams6G.enableAfc', false)
      }
      const { radioParams6G } = data
      if (radioParams6G) {
        const { enableMulticastUplinkRateLimiting, enableMulticastDownlinkRateLimiting } = radioParams6G
        if (enableMulticastUplinkRateLimiting || enableMulticastDownlinkRateLimiting) {
          set(data, 'radioParams6G.enableMulticastRateLimiting', true)
        }
      }

      setEditRadioContextData({ radioData: data })
      formRef?.current?.setFieldsValue(data)

      cachedDataRef.current = data

      const dual5GData = data?.radioParamsDual5G
      setIsDual5gMode(!!dual5GData?.enabled)

      setIsLower5gInherit(!!dual5GData?.inheritParamsLower5G)
      setIsUpper5gInherit(!!dual5GData?.inheritParamsUpper5G)

      setEditRadioContextData({
        ...editRadioContextData,
        radioData: formRef.current?.getFieldsValue(),
        updateWifiRadio: handleUpdateRadioSettings,
        discardWifiRadioChanges: handleDiscard
      })
    }

    if (!isLoadingVenueData && venueSavedChannelsData && apGroupRadioData && formRef?.current && supportRadioChannels) {
      const correctedData = correctApiRadioChannelData(venueSavedChannelsData)
      const correctedApGroupData = correctApiRadioChannelData(apGroupRadioData)
      const mergedData = mergeRadioData(correctedData, correctedApGroupData)
      setRadioFormData(mergedData)
      if (!defaultRadioSettings) setDefaultRadioSettings(mergedData)

      setReadyToScroll?.(r => [...(new Set(r.concat('Wi-Fi-Radio')))])
    }
  }, [isLoadingVenueData, venueSavedChannelsData, apGroupRadioData, formRef?.current, supportRadioChannels])

  useEffect(() => {
    if (!isWifiSwitchableRfEnabled || !venueBandModeSavedData || !venueSavedChannelsData) {
      return
    }
    // special case
    if (dual5gApModels.length > 0) {
      const dual5GData = venueSavedChannelsData.radioParamsDual5G
      const bendModelWithDual5gAps = venueBandModeSavedData.filter(vbm => dual5gApModels.includes(vbm.model))
      const bendModelWithoutDual5gAps = venueBandModeSavedData.filter(vbm => !dual5gApModels.includes(vbm.model))
      if (dual5GData && bendModelWithDual5gAps) {
        const initVenueBandModeData = [ ...bendModelWithoutDual5gAps,
          ...bendModelWithDual5gAps.map(bandModel => ({ model: bandModel.model, bandMode: dual5GData.enabled ? BandModeEnum.DUAL : BandModeEnum.TRIPLE })) ]
        setInitVenueBandModeData(initVenueBandModeData)
        setCurrentVenueBandModeData([ ...initVenueBandModeData ])

        return
      }
    }

    setInitVenueBandModeData([ ...venueBandModeSavedData ])
    setCurrentVenueBandModeData([ ...venueBandModeSavedData ])
  }, [isWifiSwitchableRfEnabled, venueBandModeSavedData, dual5gApModels, venueSavedChannelsData, venueTriBandApModels])

  useEffect(() => {
    if (!isWifiSwitchableRfEnabled) {
      return
    }

    const isTriBandRadio = currentVenueBandModeData.map(data => data.bandMode).some(bandMode => bandMode === BandModeEnum.TRIPLE)
    setIsTriBandRadio(isTriBandRadio)
    isTriBandRadioRef.current = isTriBandRadio
    if (!isTriBandRadio && currentTab === 'Normal6GHz') {
      onTabChange('Normal5GHz')
    }

    if (dual5gApModels.length > 0) {
      const isDual5GEnabled = currentVenueBandModeData.filter(data => dual5gApModels.includes(data.model))
        .map(data => data.bandMode).some(bandMode => bandMode === BandModeEnum.DUAL)
      setIsDual5gMode(isDual5GEnabled)
      formRef.current?.setFieldValue(['radioParamsDual5G', 'enabled'], isDual5GEnabled)
      if (!isDual5GEnabled && ['Lower5GHz', 'Upper5GHz'].includes(currentTab)) {
        onTabChange(isTriBandRadio ? 'Normal6GHz' : 'Normal5GHz')
      }
    }
    if (!isEqual(currentVenueBandModeData, initVenueBandModeData)) {
      handleChange()
    }
  }, [isWifiSwitchableRfEnabled, currentVenueBandModeData, initVenueBandModeData, dual5gApModels])

  const [currentTab, setCurrentTab] = useState('Normal24GHz')
  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const onTriBandTypeRadioChange = (e: RadioChangeEvent) => {
    const isDual5GEnabled = e.target.value
    setIsDual5gMode(isDual5GEnabled)
    formRef.current?.setFieldValue(['radioParamsDual5G', 'enabled'], isDual5GEnabled)
    onTabChange('Normal24GHz')
  }

  const onLower5gTypeChange = (e: RadioChangeEvent) => {
    setIsLower5gInherit(e.target.value)
  }

  const onUpper5gTypeChange = (e: RadioChangeEvent) => {
    setIsUpper5gInherit(e.target.value)
  }

  const update5gData = (formData: ApGroupRadioCustomization) => {
    const { radioParams50G } = formData
    const curForm = formRef.current

    if (radioParams50G) {
      const combineChannels = radioParams50G.combineChannels
      const indoorChannels = curForm?.getFieldValue(['radioParams50G', 'allowedIndoorChannels'])
      const outdoorChannels = curForm?.getFieldValue(['radioParams50G', 'allowedOutdoorChannels'])

      //radioParams50G.allowedIndoorChannels = indoorChannels
      radioParams50G.allowedOutdoorChannels = (combineChannels)? indoorChannels : outdoorChannels
    }
  }

  const updateDual5gData = (formData: ApGroupRadioCustomization) => {
    const { radioParamsDual5G } = formData

    if (!radioParamsDual5G) {
      return
    }

    const { enabled: dual5gEnabled } = radioParamsDual5G
    const isSupportLower5G = bandwidthRadioOptions[ApRadioTypeEnum.RadioLower5G].length > 0
    const isSupportUpper5G = bandwidthRadioOptions[ApRadioTypeEnum.RadioUpper5G].length > 0

    if (!isSupportLower5G) {
      if (dual5gEnabled) {
        radioParamsDual5G.inheritParamsLower5G = false
      } else {
        delete radioParamsDual5G.inheritParamsLower5G
      }
      delete radioParamsDual5G.radioParamsLower5G
    }

    if (!isSupportUpper5G) {
      if (dual5gEnabled) {
        radioParamsDual5G.inheritParamsUpper5G = false
      } else {
        delete radioParamsDual5G.inheritParamsUpper5G
      }
      delete radioParamsDual5G.radioParamsUpper5G
    }
  }

  const update6gData = (formData: ApGroupRadioCustomization) => {
    const { radioParams6G } = formData
    const curForm = formRef.current

    if (!radioParams6G) {
      return
    }

    if (isSupport6GCountry) {
      if (is6gChannelSeparation) {
        radioParams6G.allowedIndoorChannels =
          curForm?.getFieldValue(['radioParams6G', 'allowedIndoorChannels'])
        radioParams6G.allowedOutdoorChannels =
          curForm?.getFieldValue(['radioParams6G', 'allowedOutdoorChannels'])
      } else {
        radioParams6G.allowedChannels = curForm?.getFieldValue(['radioParams6G', 'allowedChannels'])
      }
    } else {
      delete formData.radioParams6G
    }
  }

  const validateRadioChannels = ( data: ApGroupRadioCustomization ) => {
    const { radioParams24G, radioParams50G, radioParams6G, radioParamsDual5G } = data
    const validateChannels = (channels: unknown[] | undefined, method: ScanMethodEnum | undefined,
      title: string, dual5GName?: string) => {

      const content = dual5GName? ((method === ScanMethodEnum.MANUAL && isVenueChannelSelectionManualEnabled)?
        $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'The Radio {dual5GName} inherited the channel selection from the Radio 5 GHz that uses Manual channel selection.{br}Please select Custom Settings on {dual5GName} block with at least one channel' },
          { dual5GName, br: <br /> }
        ):
        $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'The Radio {dual5GName} inherited the channel selection from the Radio 5 GHz.{br}Please use Custom Settings and select at least two channels under the {dual5GName} block' },
          { dual5GName, br: <br /> }
        )): (method === ScanMethodEnum.MANUAL && isVenueChannelSelectionManualEnabled)?
        $t({ defaultMessage: 'Please select one channel' }):
        $t({ defaultMessage: 'Please select at least two channels' })
      if (Array.isArray(channels) && ((method === ScanMethodEnum.MANUAL && isVenueChannelSelectionManualEnabled)?(channels.length !== 1):(channels.length <2))) {
        showActionModal({
          type: 'error',
          title: title,
          content: content
        })
        return false
      }
      return true
    }

    const validate320MHzIsolatedGroup = (channels: unknown[] | undefined, title: string) => {
      const typeSafeChannels = channels as string[]
      const isolatedGroup = findIsolatedGroupByChannel(typeSafeChannels)
      if (isolatedGroup.length > 0) {
        showActionModal({
          type: 'error',
          title: title,
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'Please select two adjacent 160Mhz channels to combine one 320 MHz channel' })
        })
        return false
      }
      return true
    }

    const channel24 = radioParams24G?.allowedChannels
    const method24 = radioParams24G?.method
    const title24 = $t({ defaultMessage: '2.4 GHz - Channel selection' })
    if (!validateChannels(channel24, method24, title24)) return false

    const indoorChannel5 = radioParams50G?.allowedIndoorChannels
    const method5 = radioParams50G?.method
    const indoorTitle5 = $t({ defaultMessage: '5 GHz - Indoor AP channel selection' })
    if (!validateChannels(indoorChannel5, method5, indoorTitle5)) return false

    const outdoorChannel5 = radioParams50G?.allowedOutdoorChannels
    const outdoorTitle5 = $t({ defaultMessage: '5 GHz - Outdoor AP channel selection' })
    if (!validateChannels(outdoorChannel5, method5, outdoorTitle5)) return false

    const channelBandwidth6 = radioParams6G?.channelBandwidth
    const method6 = radioParams6G?.method
    const indoorChannel6 = is6gChannelSeparation ? radioParams6G?.allowedIndoorChannels : radioParams6G?.allowedChannels
    const indoorTitle6 = is6gChannelSeparation ? $t({ defaultMessage: '6 GHz - Indoor AP channel selection' }) :
      $t({ defaultMessage: '6 GHz - Channel selection' })
    if (!validateChannels(indoorChannel6, method6, indoorTitle6)) return false
    const outdoorChannel6 = is6gChannelSeparation ? radioParams6G?.allowedOutdoorChannels : undefined
    const outdoorTitle6 = is6gChannelSeparation ? $t({ defaultMessage: '6 GHz - Outdoor AP channel selection' }) :
      ''
    if (isVenueChannelSelectionManualEnabled) {
      const supportCh6G = supportRadioChannels[ApRadioTypeEnum.Radio6G]
      const isSupportOutdoor6G = !isEmpty(supportCh6G.outdoor)
      if (outdoorChannel6 && isSupportOutdoor6G && !validateChannels(outdoorChannel6, method6, outdoorTitle6)) return false
    } else {
      if (outdoorChannel6 && !validateChannels(outdoorChannel6, method6, outdoorTitle6)) return false
    }
    if (channelBandwidth6 === ChannelBandwidth6GEnum._320MHz){
      if (!validate320MHzIsolatedGroup(indoorChannel6, indoorTitle6)) return false
      if (outdoorChannel6 && !validate320MHzIsolatedGroup(outdoorChannel6, outdoorTitle6)) return false
    }

    const { radioParamsLower5G, radioParamsUpper5G,
      inheritParamsLower5G, inheritParamsUpper5G } = radioParamsDual5G || {}

    const supportLowerCh5G = supportRadioChannels[ApRadioTypeEnum.RadioLower5G] as ApGroupDefaultRegulatoryChannels['5GLowerChannels']
    const isSupportIndoorLower5G = Object.keys(supportLowerCh5G.indoor).length > 0
    const isSupportOutdoorLower5G = Object.keys(supportLowerCh5G.outdoor).length > 0

    const supportUpperCh5g = supportRadioChannels[ApRadioTypeEnum.RadioUpper5G] as ApGroupDefaultRegulatoryChannels['5GUpperChannels']
    const isSupportIndoorUpper5G = Object.keys(supportUpperCh5g.indoor).length > 0
    const isSupportOutdoorUpper5G = Object.keys(supportUpperCh5g.outdoor).length > 0

    let indoorLower5GChs, indoorUpper5GChs
    if (indoorChannel5) {
      const { lower5GChannels, upper5GChannels } = split5GChannels(indoorChannel5 as string[])
      indoorLower5GChs = isSupportIndoorLower5G? lower5GChannels : undefined
      indoorUpper5GChs = isSupportIndoorUpper5G? upper5GChannels : undefined
    }

    let outdoorLower5GChs, outdoorUpper5GChs
    if (outdoorChannel5) {
      const { lower5GChannels, upper5GChannels } = split5GChannels(outdoorChannel5 as string[])
      outdoorLower5GChs = isSupportOutdoorLower5G? lower5GChannels : undefined
      outdoorUpper5GChs = isSupportOutdoorUpper5G? upper5GChannels : undefined
    }

    const lower5GName = inheritParamsLower5G ? 'Lower 5 GHz' : undefined
    const lowerMethod5 = inheritParamsLower5G ? radioParams50G?.method : radioParamsLower5G?.method

    const indoorLowerChannel5 = inheritParamsLower5G
      ? indoorLower5GChs
      : radioParamsLower5G?.allowedIndoorChannels
    const indoorLowerTitle5 = inheritParamsLower5G
      ? $t({ defaultMessage: '5 GHz - Indoor AP channel selection' })
      : $t({ defaultMessage: 'Lower 5 GHz - Indoor AP channel selection' })
    if (!validateChannels(indoorLowerChannel5, lowerMethod5, indoorLowerTitle5, lower5GName)) return false

    const outdoorLowerChannel5 = inheritParamsLower5G
      ? outdoorLower5GChs
      : radioParamsLower5G?.allowedOutdoorChannels
    const outdoorLowerTitle5 = inheritParamsLower5G
      ? $t({ defaultMessage: '5 GHz - Outdoor AP channel selection' })
      : $t({ defaultMessage: 'Lower 5 GHz - Outdoor AP channel selection' })
    if (!validateChannels(outdoorLowerChannel5, lowerMethod5, outdoorLowerTitle5, lower5GName)) return false

    const upper5GName = inheritParamsUpper5G ? 'Upper 5 GHz' : undefined
    const upperMethod5 = inheritParamsUpper5G ? radioParams50G?.method : radioParamsUpper5G?.method

    const indoorUpperChannel5 = inheritParamsUpper5G
      ? indoorUpper5GChs
      : radioParamsUpper5G?.allowedIndoorChannels
    const indoorUpperTitle5 = inheritParamsUpper5G
      ? $t({ defaultMessage: '5 GHz - Indoor AP channel selection' })
      : $t({ defaultMessage: 'Upper 5 GHz - Indoor AP channel selection' })
    if (!validateChannels(indoorUpperChannel5, upperMethod5, indoorUpperTitle5, upper5GName)) return false

    const outdoorUpperChannel5 = inheritParamsUpper5G
      ? outdoorUpper5GChs
      : radioParamsUpper5G?.allowedOutdoorChannels
    const outdoorUpperTitle5 = inheritParamsUpper5G
      ? $t({ defaultMessage: '5 GHz - Outdoor AP channel selection' })
      : $t({ defaultMessage: 'Upper 5 GHz - Outdoor AP channel selection' })
    if (!validateChannels(outdoorUpperChannel5, upperMethod5, outdoorUpperTitle5, upper5GName)) return false

    return true
  }

  const validationFields = async () => {
    return await formRef?.current?.validateFields()
  }

  const handleUpdateRadioSettings = async (formData: ApGroupRadioCustomization) => {
    const d = formRef?.current?.getFieldsValue() || formData
    const data = { ...d }

    try {
      await validationFields() as any
    } catch (error: any) {
      showActionModal({
        type: 'error',
        width: 450,
        title: $t({ defaultMessage: 'You Have Invalid Changes' }),
        content: $t({ defaultMessage: 'You have invalid changes, please see technical detail for more information.' }),
        customContent: {
          action: 'SHOW_ERRORS',
          errorDetails: {
            error: flatten(error.errorFields.map((errorFields: any) => errorFields.errors[0])) as unknown as string
          }
        }
      })
      return
    }

    update5gData(data)
    const isTriBandRadioEnabled = isTriBandRadioRef.current

    if (isWifiSwitchableRfEnabled) {
      const hasDual5GBandMode = currentVenueBandModeData.filter(data => dual5gApModels.includes(data.model))
        .map(data => data.bandMode).some(bandMode => bandMode === BandModeEnum.DUAL)
      if (hasDual5GBandMode) {
        updateDual5gData(data)
      } else {
        delete data.radioParamsDual5G
      }
      if (isSupport6GCountry) {
        update6gData(data)
      } else {
        delete data.radioParams6G
      }
    } else if (isTriBandRadioEnabled) {
      updateDual5gData(data)
      update6gData(data)
    } else {
      delete data.radioParamsDual5G
      delete data.radioParams6G
    }

    if (!validateRadioChannels(data)) {
      return
    }

    try {
      if (isWifiSwitchableRfEnabled && !isEqual(currentVenueBandModeData, initVenueBandModeData)) {
        await updateVenueBandMode({
          params: { venueId },
          payload: currentVenueBandModeData
        }).unwrap()

      }

      if (!isWifiSwitchableRfEnabled) {
        await updateVenueTripleBandRadioSettings({
          params: { tenantId, venueId },
          payload: { enabled: isTriBandRadioEnabled }
        }).unwrap()
      }

      await updateApGroupRadioCustomization({
        params: { venueId, apGroupId },
        payload: {
          // TODO: When the API is ready, include additional fields in the payload as required.
          radioParams24G: {
            ...defaultRadioSettings?.radioParams24G,
            ...data.radioParams24G
          }
        },
        enableRbac: resolvedRbacEnabled
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscard = () => {
    setCurrentVenueBandModeData([ ...initVenueBandModeData ])
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

  const handleChange = () => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })

    setEditRadioContextData({
      ...editRadioContextData,
      radioData: formRef.current?.getFieldsValue(),
      updateWifiRadio: handleUpdateRadioSettings,
      discardWifiRadioChanges: handleDiscard
    })
  }

  const handleTriBandEnableChanged = (checked: boolean) => {
    setIsTriBandRadio(checked)
    isTriBandRadioRef.current = checked
    onTabChange('Normal24GHz')
    handleChange()
  }

  const displayVenueSettingOrApGroupAndCustomize = () => {
    const radioTypeKey = ApGroupRadioTypeDataKeyMap[currentTab as RadioType]
    return (
      <Row gutter={20}>
        <Col span={12}>
          <Space style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            paddingBottom: '20px' }}
          >
            <Form.Item
              name={[...radioTypeKey, 'useVenueSettings']}
              initialValue={true}
              valuePropName='value'
              style={{ marginBottom: '35px', width: '300px' }}
              children={
                <Radio.Group
                  data-testid='apGroup-radioSettings'
                  onChange={handleStateOfIsUseVenueOrApGroupSettingsChange}
                >
                  <Space direction='vertical'>
                    <Radio value={true} data-testid='apGroup-useVenueSettings'>
                      <FormattedMessage
                        defaultMessage={'Use inherited <radioTypeName></radioTypeName> settings from Venue'}
                        values={{
                          radioTypeName: () => getRadioTypeDisplayName(currentTab as RadioType)
                        }}
                      />
                    </Radio>
                    <Radio value={false} data-testid='apGroup-customize'>
                      <FormattedMessage
                        defaultMessage={'Customize <radioTypeName></radioTypeName> settings'}
                        values={{
                          radioTypeName: () => getRadioTypeDisplayName(currentTab as RadioType)
                        }}
                      />
                    </Radio>
                  </Space>
                </Radio.Group>
              }
            />
          </Space>
        </Col>
      </Row>
    )

  }

  const updateFormData = (data: ApGroupRadioCustomization) => {
    formRef?.current?.setFieldsValue(data)
  }

  const applyState = (state: StateOfIsUseVenueSettings, settings: ApGroupRadioCustomization): ApGroupRadioCustomization => {
    const cloneData = cloneDeep(settings)

    if (!isUndefined(cloneData) && !isUndefined(cloneData.radioParams24G)) {
      cloneData.radioParams24G.useVenueSettings = state.isUseVenueSettings24G
    }
    if (!isUndefined(cloneData) && !isUndefined(cloneData.radioParams50G)) {
      cloneData.radioParams50G.useVenueSettings = state.isUseVenueSettings5G
    }
    if (!isUndefined(cloneData) && !isUndefined(cloneData.radioParams6G)) {
      cloneData.radioParams6G.useVenueSettings = state.isUseVenueSettings6G
    }
    if (!isUndefined(cloneData) && !isUndefined(cloneData.radioParamsDual5G) && !isUndefined(cloneData.radioParamsDual5G.radioParamsLower5G)) {
      cloneData.radioParamsDual5G.radioParamsLower5G.useVenueSettings = state.isUseVenueSettingsLower5G
    }
    if (!isUndefined(cloneData) && !isUndefined(cloneData.radioParamsDual5G) && !isUndefined(cloneData.radioParamsDual5G.radioParamsUpper5G)) {
      cloneData.radioParamsDual5G.radioParamsUpper5G.useVenueSettings = state.isUseVenueSettingsUpper5G
    }

    return cloneData
  }

  const handleStateOfIsUseVenueOrApGroupSettingsChange = () => {
    // 1. set updatedState
    const updatedState = {
      ...toggleState(stateOfIsUseVenueSettings, currentTab as RadioType)
    }
    setStateOfIsUseVenueSettings(updatedState)

    const currentSettings = formRef?.current?.getFieldsValue()
    // 2. save cached if isUseVenue is true
    // (that means toggle radio settings from useCustomize to useVenue, therefore we save current customized settings to cache for restoring later)
    const isUseVenue= isCurrentTabUseVenueSettings(updatedState, currentTab as RadioType)
    if (isUseVenue) {
      cachedDataRef.current = createCacheSettings(currentSettings, cachedDataRef.current, currentTab as RadioType)
    }
    // 3. update data
    const useSettings = isUseVenue ? venueRef.current : cachedDataRef.current
    const updatedSettings = useSettings ? applySettings(currentSettings, useSettings, currentTab as RadioType) : undefined
    if (updatedSettings) {
      updateFormData(applyState(updatedState, updatedSettings))
    }
    // 4. set IsDual5gMode
    setIsDual5gMode((updatedSettings?.radioParamsDual5G?.enabled) || false)
    // 5. update EditContext
    handleChange()
  }

  return (
    <Loader states={[{
      isLoading: isLoadingVenueData || (isWifiSwitchableRfEnabled && (isLoadingSupportChannelsData || isLoadingTripleBandRadioSettingsData || isLoadingVenueBandModeData || isLoadingApGroupData)),
      isFetching: isUpdatingApGroupRadio || (isWifiSwitchableRfEnabled && isUpdatingVenueBandMode)
    }]}>
      <StepsFormLegacy
        formRef={formRef}
        onFormChange={handleChange}
      >
        <StepsFormLegacy.StepForm data-testid='radio-settings'>
          <Row gutter={20}>
            <Col span={14}>
              {!isWifiSwitchableRfEnabled &&
              <>
                {$t({ defaultMessage: 'Tri-band radio settings' })}
                <Switch
                  data-testid={'tri-band-switch'}
                  disabled={venueTriBandApModels.length > 0}
                  checked={isTriBandRadio}
                  defaultChecked={isTriBandRadio}
                  onClick={(checked, event) => {
                    event.stopPropagation()
                    handleTriBandEnableChanged(checked)
                  }}
                  style={{ marginLeft: '20px' }}
                />
                <Tooltip.Question
                  title={supportedApModelTooltip}
                  placement='bottom'
                />
              </>
              }
              {!isWifiSwitchableRfEnabled && isTriBandRadio &&
              <div style={{ marginTop: '1em' }}>
                <span>{$t({ defaultMessage: 'R760 radio bands management' })}</span>
                <Form.Item
                  name={['radioParamsDual5G', 'enabled']}
                  initialValue={true}
                >
                  <Radio.Group onChange={onTriBandTypeRadioChange}>
                    <Radio value={true}>
                      {$t({ defaultMessage: 'Split 5GHz into lower and upper bands' })}
                    </Radio>

                    <Radio value={false}>
                      {$t({ defaultMessage: 'Use 5 and 6 GHz bands' })}
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
              }
              {isWifiSwitchableRfEnabled &&
              <Form.Item
                name={['radioParamsDual5G', 'enabled']}
                initialValue={true}
                hidden
                children={<></>}
              />
              }
            </Col>
          </Row>
          <RadioLegends isTriBandRadio={isTriBandRadio} isDual5gMode={isDual5gMode} isSupport6GCountry={isSupport6GCountry} />
          <Tabs onChange={onTabChange}
            activeKey={currentTab}
            type='third'
          >
            <Tabs.TabPane key='Normal24GHz'
              tab={<RadioLabel style={{ width: '36px' }}>
                {$t({ defaultMessage: '2.4 GHz' })}</RadioLabel>}/>
            <Tabs.TabPane key='Normal5GHz'
              tab={<RadioLabel style={{ width: '36px' }}>
                {$t({ defaultMessage: '5 GHz' })}</RadioLabel>}/>
            {(isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) &&
              <Tabs.TabPane key='Normal6GHz'
                style={
                  { width: '50px' }
                }
                tab={<RadioLabel style={{ width: '60px' }}>
                  {$t({ defaultMessage: '6 GHz' })}
                  {isDual5gMode && !isWifiSwitchableRfEnabled &&
                    <Tooltip
                      placement='topRight'
                      title={$t({ defaultMessage: '6 GHz only supports R770 and R560.' })}
                    >
                      <QuestionMarkCircleOutlined
                        style={{ height: '16px' }} />
                    </Tooltip>}
                </RadioLabel>}/>
            }
            {(isTriBandRadio || isWifiSwitchableRfEnabled) && isDual5gMode && <>
              <Tabs.TabPane key='Lower5GHz'
                tab={<RadioLabel style={{ width: '100px' }}>
                  {$t({ defaultMessage: 'Lower 5 GHz' })}</RadioLabel>}/>
              <Tabs.TabPane key='Upper5GHz'
                tab={<RadioLabel style={{ width: '100px' }}>
                  {$t({ defaultMessage: 'Upper 5 GHz' })}</RadioLabel>}/>
            </>
            }
          </Tabs>
          {displayVenueSettingOrApGroupAndCustomize()}
          <SupportRadioChannelsContext.Provider value={{ supportRadioChannels, bandwidthRadioOptions }}>
            <div style={{ display: currentTab === 'Normal24GHz' ? 'block' : 'none' }}>
              <ApGroupSingleRadioSettings
                isEnabled={isEnable24g}
                testId='apgroup-radio-24g-tab'
                radioType={ApRadioTypeEnum.Radio24G}
                radioTypeName={getRadioTypeDisplayName(RadioType.Normal24GHz)}
                useVenueSettingsFieldName={['radioParams24G', 'useVenueSettings']}
                enabledFieldName={['radioParams24G', 'enabled']}
                onEnableChanged={handleEnableChanged}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Normal24GHz)}
              />
            </div>
            <div style={{ display: currentTab === 'Normal5GHz' ? 'block' : 'none' }}>
              <ApGroupSingleRadioSettings
                isEnabled={isEnable5g}
                testId='apgroup-radio-5g-tab'
                radioType={ApRadioTypeEnum.Radio5G}
                radioTypeName={getRadioTypeDisplayName(RadioType.Normal5GHz)}
                useVenueSettingsFieldName={['radioParams50G', 'useVenueSettings']}
                enabledFieldName={['radioParams50G', 'enabled']}
                onEnableChanged={handleEnableChanged}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Normal5GHz)}
              />
            </div>
            {(isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) &&
            <div style={{ display: (isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) &&
                  currentTab === 'Normal6GHz' ? 'block' : 'none' }}>
              <ApGroupSingleRadioSettings
                isEnabled={isEnable6g}
                testId='apgroup-radio-6g-tab'
                radioType={ApRadioTypeEnum.Radio6G}
                radioTypeName={getRadioTypeDisplayName(RadioType.Normal6GHz)}
                useVenueSettingsFieldName={['radioParams6G', 'useVenueSettings']}
                enabledFieldName={['radioParams6G', 'enabled']}
                onEnableChanged={handleEnableChanged}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Normal6GHz)}
              />
            </div>
            }
            {(isTriBandRadio || isWifiSwitchableRfEnabled) && isDual5gMode &&
            <>
              <div style={{
                display: (isTriBandRadio || isWifiSwitchableRfEnabled) && isDual5gMode &&
                  currentTab === 'Lower5GHz' ? 'block' : 'none'
              }}>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      label={$t({ defaultMessage: '5GHz settings:' })}
                      name={['radioParamsDual5G', 'inheritParamsLower5G']}
                    >
                      <Radio.Group defaultValue={true} onChange={onLower5gTypeChange}>
                        <Radio value={true}>
                          {$t({ defaultMessage: 'Inherit from 5GHz' })}
                        </Radio>

                        <Radio value={false}>
                          {$t({ defaultMessage: 'Custom Settings' })}
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Divider style={{ marginTop: '5px' }}/>
                  </Col>
                </Row>
                <ApGroupSingleRadioSettings
                  isEnabled={isEnableLower5g}
                  testId='apgroup-radio-l5g-tab'
                  inherit5G={isLower5gInherit}
                  radioType={ApRadioTypeEnum.RadioLower5G}
                  radioTypeName={getRadioTypeDisplayName(RadioType.Lower5GHz)}
                  useVenueSettingsFieldName={['radioParamsDual5G', 'radioParamsLower5G', 'useVenueSettings']}
                  enabledFieldName={['radioParamsDual5G', 'lower5gEnabled']}
                  onEnableChanged={handleEnableChanged}
                  disabled={!isAllowEdit}
                  handleChanged={handleChange}
                  isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Lower5GHz)}
                />
              </div>
              <div style={{
                display: (isTriBandRadio || isWifiSwitchableRfEnabled) && isDual5gMode &&
                  currentTab === 'Upper5GHz' ? 'block' : 'none'
              }}>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      label={$t({ defaultMessage: '5GHz settings:' })}
                      name={['radioParamsDual5G', 'inheritParamsUpper5G']}
                    >
                      <Radio.Group onChange={onUpper5gTypeChange}>
                        <Radio value={true}>
                          {$t({ defaultMessage: 'Inherit from 5GHz' })}
                        </Radio>

                        <Radio value={false}>
                          {$t({ defaultMessage: 'Custom Settings' })}
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Divider style={{ marginTop: '5px' }}/>
                  </Col>
                </Row>
                <ApGroupSingleRadioSettings
                  isEnabled={isEnableUpper5g}
                  testId='apgroup-radio-u5g-tab'
                  inherit5G={isUpper5gInherit}
                  radioType={ApRadioTypeEnum.RadioUpper5G}
                  radioTypeName={getRadioTypeDisplayName(RadioType.Upper5GHz)}
                  useVenueSettingsFieldName={['radioParamsDual5G', 'radioParamsUpper5G', 'useVenueSettings']}
                  enabledFieldName={['radioParamsDual5G', 'upper5gEnabled']}
                  onEnableChanged={handleEnableChanged}
                  disabled={!isAllowEdit}
                  handleChanged={handleChange}
                  isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Upper5GHz)}
                />
              </div>
            </>
            }
          </SupportRadioChannelsContext.Provider>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}
