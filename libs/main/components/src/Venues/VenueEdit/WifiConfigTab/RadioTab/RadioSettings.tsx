/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  Col,
  Divider,
  Form,
  Radio,
  RadioChangeEvent,
  Row,
  Switch
} from 'antd'
import {
  isEmpty,
  isEqual,
  dropRight,
  uniq,
  flatten,
  cloneDeep,
  set
} from 'lodash'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import {
  AnchorContext, Loader, showActionModal, StepsFormLegacy,
  StepsFormLegacyInstance, Tabs, Tooltip
} from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                             from '@acx-ui/icons'
import {
  SingleRadioSettings,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  ApRadioTypeEnum,
  split5GChannels,
  findIsolatedGroupByChannel,
  SupportRadioChannelsContext,
  CorrectRadioChannels,
  GetSupportBandwidth,
  GetSupportIndoorOutdoorBandwidth,
  RadioLegends,
  BandManagement
} from '@acx-ui/rc/components'
import {
  useLazyApListQuery,
  useGetDefaultRadioCustomizationQuery,
  useVenueDefaultRegulatoryChannelsQuery,
  useGetVenueRadioCustomizationQuery,
  useUpdateVenueRadioCustomizationMutation,
  useUpdateVenueTripleBandRadioSettingsMutation,
  useGetVenueApModelBandModeSettingsQuery,
  useUpdateVenueApModelBandModeSettingsMutation,
  useGetVenueTemplateTripleBandRadioSettingsQuery,
  useGetVenueTripleBandRadioSettingsQuery,
  useGetVenueTemplateDefaultRegulatoryChannelsQuery,
  useGetVenueTemplateDefaultRadioCustomizationQuery,
  useGetVenueTemplateRadioCustomizationQuery,
  useUpdateVenueTemplateRadioCustomizationMutation,
  useUpdateVenueTemplateTripleBandRadioSettingsMutation,
  useGetVenueTemplateApModelBandModeSettingsQuery,
  useUpdateVenueTemplateApModelBandModeSettingsMutation
} from '@acx-ui/rc/services'
import {
  APExtended,
  VenueRadioCustomization,
  ChannelBandwidth6GEnum,
  BandModeEnum,
  VenueApModelBandModeSettings,
  TriBandSettings,
  VenueDefaultRegulatoryChannels,
  useConfigTemplate,
  ScanMethodEnum,
  useSupportedApModelTooltip
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { VenueUtilityContext }                        from '..'
import { VenueEditContext, VenueWifiConfigItemProps } from '../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../venueConfigTemplateApiSwitcher'


const RadioLable = styled.div`
  display: flex;
  justify-content: center;
`

export function RadioSettings (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { isAllowEdit=true } = props

  const wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)
  const ap70BetaFlag = useIsTierAllowed(TierFeatures.AP_70)
  const supportWifi7_320MHz = ap70BetaFlag && wifi7_320Mhz_FeatureFlag

  const afcFeatureflag = get('AFC_FEATURE_ENABLED').toLowerCase() === 'true'
  const isWifiSwitchableRfEnabled = useIsSplitOn(Features.WIFI_SWITCHABLE_RF_TOGGLE)

  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const is6gChannelSeparation = useIsSplitOn(Features.WIFI_6G_INDOOR_OUTDOOR_SEPARATION)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseRbacApi
  const isVenueChannelSelectionManualEnabled = useIsSplitOn(Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const { tenantId, venueId, wifiRadioTab } = useParams()

  const formRef = useRef<StepsFormLegacyInstance<VenueRadioCustomization>>()
  const isTriBandRadioRef = useRef<boolean>(false)
  const [isTriBandRadio, setIsTriBandRadio] = useState(false)
  const [isDual5gMode, setIsDual5gMode] = useState(true)

  const [isLower5gInherit, setIsLower5gInherit] = useState(true)
  const [isUpper5gInherit, setIsUpper5gInherit] = useState(true)

  const [venueTriBandApModels, setVenueTriBandApModels] = useState<string[]>([])

  const [currentVenueBandModeData, setCurrentVenueBandModeData] = useState([] as VenueApModelBandModeSettings[])
  const [initVenueBandModeData, setInitVenueBandModeData] = useState([] as VenueApModelBandModeSettings[])

  const { venueApCaps, isLoadingVenueApCaps } = useContext(VenueUtilityContext)

  const { data: tripleBandRadioSettingsData, isLoading: isLoadingTripleBandRadioSettingsData } =
    useVenueConfigTemplateQueryFnSwitcher<TriBandSettings>({
      useQueryFn: useGetVenueTripleBandRadioSettingsQuery,
      useTemplateQueryFn: useGetVenueTemplateTripleBandRadioSettingsQuery,
      skip: resolvedRbacEnabled
    })

  // available channels from this venue country code
  const { data: supportChannelsData, isLoading: isLoadingSupportChannelsData } =
    useVenueConfigTemplateQueryFnSwitcher<VenueDefaultRegulatoryChannels>({
      useQueryFn: useVenueDefaultRegulatoryChannelsQuery,
      useTemplateQueryFn: useGetVenueTemplateDefaultRegulatoryChannelsQuery,
      enableRbac: isUseRbacApi,
      extraQueryArgs: {
        enableSeparation: is6gChannelSeparation
      }
    })

  // default radio data
  const { data: defaultRadioSettingsData, isLoading: isLoadingDefaultRadioSettingsData } =
    useVenueConfigTemplateQueryFnSwitcher<VenueRadioCustomization>({
      useQueryFn: useGetDefaultRadioCustomizationQuery,
      useTemplateQueryFn: useGetVenueTemplateDefaultRadioCustomizationQuery,
      enableRbac: isUseRbacApi,
      extraQueryArgs: {
        enableSeparation: is6gChannelSeparation
      }
    })

  // Custom radio data
  const { data: venueSavedChannelsData, isLoading: isLoadingVenueData } =
    useVenueConfigTemplateQueryFnSwitcher<VenueRadioCustomization>({
      useQueryFn: useGetVenueRadioCustomizationQuery,
      useTemplateQueryFn: useGetVenueTemplateRadioCustomizationQuery,
      enableRbac: isUseRbacApi,
      extraQueryArgs: {
        enableSeparation: is6gChannelSeparation
      }
    })

  const [ updateVenueRadioCustomization, { isLoading: isUpdatingVenueRadio } ] = useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueRadioCustomizationMutation,
    useUpdateVenueTemplateRadioCustomizationMutation
  )

  const [ updateVenueTripleBandRadioSettings ] = useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueTripleBandRadioSettingsMutation,
    useUpdateVenueTemplateTripleBandRadioSettingsMutation
  )

  const { data: venueBandModeSavedData, isLoading: isLoadingVenueBandModeData } =
    useVenueConfigTemplateQueryFnSwitcher<VenueApModelBandModeSettings[], void>({
      useQueryFn: useGetVenueApModelBandModeSettingsQuery,
      useTemplateQueryFn: useGetVenueTemplateApModelBandModeSettingsQuery,
      skip: !isWifiSwitchableRfEnabled
    })

  const [ updateVenueBandMode, { isLoading: isUpdatingVenueBandMode } ] =
    useVenueConfigTemplateMutationFnSwitcher(
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


  const afcProps = useMemo(() => {
    return {
      featureFlag: afcFeatureflag,
      isAFCEnabled: supportChannelsData?.afcEnabled,
      afcInfo: undefined
    }
  }, [supportChannelsData, afcFeatureflag])

  const supportedApModelTooltip = useSupportedApModelTooltip()

  const { triBandApModels, dual5gApModels, bandModeCaps } = useMemo(() => {
    if (venueApCaps) {
      const apModels = venueApCaps.apModels
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

  }, [venueApCaps])

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

    if (apList) {
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
  }, [triBandApModels])

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
    const correctApiRadioChannelData = (apiData: VenueRadioCustomization) => {
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

    const setRadioFormData = (data: VenueRadioCustomization) => {
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

    if (!isLoadingVenueData && venueSavedChannelsData && formRef?.current && supportRadioChannels) {
      const correctedData = correctApiRadioChannelData(venueSavedChannelsData)
      setRadioFormData(correctedData)

      setReadyToScroll?.(r => [...(new Set(r.concat('Wi-Fi-Radio')))])
    }
  }, [isLoadingVenueData, venueSavedChannelsData, formRef?.current, supportRadioChannels])

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
    if (wifiRadioTab) {
      onTabChange(wifiRadioTab)
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

  const update5gData = (formData: VenueRadioCustomization) => {
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

  const updateDual5gData = (formData: VenueRadioCustomization) => {
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

  const update6gData = (formData: VenueRadioCustomization) => {
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

  const validateRadioChannels = ( data: VenueRadioCustomization ) => {
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

    const supportLowerCh5G = supportRadioChannels[ApRadioTypeEnum.RadioLower5G] as VenueDefaultRegulatoryChannels['5GLowerChannels']
    const isSupportIndoorLower5G = Object.keys(supportLowerCh5G.indoor).length > 0
    const isSupportOutdoorLower5G = Object.keys(supportLowerCh5G.outdoor).length > 0

    const supportUpperCh5g = supportRadioChannels[ApRadioTypeEnum.RadioUpper5G] as VenueDefaultRegulatoryChannels['5GUpperChannels']
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

  const handleUpdateRadioSettings = async (formData: VenueRadioCustomization) => {
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

      await updateVenueRadioCustomization({
        params: { tenantId, venueId },
        payload: data,
        enableRbac: resolvedRbacEnabled,
        enableSeparation: is6gChannelSeparation
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDiscard = () => {
    setCurrentVenueBandModeData([ ...initVenueBandModeData ])
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

  const handleResetDefaultSettings = (radioType: ApRadioTypeEnum) => {
    let currentData = formRef.current?.getFieldsValue()
    let defaultRadioData

    if (!defaultRadioSettingsData || !currentData) {
      return
    }

    switch (radioType) {
      case ApRadioTypeEnum.Radio24G:
        defaultRadioData = defaultRadioSettingsData.radioParams24G
        if (defaultRadioData) {
          currentData.radioParams24G = defaultRadioData
          formRef.current?.setFieldsValue(currentData)
          handleChange()
        }
        break
      case ApRadioTypeEnum.Radio5G:
        defaultRadioData = defaultRadioSettingsData.radioParams50G
        if (defaultRadioData) {
          currentData.radioParams50G = defaultRadioData
          formRef.current?.setFieldsValue(currentData)
          handleChange()
        }
        break
      case ApRadioTypeEnum.Radio6G:
        defaultRadioData = defaultRadioSettingsData.radioParams6G
        if (defaultRadioData) {
          currentData.radioParams6G = defaultRadioData
          formRef.current?.setFieldsValue(currentData)
          handleChange()
        }
        break
      case ApRadioTypeEnum.RadioLower5G:
        defaultRadioData = defaultRadioSettingsData.radioParamsDual5G?.radioParamsLower5G
        if (defaultRadioData && currentData.radioParamsDual5G) {
          currentData.radioParamsDual5G.radioParamsLower5G = defaultRadioData
          formRef.current?.setFieldsValue(currentData)
          handleChange()
        }
        break
      case ApRadioTypeEnum.RadioUpper5G:
        defaultRadioData = defaultRadioSettingsData.radioParamsDual5G?.radioParamsUpper5G
        if (defaultRadioData && currentData.radioParamsDual5G) {
          currentData.radioParamsDual5G.radioParamsUpper5G = defaultRadioData
          formRef.current?.setFieldsValue(currentData)
          handleChange()
        }
        break
      default:
        return
    }
  }

  return (
    <Loader states={[{
      isLoading: isLoadingVenueData || (isWifiSwitchableRfEnabled && (isLoadingVenueApCaps || isLoadingSupportChannelsData || isLoadingDefaultRadioSettingsData || isLoadingTripleBandRadioSettingsData || isLoadingVenueBandModeData)),
      isFetching: isUpdatingVenueRadio || (isWifiSwitchableRfEnabled && isUpdatingVenueBandMode)
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
                <BandManagement style={{ paddingBottom: '5em' }}
                  disabled={!isAllowEdit}
                  triBandApModels={triBandApModels}
                  dual5gApModels={dual5gApModels}
                  bandModeCaps={bandModeCaps}
                  existingTriBandApModels={venueTriBandApModels}
                  currentBandModeData={currentVenueBandModeData}
                  setCurrentBandModeData={setCurrentVenueBandModeData} />
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
              tab={<RadioLable style={{ width: '36px' }}>
                {$t({ defaultMessage: '2.4 GHz' })}</RadioLable>}/>
            <Tabs.TabPane key='Normal5GHz'
              tab={<RadioLable style={{ width: '36px' }}>
                {$t({ defaultMessage: '5 GHz' })}</RadioLable>}/>
            {(isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) &&
              <Tabs.TabPane key='Normal6GHz'
                style={
                  { width: '50px' }
                }
                tab={<RadioLable style={{ width: '60px' }}>
                  {$t({ defaultMessage: '6 GHz' })}
                  {isDual5gMode && !isWifiSwitchableRfEnabled &&
                    <Tooltip
                      placement='topRight'
                      title={$t({ defaultMessage: '6 GHz only supports R770 and R560.' })}
                    >
                      <QuestionMarkCircleOutlined
                        style={{ height: '16px' }} />
                    </Tooltip>}
                </RadioLable>}/>
            }
            {(isTriBandRadio || isWifiSwitchableRfEnabled) && isDual5gMode && <>
              <Tabs.TabPane key='Lower5GHz'
                tab={<RadioLable style={{ width: '100px' }}>
                  {$t({ defaultMessage: 'Lower 5 GHz' })}</RadioLable>}/>
              <Tabs.TabPane key='Upper5GHz'
                tab={<RadioLable style={{ width: '100px' }}>
                  {$t({ defaultMessage: 'Upper 5 GHz' })}</RadioLable>}/>
            </>
            }
          </Tabs>
          <SupportRadioChannelsContext.Provider value={{ supportRadioChannels, bandwidthRadioOptions }}>
            <div style={{ display: currentTab === 'Normal24GHz' ? 'block' : 'none' }}>
              <SingleRadioSettings
                testId='radio-24g-tab'
                radioType={ApRadioTypeEnum.Radio24G}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                onResetDefaultValue={handleResetDefaultSettings} />
            </div>
            <div style={{ display: currentTab === 'Normal5GHz' ? 'block' : 'none' }}>
              <SingleRadioSettings
                testId='radio-5g-tab'
                radioType={ApRadioTypeEnum.Radio5G}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                onResetDefaultValue={handleResetDefaultSettings} />
            </div>
            {(isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) &&
            <div style={{ display: (isTriBandRadio || (isWifiSwitchableRfEnabled && isSupport6GCountry)) &&
                  currentTab === 'Normal6GHz' ? 'block' : 'none' }}>
              <SingleRadioSettings
                testId='radio-6g-tab'
                radioType={ApRadioTypeEnum.Radio6G}
                disabled={!isAllowEdit}
                handleChanged={handleChange}
                onResetDefaultValue={handleResetDefaultSettings}
                afcProps={afcProps} />
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
                <SingleRadioSettings
                  testId='radio-l5g-tab'
                  inherit5G={isLower5gInherit}
                  radioType={ApRadioTypeEnum.RadioLower5G}
                  disabled={!isAllowEdit}
                  handleChanged={handleChange}
                  onResetDefaultValue={handleResetDefaultSettings} />
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
                <SingleRadioSettings
                  testId='radio-u5g-tab'
                  inherit5G={isUpper5gInherit}
                  radioType={ApRadioTypeEnum.RadioUpper5G}
                  disabled={!isAllowEdit}
                  handleChanged={handleChange}
                  onResetDefaultValue={handleResetDefaultSettings} />
              </div>
            </>
            }
          </SupportRadioChannelsContext.Provider>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}
