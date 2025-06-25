/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  Col,
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
  flatten,
  cloneDeep,
  set, isUndefined
} from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  AnchorContext, Loader, showActionModal, StepsFormLegacy,
  StepsFormLegacyInstance, Tabs, Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                             from '@acx-ui/icons'
import {
  useGetVenueRadioCustomizationQuery,
  useUpdateVenueTripleBandRadioSettingsMutation,
  useGetVenueApModelBandModeSettingsQuery,
  useGetVenueTemplateTripleBandRadioSettingsQuery,
  useGetVenueTripleBandRadioSettingsQuery,
  useGetVenueTemplateRadioCustomizationQuery,
  useUpdateVenueTemplateTripleBandRadioSettingsMutation,
  useGetVenueTemplateApModelBandModeSettingsQuery,
  useLazyGetVenueRadioCustomizationQuery,
  useGetApGroupRadioCustomizationQuery,
  useUpdateApGroupRadioCustomizationMutation,
  useGetApGroupDefaultRegulatoryChannelsQuery,
  useGetApGroupApModelBandModeSettingsQuery,
  useUpdateApGroupApModelBandModeSettingsMutation
} from '@acx-ui/rc/services'
import {
  VenueRadioCustomization,
  BandModeEnum,
  VenueApModelBandModeSettings,
  TriBandSettings,
  useConfigTemplate,
  ApGroupApModelBandModeSettings,
  ApGroupDefaultRegulatoryChannels,
  useSupportedApModelTooltip,
  ApGroupRadioCustomization, ScanMethodEnum, ChannelBandwidth6GEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { BandManagement } from '../../BandManagement'
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
import {
  applySettings,
  convertVenueRadioSettingsToApGroupRadioSettings,
  createCacheApGroupSettings,
  handleDual5GBandModeSpecialCase,
  mergeRadioData,
  useVenueTriBandApModels
} from '../ApGroupUtils'
import { ApGroupEditContext }          from '../context'
import { ApGroupRadioConfigItemProps } from '../index'
import { RadioLabel }                  from '../styledComponents'

import { ApGroupSingleRadioSettings } from './ApGroupSingleRadioSettings'

const Radio24GAllowedChannels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
const Radio5GAllowedChannels = ['36', '40', '44', '48', '52', '56', '60', '64', '100', '104', '108', '112', '116', '120', '124', '128', '132', '136', '140', '144', '149', '153', '157', '161']
const RadioInner5GAllowedChannels = ['36', '40', '44', '48', '52', '56', '60' , '64']
const RadioUpper5GAllowedChannels = ['100', '104', '108', '112', '116', '120', '124', '128', '132', '136', '140', '144', '149', '153', '157', '161']
const Radio6GIndoorAllowedChannels = ['1', '5', '9', '13', '17', '21', '25', '29', '33', '37', '41', '45', '49', '53', '57', '61', '65', '69', '73', '77', '81', '85', '89', '93', '97', '101', '105', '109', '113', '117', '121', '125', '129', '133', '137', '141', '145', '149', '153', '157', '161', '165', '169', '173', '177', '181', '185', '189', '193', '197', '201', '205', '209', '213', '217', '221']
const Radio6GOutdoorAllowedChannels = ['1', '5', '9', '13', '17', '21', '25', '29', '33', '37', '41', '45', '49', '53', '57', '61', '65', '69', '73', '77', '81', '85', '89', '93', '129', '133', '137', '141', '145', '149', '153', '157']

const {
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  split5GChannels,
  SupportRadioChannelsContext
} = RadioSettingsContents

const {
  CorrectRadioChannels,
  GetSupportBandwidth,
  GetSupportIndoorOutdoorBandwidth
} = RadioSettingsUtils

export function RadioSettings (props: ApGroupRadioConfigItemProps) {
  const { $t } = useIntl()
  const { isAllowEdit=true } = props

  const wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)
  const ap70BetaFlag = useIsTierAllowed(TierFeatures.AP_70)
  const supportWifi7_320MHz = ap70BetaFlag && wifi7_320Mhz_FeatureFlag

  const isWifiSwitchableRfEnabled = useIsSplitOn(Features.WIFI_SWITCHABLE_RF_TOGGLE)

  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const is6gChannelSeparation = useIsSplitOn(Features.WIFI_6G_INDOOR_OUTDOOR_SEPARATION)
  const isVenueChannelSelectionManualEnabled = useIsSplitOn(Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseRbacApi

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
  const isDual5gModeRef = useRef<boolean>(true)
  const [isTriBandRadio, setIsTriBandRadio] = useState(false)
  const [isDual5gMode, setIsDual5gMode] = useState(true)

  const [isLower5gInherit, setIsLower5gInherit] = useState(true)
  const [isUpper5gInherit, setIsUpper5gInherit] = useState(true)

  const [isEnable24g, setIsEnable24g] = useState(true)
  const [isEnable5g, setIsEnable5g] = useState(true)
  const [isEnable6g, setIsEnable6g] = useState(true)
  const [isEnableLower5g, setIsEnableLower5g] = useState(true)
  const [isEnableUpper5g, setIsEnableUpper5g] = useState(true)

  const [initVenueBandModeData, setInitVenueBandModeData] = useState([] as VenueApModelBandModeSettings[])

  const [currentApGroupBandModeData, setCurrentApGroupBandModeData] = useState<ApGroupApModelBandModeSettings>({} as ApGroupApModelBandModeSettings)
  const [initApGroupBandModeData, setInitApGroupBandModeData] = useState<ApGroupApModelBandModeSettings>({} as ApGroupApModelBandModeSettings)

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
      extraParams: { venueId },
      skip: !venueId
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
      extraParams: { venueId, apGroupId },
      skip: !venueId
    })

  const { data: venueBandModeSavedData, isLoading: isLoadingVenueBandModeData } =
    useApGroupConfigTemplateQueryFnSwitcher<VenueApModelBandModeSettings[], void>({
      useQueryFn: useGetVenueApModelBandModeSettingsQuery,
      useTemplateQueryFn: useGetVenueTemplateApModelBandModeSettingsQuery,
      skip: !isWifiSwitchableRfEnabled,
      extraParams: { venueId }
    })

  const { data: apGroupBandModeSavedData, isLoading: isLoadingApGroupBandModeData } =
    useGetApGroupApModelBandModeSettingsQuery({
      params: { venueId, apGroupId },
      enableRbac: isUseRbacApi
    }, { skip: !venueId })

  const [ updateApGroupRadioCustomization, { isLoading: isUpdatingApGroupRadio } ] = useApGroupConfigTemplateMutationFnSwitcher(
    useUpdateApGroupRadioCustomizationMutation,
    useUpdateApGroupRadioCustomizationMutation
  )

  const [ updateVenueTripleBandRadioSettings ] = useApGroupConfigTemplateMutationFnSwitcher(
    useUpdateVenueTripleBandRadioSettingsMutation,
    useUpdateVenueTemplateTripleBandRadioSettingsMutation
  )

  const [getVenueCustomization] = useLazyGetVenueRadioCustomizationQuery()

  const [ updateVenueBandMode, { isLoading: isUpdatingVenueBandMode } ] =
    useApGroupConfigTemplateMutationFnSwitcher(
      useUpdateApGroupApModelBandModeSettingsMutation,
      useUpdateApGroupApModelBandModeSettingsMutation
    )

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
      const venueRadioData = (await getVenueCustomization({
        params: { venueId },
        enableRbac: isUseRbacApi,
        enableSeparation: is6gChannelSeparation
      }, true).unwrap())

      const apGroupVenueData = convertVenueRadioSettingsToApGroupRadioSettings(venueRadioData)
      venueRef.current = apGroupVenueData as ApGroupRadioCustomization
    }

    setData()
  }, [venueId, getVenueCustomization, venueData])

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

  const venueTriBandApModels = useVenueTriBandApModels(triBandApModels, venueId, tenantId)

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

    const setRadioFormData = (data: ApGroupRadioCustomization) => {
      // set EditRadioContext enableAfc false if AFC is not enable
      // Otherwise the data could be true and it will case backend throw error
      const isAFCEnabled = supportChannelsData?.afcEnabled
      if (!isAFCEnabled) {
        set(data, 'radioParams6G.enableAfc', false)
      }
      const { radioParams6G, radioParams24G, radioParams50G, radioParamsDual5G } = data
      if (radioParams24G) {
        const { channel, method } = radioParams24G
        if (channel && method === 'MANUAL') {
          set(data, 'radioParams24G.allowedChannels', [channel.toString()])
        }
      }
      if (radioParams50G) {
        const { indoorChannel, outdoorChannel, method } = radioParams50G
        if (indoorChannel && method === 'MANUAL') {
          set(data, 'radioParams50G.allowedIndoorChannels', [indoorChannel.toString()])
        }
        if (outdoorChannel && method === 'MANUAL') {
          set(data, 'radioParams50G.allowedOutdoorChannels', [outdoorChannel.toString()])
        }
      }
      if (radioParamsDual5G) {
        const { enabled, radioParamsLower5G, radioParamsUpper5G } = radioParamsDual5G
        if (enabled) {
          if (radioParamsLower5G) {
            const { indoorChannel, outdoorChannel, method } = radioParamsLower5G
            if (indoorChannel && method === 'MANUAL') {
              set(data, 'radioParamsDual5G.radioParamsLower5G.allowedIndoorChannels', [indoorChannel.toString()])
            }
            if (outdoorChannel && method === 'MANUAL') {
              set(data, 'radioParamsDual5G.radioParamsLower5G.allowedOutdoorChannels', [outdoorChannel.toString()])
            }
          }
          if (radioParamsUpper5G) {
            const { indoorChannel, outdoorChannel, method } = radioParamsUpper5G
            if (indoorChannel && method === 'MANUAL') {
              set(data, 'radioParamsDual5G.radioParamsUpper5G.allowedIndoorChannels', [indoorChannel.toString()])
            }
            if (outdoorChannel && method === 'MANUAL') {
              set(data, 'radioParamsDual5G.radioParamsUpper5G.allowedOutdoorChannels', [outdoorChannel.toString()])
            }
          }
        }
      }
      if (radioParams6G) {
        const { enableMulticastUplinkRateLimiting, enableMulticastDownlinkRateLimiting, indoorChannel, outdoorChannel, method } = radioParams6G
        if (enableMulticastUplinkRateLimiting || enableMulticastDownlinkRateLimiting) {
          set(data, 'radioParams6G.enableMulticastRateLimiting', true)
          if (enableMulticastUplinkRateLimiting) {
            set(data, 'radioParams6G.multicastUplinkRateLimiting', radioParams6G.multicastUplinkRateLimiting)
          }
          if (enableMulticastDownlinkRateLimiting) {
            set(data, 'radioParams6G.multicastDownlinkRateLimiting', radioParams6G.multicastDownlinkRateLimiting)
          }
        }

        if (indoorChannel && method === 'MANUAL') {
          set(data, 'radioParams6G.allowedIndoorChannels', [indoorChannel.toString()])
        }
        if (outdoorChannel && method === 'MANUAL') {
          set(data, 'radioParams6G.allowedOutdoorChannels', [outdoorChannel.toString()])
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

    if (!isLoadingVenueData && venueSavedChannelsData
      && !isLoadingApGroupData && apGroupRadioData
      && formRef?.current && supportRadioChannels) {
      const correctedData = correctApiRadioChannelData(venueSavedChannelsData)
      const correctedApGroupData = correctApiRadioChannelData(apGroupRadioData)
      const mergedData = mergeRadioData(correctedData, correctedApGroupData)
      setRadioFormData(mergedData)
      if (!defaultRadioSettings) setDefaultRadioSettings(mergedData)

      setStateOfIsUseVenueSettings({
        ...stateOfIsUseVenueSettings,
        isUseVenueSettings24G: !!apGroupRadioData.radioParams24G?.useVenueSettings,
        isUseVenueSettings5G: !!apGroupRadioData.radioParams50G?.useVenueSettings,
        isUseVenueSettingsLower5G: !!apGroupRadioData.radioParamsDual5G?.radioParamsLower5G?.useVenueSettings,
        isUseVenueSettingsUpper5G: !!apGroupRadioData.radioParamsDual5G?.radioParamsUpper5G?.useVenueSettings,
        isUseVenueSettings6G: !!apGroupRadioData.radioParams6G?.useVenueSettings
      })

      setReadyToScroll?.(r => [...(new Set(r.concat('Wi-Fi-Radio')))])
    }

  }, [isLoadingVenueData, venueSavedChannelsData, apGroupRadioData, formRef?.current, supportRadioChannels])

  useEffect(() => {
    if (!isWifiSwitchableRfEnabled || !apGroupBandModeSavedData || !venueBandModeSavedData || !venueSavedChannelsData) {
      return
    }

    // special case
    if (dual5gApModels.length > 0) {
      const dual5GData = venueSavedChannelsData.radioParamsDual5G

      const updatedApGroupBandModeSettings = handleDual5GBandModeSpecialCase(
        apGroupBandModeSavedData.apModelBandModeSettings,
        dual5gApModels,
        dual5GData
      )
      setInitApGroupBandModeData({
        useVenueSettings: apGroupBandModeSavedData.useVenueSettings,
        apModelBandModeSettings: updatedApGroupBandModeSettings
      })
      setCurrentApGroupBandModeData({
        useVenueSettings: apGroupBandModeSavedData.useVenueSettings,
        apModelBandModeSettings: [...updatedApGroupBandModeSettings]
      })

      const updatedVenueBandModeSettings = handleDual5GBandModeSpecialCase(
        venueBandModeSavedData,
        dual5gApModels,
        dual5GData
      )
      setInitVenueBandModeData([ ...updatedVenueBandModeSettings ])
    }

  }, [isWifiSwitchableRfEnabled, apGroupBandModeSavedData, venueBandModeSavedData, dual5gApModels, venueSavedChannelsData, venueTriBandApModels])

  useEffect(() => {
    if (!isWifiSwitchableRfEnabled) {
      return
    }

    let useVenueSettings = currentApGroupBandModeData.useVenueSettings
    formRef.current?.setFieldValue(['useVenueSettingsBandManagement'], useVenueSettings)
    const bandModeData = (useVenueSettings ? venueBandModeSavedData : currentApGroupBandModeData.apModelBandModeSettings) ?? []

    const isTriBandRadio = bandModeData.map(data => data.bandMode).some(bandMode => bandMode === BandModeEnum.TRIPLE) || false
    setIsTriBandRadio(isTriBandRadio)
    isTriBandRadioRef.current = isTriBandRadio
    if (!isTriBandRadio && currentTab === 'Normal6GHz') {
      onTabChange('Normal5GHz')
    }

    if (dual5gApModels.length > 0) {
      const isDual5GEnabled = bandModeData.filter(data => dual5gApModels.includes(data.model))
        .map(data => data.bandMode).some(bandMode => bandMode === BandModeEnum.DUAL)
      setIsDual5gMode(isDual5GEnabled)
      isDual5gModeRef.current = isDual5GEnabled
      formRef.current?.setFieldValue(['radioParamsDual5G', 'enabled'], isDual5GEnabled)
      if (!isDual5GEnabled && ['Lower5GHz', 'Upper5GHz'].includes(currentTab)) {
        onTabChange(isTriBandRadio ? 'Normal6GHz' : 'Normal5GHz')
      }
    }
    if (!isEqual(currentApGroupBandModeData, initApGroupBandModeData)) {
      handleChange()
    }

  }, [isWifiSwitchableRfEnabled, venueBandModeSavedData, currentApGroupBandModeData, initApGroupBandModeData, dual5gApModels])

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

  const handleUpdateRadioSettings = async () => {
    const d = formRef?.current?.getFieldsValue()
    const data = { ...d } as ApGroupRadioCustomization

    try {
      await formRef?.current?.validateFields()
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
      const hasDual5GBandMode = currentApGroupBandModeData.apModelBandModeSettings
        .filter(data => dual5gApModels.includes(data.model))
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
      if (isWifiSwitchableRfEnabled && !isEqual(currentApGroupBandModeData, initApGroupBandModeData)) {
        await updateVenueBandMode({
          params: { venueId, apGroupId },
          payload: currentApGroupBandModeData
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
          radioParams24G: {
            ...defaultRadioSettings?.radioParams24G,
            ...data.radioParams24G,
            ...(data.radioParams24G.method === 'MANUAL'
              ? {
                allowedChannels: Radio24GAllowedChannels,
                channel: data.radioParams24G.allowedChannels![0]
              }
              : {}
            )
          },
          radioParams5G: {
            ...defaultRadioSettings?.radioParams50G,
            ...data.radioParams50G,
            ...(data.radioParams50G.method === 'MANUAL' && data.radioParams50G.allowedIndoorChannels
              ? {
                allowedIndoorChannels: Radio5GAllowedChannels,
                indoorChannel: data.radioParams50G.allowedIndoorChannels[0]
              }
              : {}
            ),
            ...(data.radioParams50G.method === 'MANUAL' && data.radioParams50G.allowedOutdoorChannels
              ? {
                allowedOutdoorChannels: Radio5GAllowedChannels,
                outdoorChannel: data.radioParams50G.allowedOutdoorChannels[0]
              }
              : {}
            )
          },
          ...(isDual5gModeRef.current ? {
            radioParamsDual5G: {
              ...defaultRadioSettings?.radioParamsDual5G,
              ...data.radioParamsDual5G,
              ...(data.radioParamsDual5G?.radioParamsLower5G?.method === 'MANUAL' && data.radioParamsDual5G?.radioParamsLower5G?.allowedIndoorChannels
                ? {
                  allowedIndoorChannels: RadioInner5GAllowedChannels,
                  indoorChannel: data.radioParamsDual5G.radioParamsLower5G.allowedIndoorChannels[0]
                }
                : {}
              ),
              ...(data.radioParamsDual5G?.radioParamsUpper5G?.method === 'MANUAL' && data.radioParamsDual5G?.radioParamsUpper5G?.allowedIndoorChannels
                ? {
                  allowedIndoorChannels: RadioInner5GAllowedChannels,
                  indoorChannel: data.radioParamsDual5G.radioParamsUpper5G.allowedIndoorChannels[0]
                }
                : {}
              ),
              ...(data.radioParamsDual5G?.radioParamsLower5G?.method === 'MANUAL' && data.radioParamsDual5G?.radioParamsLower5G?.allowedOutdoorChannels
                ? {
                  allowedOutdoorChannels: RadioUpper5GAllowedChannels,
                  outdoorChannel: data.radioParamsDual5G.radioParamsLower5G.allowedOutdoorChannels[0]
                }
                : {}
              ),
              ...(data.radioParamsDual5G?.radioParamsUpper5G?.method === 'MANUAL' && data.radioParamsDual5G?.radioParamsUpper5G?.allowedOutdoorChannels
                ? {
                  allowedOutdoorChannels: RadioUpper5GAllowedChannels,
                  outdoorChannel: data.radioParamsDual5G.radioParamsUpper5G.allowedOutdoorChannels[0]
                }
                : {}
              )
            }
          } : {}),
          radioParams6G: {
            ...defaultRadioSettings?.radioParams6G,
            ...data.radioParams6G,
            ...(data.radioParams6G?.method === 'MANUAL' && data.radioParams6G?.allowedIndoorChannels
              ? {
                allowedIndoorChannels: Radio6GIndoorAllowedChannels,
                indoorChannel: data.radioParams6G.allowedIndoorChannels[0]
              }
              : {}
            ),
            ...(data.radioParams6G?.method === 'MANUAL' && data.radioParams6G?.allowedOutdoorChannels
              ? {
                allowedOutdoorChannels: Radio6GOutdoorAllowedChannels,
                outdoorChannel: data.radioParams6G.allowedOutdoorChannels[0]
              }
              : {}
            )
          }
        },
        enableRbac: resolvedRbacEnabled
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscard = () => {
    setCurrentApGroupBandModeData(initApGroupBandModeData)
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

  const displayVenueSettingOrApGroupAndCustomizeForBandManagement = () => {
    return (
      <Row gutter={20}>
        <Col span={12}>
          <Space style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            paddingBottom: '5px' }}
          >
            <Form.Item
              name={['useVenueSettingsBandManagement']}
              initialValue={currentApGroupBandModeData.useVenueSettings}
              valuePropName='value'
              style={{ marginBottom: '10px', width: '300px' }}
              children={
                <Radio.Group
                  onChange={(e) => {
                    setCurrentApGroupBandModeData( {
                      useVenueSettings: e.target.value,
                      apModelBandModeSettings: currentApGroupBandModeData.apModelBandModeSettings
                    } )}} >
                  <Space direction='vertical'>
                    <Radio value={true}>
                      <FormattedMessage defaultMessage={'Use inherited settings from <VenueSingular></VenueSingular>'} />
                    </Radio>
                    <Radio value={false}>
                      <FormattedMessage defaultMessage={'Customize settings'} />
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
                        defaultMessage={'Use inherited <radioTypeName></radioTypeName> settings from <VenueSingular></VenueSingular>'}
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
      cachedDataRef.current = createCacheApGroupSettings(currentSettings, cachedDataRef.current, currentTab as RadioType)
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
      isLoading: isLoadingVenueData || isLoadingApGroupData || (isWifiSwitchableRfEnabled && (isLoadingSupportChannelsData || isLoadingTripleBandRadioSettingsData || isLoadingVenueBandModeData || isLoadingApGroupBandModeData)),
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
              <>
                <Form.Item
                  name={['radioParamsDual5G', 'enabled']}
                  initialValue={true}
                  hidden
                  children={<></>}
                />
                <Row gutter={0} style={{ height: '40px' }}>
                  <Col span={8}>
                    {$t({ defaultMessage: 'Wi-Fi 6/7 band management:' })}
                  </Col>
                </Row>
                {displayVenueSettingOrApGroupAndCustomizeForBandManagement()}
                <BandManagement
                  showTitle={false}
                  style={{ paddingBottom: '5em' }}
                  disabled={!isAllowEdit || currentApGroupBandModeData.useVenueSettings}
                  dual5gApModels={dual5gApModels}
                  triBandApModels={triBandApModels}
                  bandModeCaps={bandModeCaps}
                  existingTriBandApModels={venueTriBandApModels}
                  currentBandModeData={(currentApGroupBandModeData.useVenueSettings)? initVenueBandModeData:currentApGroupBandModeData.apModelBandModeSettings ?? []}
                  setCurrentBandModeData={(currentBandData) => setCurrentApGroupBandModeData({ useVenueSettings: currentApGroupBandModeData.useVenueSettings, apModelBandModeSettings: currentBandData })} />
              </>
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
                disabled={!isAllowEdit || stateOfIsUseVenueSettings.isUseVenueSettings24G}
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
                disabled={!isAllowEdit || stateOfIsUseVenueSettings.isUseVenueSettings5G}
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
                disabled={!isAllowEdit || stateOfIsUseVenueSettings.isUseVenueSettings6G}
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
                <ApGroupSingleRadioSettings
                  isEnabled={isEnableLower5g}
                  testId='apgroup-radio-l5g-tab'
                  inherit5G={isLower5gInherit}
                  radioType={ApRadioTypeEnum.RadioLower5G}
                  radioTypeName={getRadioTypeDisplayName(RadioType.Lower5GHz)}
                  useVenueSettingsFieldName={['radioParamsDual5G', 'radioParamsLower5G', 'useVenueSettings']}
                  enabledFieldName={['radioParamsDual5G', 'lower5gEnabled']}
                  onEnableChanged={handleEnableChanged}
                  disabled={!isAllowEdit || stateOfIsUseVenueSettings.isUseVenueSettingsLower5G}
                  handleChanged={handleChange}
                  isUseVenueSettings={isCurrentTabUseVenueSettings(stateOfIsUseVenueSettings, RadioType.Lower5GHz)}
                />
              </div>
              <div style={{
                display: (isTriBandRadio || isWifiSwitchableRfEnabled) && isDual5gMode &&
                  currentTab === 'Upper5GHz' ? 'block' : 'none'
              }}>
                <ApGroupSingleRadioSettings
                  isEnabled={isEnableUpper5g}
                  testId='apgroup-radio-u5g-tab'
                  inherit5G={isUpper5gInherit}
                  radioType={ApRadioTypeEnum.RadioUpper5G}
                  radioTypeName={getRadioTypeDisplayName(RadioType.Upper5GHz)}
                  useVenueSettingsFieldName={['radioParamsDual5G', 'radioParamsUpper5G', 'useVenueSettings']}
                  enabledFieldName={['radioParamsDual5G', 'upper5gEnabled']}
                  onEnableChanged={handleEnableChanged}
                  disabled={!isAllowEdit || stateOfIsUseVenueSettings.isUseVenueSettingsUpper5G}
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
