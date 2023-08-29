/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { cloneDeep, includes, isEmpty, dropRight }        from 'lodash'
import { FormattedMessage, useIntl }                      from 'react-intl'

import { Button, Loader, showActionModal, StepsFormLegacy, StepsFormLegacyInstance, Tabs, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                   from '@acx-ui/feature-toggle'
import {
  ApRadioTypeEnum,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  SelectItemOption,
  findIsolatedGroupByChannel } from '@acx-ui/rc/components'
import {
  useGetApRadioCustomizationQuery,
  useUpdateApRadioCustomizationMutation,
  useDeleteApRadioCustomizationMutation,
  useGetApValidChannelQuery,
  useLazyGetVenueQuery,
  useLazyGetVenueRadioCustomizationQuery
} from '@acx-ui/rc/services'
import {
  ApRadioCustomization,
  ApRadioParamsDual5G,
  VenueExtended,
  VenueRadioCustomization,
  ChannelBandwidth6GEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext } from '../..'

import { ApSingleRadioSettings } from './ApSingleRadioSettings'


export function RadioSettings () {
  const { $t } = useIntl()

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(ApEditContext)

  const wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)

  const { apData, apCapabilities } = useContext(ApDataContext)

  const { tenantId, serialNumber } = useParams()
  const getApAvailableChannels = useGetApValidChannelQuery({ params: { tenantId, serialNumber } })

  const formRef = useRef<StepsFormLegacyInstance<ApRadioCustomization>>()
  const venueRef = useRef<ApRadioCustomization>()
  const currentRef = useRef<ApRadioCustomization>()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [isUseVenueSettings, setIsUseVenueSettings] = useState(false)
  const [isEnable24g, setIsEnable24g] = useState(true)
  const [isEnable5g, setIsEnable5g] = useState(true)
  const [isEnable6g, setIsEnable6g] = useState(true)
  const [isEnableLower5g, setIsEnableLower5g] = useState(true)
  const [isEnableUpper5g, setIsEnableUpper5g] = useState(true)

  const [apModelType, setApModelType] = useState('indoor')
  const [venue, setVenue] = useState({} as VenueExtended)

  const [isSupportTriBandRadioAp, setIsSupportTriBandRadioAp] = useState(false)
  const [isSupportDual5GAp, setIsSupportDual5GAp] = useState(false)
  const [isDual5gMode, setIsDual5gMode] = useState(false)

  const [support24GChannels, setSupport24GChannels] = useState<any>({})
  const [support5GChannels, setSupport5GChannels] = useState<any>({})
  const [support6GChannels, setSupport6GChannels] = useState<any>({})
  const [supportLower5GChannels, setSupportLower5GChannels] = useState<any>({})
  const [supportUpper5GChannels, setSupportUpper5GChannels] = useState<any>({})

  const [supportDfsChannels, setSupportDfsChannels] = useState<any>({})
  const [supportLowerDfsChannels, setSupportLowerDfsChannels] = useState<any>({})
  const [supportUpperDfsChannels, setSupportUpperDfsChannels] = useState<any>({})

  const [bandwidth24GOptions, setBandwidth24GOptions] = useState<SelectItemOption[]>([])
  const [bandwidth5GOptions, setBandwidth5GOptions] = useState<SelectItemOption[]>([])
  const [bandwidth6GOptions, setBandwidth6GOptions] = useState<SelectItemOption[]>([])
  const [bandwidthLower5GOptions, setBandwidthLower5GOptions] = useState<SelectItemOption[]>([])
  const [bandwidthUpper5GOptions, setBandwidthUpper5GOptions] = useState<SelectItemOption[]>([])

  const [initData, setInitData] = useState({} as ApRadioCustomization)
  const [formInitializing, setFormInitializing] = useState(true)
  const [apDataLoaded, setApDataLoaded] = useState(false)


  const { data: apRadioSavedData } =
    useGetApRadioCustomizationQuery({ params: { tenantId, serialNumber } })

  const [ updateApRadio, { isLoading: isUpdatingApRadio } ] =
    useUpdateApRadioCustomizationMutation()

  const [ deleteApRadio, { isLoading: isDeletingApRadio } ] =
    useDeleteApRadioCustomizationMutation()

  const [getVenue] = useLazyGetVenueQuery()
  const [getVenueCustomization] = useLazyGetVenueRadioCustomizationQuery()

  const getSupportBandwidth = (bandwidthOptions: SelectItemOption[],
    availableChannels: any, isSupport160Mhz = false, isSupport320Mhz = false) => {
    const bandwidthList = Object.keys(availableChannels)
    return bandwidthOptions.filter((option: SelectItemOption) => {
      const bandwidth = (option.value === 'AUTO') ? 'auto' : option.value

      if (bandwidth === '160MHz') {
        return isSupport160Mhz && includes(bandwidthList, bandwidth)
      }

      if (bandwidth === '320MHz') {
        return isSupport320Mhz && includes(bandwidthList, bandwidth)
      }

      return includes(bandwidthList, bandwidth)
    })
  }

  const isSupportDual5G = () => {
    return (isSupportDual5GAp &&
           bandwidthLower5GOptions.length > 0 &&
           bandwidthUpper5GOptions.length > 0)
  }

  useEffect(() => {
    const availableChannels = getApAvailableChannels.data

    if (!apDataLoaded && apData && apCapabilities && availableChannels) {
      const setData = async () => {
        const { has160MHzChannelBandwidth = false,
          maxChannelization5G = 160,
          maxChannelization6G = 160,
          supportTriRadio = false,
          supportDual5gMode = false,
          isOutdoor = false } = apCapabilities || {}

        const apType = (isOutdoor)? 'outdoor' : 'indoor'

        setApModelType(apType)
        const is5GHas160Mhz = (has160MHzChannelBandwidth && maxChannelization5G >= 160)
        const is6GHas160Mhz = (has160MHzChannelBandwidth && maxChannelization6G >= 160)
        const is6GHas320Mhz = maxChannelization6G >= 320


        setIsSupportTriBandRadioAp(supportTriRadio)
        setIsSupportDual5GAp(supportTriRadio && supportDual5gMode)

        // 2.4G
        const supportCh24g = availableChannels['2.4GChannels'] || {}
        const bandwidth24G = getSupportBandwidth(channelBandwidth24GOptions, supportCh24g)
        setSupport24GChannels(supportCh24g)
        setBandwidth24GOptions(bandwidth24G)

        // 5G
        const availableCh5g = availableChannels['5GChannels']
        const supportCh5g = (availableCh5g && availableCh5g[apType]) || {}
        const bandwidth5g = getSupportBandwidth(channelBandwidth5GOptions, supportCh5g, is5GHas160Mhz)
        setSupport5GChannels(supportCh5g)
        setSupportDfsChannels((availableCh5g && availableCh5g.dfs) || {})
        setBandwidth5GOptions(bandwidth5g)

        // dual 5g - lower
        const availableChLower5g = availableChannels['5GLowerChannels']
        const supportChLower5g = (availableChLower5g && availableChLower5g[apType]) || {}
        const bandwidthLower5g = getSupportBandwidth(channelBandwidth5GOptions, supportChLower5g, is5GHas160Mhz)
        setSupportLower5GChannels(supportChLower5g)
        setSupportLowerDfsChannels((availableChLower5g && availableChLower5g.dfs) || {})
        setBandwidthLower5GOptions(bandwidthLower5g)

        // dual 5g - Upper
        const availableChUpper5g = availableChannels['5GUpperChannels']
        const supportChUpper5g = (availableChUpper5g && availableChUpper5g[apType]) || {}
        const bandwidthUpper5g = getSupportBandwidth(channelBandwidth5GOptions, supportChUpper5g, is5GHas160Mhz)
        setSupportUpper5GChannels(supportChUpper5g)
        setSupportUpperDfsChannels((availableChUpper5g && availableChUpper5g.dfs) || {})
        setBandwidthUpper5GOptions(bandwidthUpper5g)

        // 6G
        const supportCh6g = availableChannels['6GChannels'] || {}
        const wifi7_320Bandwidth = wifi7_320Mhz_FeatureFlag ? channelBandwidth6GOptions : dropRight(channelBandwidth6GOptions)

        const bandwidth6g = getSupportBandwidth(wifi7_320Bandwidth, supportCh6g, is6GHas160Mhz, is6GHas320Mhz)
        setSupport6GChannels(supportCh6g)
        setBandwidth6GOptions(bandwidth6g)

        const apVenue = (await getVenue({
          params: { tenantId, venueId: apData?.venueId } }, true).unwrap())

        setVenue(apVenue)
        setApDataLoaded(true)
      }

      setData()
    }
  }, [apData, apCapabilities, getApAvailableChannels, apDataLoaded])

  useEffect(() => {
    if (isEmpty(venue)) {
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

        const {
          radioParams24G: venueRadioParams24G,
          radioParams50G,
          radioParamsDual5G,
          radioParams6G: venueRadioParams6G } = data

        const venueRadioParams50G = getVenue5GRadioSetting(radioParams50G)
        const venueRadioParamsUpper5G = getVenue5GRadioSetting(radioParamsDual5G?.radioParamsUpper5G)
        const venueRadioParamsLower5G = getVenue5GRadioSetting(radioParamsDual5G?.radioParamsLower5G)
        const venueRadioParamsDual5G = (venueRadioParamsUpper5G || venueRadioParamsLower5G)? new ApRadioParamsDual5G() : undefined

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
          apRadioParams6G: venueRadioParams6G,
          useVenueSettings: true
        }
      }

      const venueRadioData = (await getVenueCustomization({
        params: { tenantId, venueId: venue.id } }, true).unwrap())
      const apVenueData = convertVenueRadioSetingsToApRadioSettings(venueRadioData)
      venueRef.current = apVenueData
    }

    setData()

  }, [isSupportDual5GAp, venue, apModelType, getVenueCustomization, tenantId])

  const updateFormData = (data: ApRadioCustomization) => {
    formRef?.current?.setFieldsValue(data)
  }

  useEffect(() => {
    if (apRadioSavedData){
      const apRadioData = cloneDeep(apRadioSavedData)
      const updateRadioFormData = (radioParams: any) => {
        if (!radioParams) {
          return
        }

        const { method, manualChannel } = radioParams
        if (method === 'MANUAL') {
          radioParams.allowedChannels = [manualChannel.toString()]
        }
      }

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

      currentRef.current = apRadioData

      setInitData(apRadioData)
      setFormInitializing(false)
    }
  }, [apRadioSavedData])

  useEffect(() => {
    if (!isEmpty(initData)) {
      const apRadioData = { ...initData }
      const {
        apRadioParamsDual5G,
        enable24G = false,
        enable50G = false,
        enable6G = false
      } = apRadioData

      setIsEnable24g(enable24G)
      setIsEnable5g(enable50G)
      setIsEnable6g(enable6G)

      const supportDual5G = isSupportDual5G()
      const {
        lower5gEnabled = false,
        upper5gEnabled = false
      } = apRadioParamsDual5G || {}

      setIsEnableLower5g(supportDual5G && lower5gEnabled)
      setIsEnableUpper5g(supportDual5G && upper5gEnabled)

      setIsDual5gMode((supportDual5G && apRadioData.apRadioParamsDual5G?.enabled) || false)
      setIsUseVenueSettings(apRadioData.useVenueSettings || false)
      isUseVenueSettingsRef.current = (apRadioData.useVenueSettings || false)
    }

  }, [initData, isSupportDual5GAp, bandwidthLower5GOptions, bandwidthUpper5GOptions])

  const [currentTab, setCurrentTab] = useState('Normal24GHz')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const handleEnableChanged = (value: boolean, fieldName: string) => {
    switch(fieldName) {
      case 'enable24G':
        setIsEnable24g(value)
        break
      case 'enable5G':
        setIsEnable5g(value)
        break
      case 'enable6G':
        setIsEnable6g(value)
        break
      case 'enableLower5G':
        setIsEnableLower5g(value)
        break
      case 'enableUpper5G':
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
            // eslint-disable-next-line max-len
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


  const handleUpdateRadioSettings = async (formData: ApRadioCustomization) => {
    try {

      setEditContextData({
        ...editContextData,
        isDirty: false
      })

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

      const isUseVenue = isUseVenueSettingsRef.current

      if (isUseVenue) {
        await deleteApRadio({ params: { tenantId, serialNumber } }).unwrap()
      } else {
        const payload = { ...formData }
        payload.useVenueSettings = false
        const {
          enable24G,
          enable50G,
          enable6G,
          apRadioParamsDual5G
        } = payload

        const hasRadio5G = (!isSupportTriBandRadioAp || !isDual5gMode) && bandwidth5GOptions.length > 0
        const hasRadioDual5G = (isSupportDual5GAp && isDual5gMode)
        const hasRadio6G = (isSupportTriBandRadioAp && !isDual5gMode) && bandwidth6GOptions.length > 0

        if (!validRadioChannels(payload, hasRadio5G, hasRadioDual5G, hasRadio6G)) {
          return
        }

        if (!enable24G) {
          payload.apRadioParams24G = initData.apRadioParams24G
        }
        updateRadioParams(payload.apRadioParams24G, support24GChannels)

        if (hasRadio5G) {
          if (!enable50G) {
            payload.apRadioParams50G = initData.apRadioParams50G
          }
          updateRadioParams(payload.apRadioParams50G, support5GChannels)
        } else {
          delete payload.apRadioParams50G
        }

        if (hasRadio6G) {
          if (!enable6G) {
            payload.apRadioParams6G = initData.apRadioParams6G
          }
          updateRadioParams(payload.apRadioParams6G, support6GChannels)
        } else {
          delete payload.apRadioParams6G
        }

        if (hasRadioDual5G) {
          const radioDual5G = apRadioParamsDual5G || new ApRadioParamsDual5G()

          const { lower5gEnabled, upper5gEnabled } = radioDual5G

          if (!lower5gEnabled) {
            radioDual5G.radioParamsLower5G = initData?.apRadioParamsDual5G?.radioParamsLower5G
          }

          if (!upper5gEnabled) {
            radioDual5G.radioParamsUpper5G = initData?.apRadioParamsDual5G?.radioParamsUpper5G
          }

          updateRadioParams(radioDual5G.radioParamsLower5G, supportLower5GChannels)
          updateRadioParams(radioDual5G.radioParamsUpper5G, supportUpper5GChannels)

          payload.apRadioParamsDual5G = radioDual5G
        } else if (isSupportDual5GAp) {
          if (!apRadioParamsDual5G) {
            const radioDual5G = new ApRadioParamsDual5G()
            radioDual5G.enabled = false
            radioDual5G.radioParamsLower5G = undefined
            radioDual5G.radioParamsUpper5G = undefined
            payload.apRadioParamsDual5G = radioDual5G
          }
        } else {
          delete payload.apRadioParamsDual5G
        }

        await updateApRadio({
          params: { tenantId, serialNumber },
          payload: payload
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleTriBandTypeRadioChange = (e: RadioChangeEvent) => {
    const isDual5gEnabled = e.target.value
    setIsDual5gMode(isDual5gEnabled)
    formRef.current?.setFieldValue(['radioParamsDual5G', 'enabled'], isDual5gEnabled)
    onTabChange('Normal24GHz')
  }

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings

    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    const supportDual5G = isSupportDual5G()
    const currentRadioData = currentRef.current

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        currentData.useVenueSettings = isUseVenue
        currentRef.current = { ...currentRadioData, ...currentData }
      }

      const venueRadioData = venueRef.current
      if (venueRadioData) {
        const cloneVenueData = cloneDeep(venueRadioData)
        updateFormData(cloneVenueData)
        setIsDual5gMode((supportDual5G && venueRadioData.apRadioParamsDual5G?.enabled) || false)
        onTabChange('Normal24GHz')
      }
    } else {
      if (currentRadioData) {
        const newData = { ...currentRadioData, useVenueSettings: isUseVenue }
        currentRef.current = newData
        updateFormData(newData)
        setIsDual5gMode((supportDual5G && newData.apRadioParamsDual5G?.enabled) || false)
        onTabChange('Normal24GHz')
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const updateEditContext = (form: StepsFormLegacyInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: isDirty
    })

    setEditRadioContextData && setEditRadioContextData({
      ...editRadioContextData,
      updateWifiRadio: () => handleUpdateRadioSettings(form?.getFieldsValue() as ApRadioCustomization),
      discardWifiRadioChanges: () => handleDiscard()
    })
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings || false)
    isUseVenueSettingsRef.current = (initData.useVenueSettings || false)
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = async () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  return (
    <Loader states={[{
      isLoading: formInitializing,
      isFetching: isUpdatingApRadio || isDeletingApRadio
    }]}>
      <StepsFormLegacy
        formRef={formRef}
        onFormChange={handleChange}
      >
        <StepsFormLegacy.StepForm data-testid='radio-settings' initialValues={initData}>
          <Row gutter={20}>
            <Col span={12}>
              <Space style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                paddingBottom: '20px' }}
              >
                { isUseVenueSettings ?
                  <FormattedMessage
                    defaultMessage={`
                    Currently using radio settings of the venue (<venuelink></venuelink>)
                   `}
                    values={{
                      venuelink: () => venue?
                        <TenantLink
                          to={`venues/${venue.id}/venue-details/overview`}>{venue?.name}
                        </TenantLink> : ''
                    }}
                  />
                  :$t({ defaultMessage: 'Custom radio settings' })
                }
              </Space>
            </Col>
            <Col span={8}>
              <Button type='link' onClick={handleVenueSetting}>
                {isUseVenueSettings ?
                  $t({ defaultMessage: 'Customize' }):$t({ defaultMessage: 'Use Venue Settings' })
                }
              </Button>
            </Col>
          </Row>
          {isSupportDual5GAp && <div style={{ marginTop: '1em' }}>
            <Row gutter={0}>
              <Col span={6}>
                <span>{$t({ defaultMessage: 'How to handle tri-band radio?' })}</span>
              </Col>
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
                onChange={handleTriBandTypeRadioChange}
                disabled={isUseVenueSettings}>
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
          <Tabs onChange={onTabChange}
            activeKey={currentTab}
            type='third'>
            <Tabs.TabPane tab={$t({ defaultMessage: '2.4 GHz' })} key='Normal24GHz' />
            {(!isSupportTriBandRadioAp || !isDual5gMode) &&
              <Tabs.TabPane tab={$t({ defaultMessage: '5 GHz' })} key='Normal5GHz' />
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
            { isSupportTriBandRadioAp && !isDual5gMode &&
                <Tabs.TabPane tab={$t({ defaultMessage: '6 GHz' })} key='Normal6GHz' />
            }
          </Tabs>
          <div style={{ display: currentTab === 'Normal24GHz' ? 'block' : 'none' }}>
            <ApSingleRadioSettings
              isEnabled={isEnable24g}
              radioTypeName='2.4 GHz'
              enabledFieldName={['enable24G']}
              onEnableChanged={(checked: boolean) => handleEnableChanged(checked, 'enable24G')}
              radioType={ApRadioTypeEnum.Radio24G}
              supportChannels={support24GChannels}
              bandwidthOptions={bandwidth24GOptions}
              handleChanged={handleChange}
              isUseVenueSettings={isUseVenueSettings}
            />
          </div>
          <div style={{ display: currentTab === 'Normal5GHz' ? 'block' : 'none' }}>
            <ApSingleRadioSettings
              isEnabled={isEnable5g}
              radioTypeName='5 GHz'
              enabledFieldName={['enable50G']}
              onEnableChanged={(checked: boolean) => handleEnableChanged(checked, 'enable5G')}
              radioType={ApRadioTypeEnum.Radio5G}
              supportChannels={support5GChannels}
              supportDfsChannels={supportDfsChannels}
              bandwidthOptions={bandwidth5GOptions}
              handleChanged={handleChange}
              isUseVenueSettings={isUseVenueSettings}
            />
          </div>
          <div style={{ display: currentTab === 'Normal6GHz' ? 'block' : 'none' }}>
            <ApSingleRadioSettings
              isEnabled={isEnable6g}
              radioTypeName='6 GHz'
              enabledFieldName={['enable6G']}
              onEnableChanged={(checked: boolean) => handleEnableChanged(checked, 'enable6G')}
              radioType={ApRadioTypeEnum.Radio6G}
              supportChannels={support6GChannels}
              bandwidthOptions={bandwidth6GOptions}
              handleChanged={handleChange}
              isUseVenueSettings={isUseVenueSettings}
            />
          </div>
          {isSupportDual5GAp && (
            <>
              <div style={{ display: currentTab === 'Lower5GHz' ? 'block' : 'none' }}>
                <ApSingleRadioSettings
                  isEnabled={isEnableLower5g}
                  radioTypeName='Lower 5 GHz'
                  enabledFieldName={['apRadioParamsDual5G', 'lower5gEnabled']}
                  onEnableChanged={(checked: boolean) => handleEnableChanged(checked, 'enableLower5G')}
                  radioType={ApRadioTypeEnum.RadioLower5G}
                  supportChannels={supportLower5GChannels}
                  supportDfsChannels={supportLowerDfsChannels}
                  bandwidthOptions={bandwidthLower5GOptions}
                  handleChanged={handleChange}
                  isUseVenueSettings={isUseVenueSettings}
                />
              </div>
              <div style={{ display: currentTab === 'Upper5GHz' ? 'block' : 'none' }}>
                <ApSingleRadioSettings
                  isEnabled={isEnableUpper5g}
                  radioTypeName='Upper 5 GHz'
                  enabledFieldName={['apRadioParamsDual5G', 'upper5gEnabled']}
                  onEnableChanged={(checked: boolean) => handleEnableChanged(checked, 'enableUpper5G')}
                  radioType={ApRadioTypeEnum.RadioUpper5G}
                  supportChannels={supportUpper5GChannels}
                  supportDfsChannels={supportUpperDfsChannels}
                  bandwidthOptions={bandwidthUpper5GOptions}
                  handleChanged={handleChange}
                  isUseVenueSettings={isUseVenueSettings}
                />
              </div>
            </>
          )}
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}
