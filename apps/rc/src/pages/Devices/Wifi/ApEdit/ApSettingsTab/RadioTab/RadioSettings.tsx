/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Radio, RadioChangeEvent, Row, Space, Switch } from 'antd'
import { cloneDeep, includes }                                    from 'lodash'
import { FormattedMessage, useIntl }                              from 'react-intl'

import { Button, Loader, showActionModal, StepsForm, StepsFormInstance, Tabs, Tooltip } from '@acx-ui/components'
import {
  ApRadioTypeEnum,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  SelectItemOption,
  SingleRadioSettings } from '@acx-ui/rc/components'
import {
  useGetApQuery,
  useGetApRadioCustomizationQuery,
  useUpdateApRadioCustomizationMutation,
  useDeleteApRadioCustomizationMutation,
  useGetApCapabilitiesQuery,
  useGetApValidChannelQuery,
  useLazyGetVenueQuery,
  useLazyGetVenueRadioCustomizationQuery
} from '@acx-ui/rc/services'
import {
  ApRadioCustomization,
  ApRadioParamsDual5G,
  VenueExtended,
  VenueRadioCustomization,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { ApEditContext } from '../..'
import { FieldLabel }    from '../styledComponents'

import { DisabledDiv } from './styledComponents'

export function RadioSettings () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const {
    previousPath,
    editContextData,
    setEditContextData
  } = useContext(ApEditContext)

  const { tenantId, serialNumber } = useParams()
  const getAp = useGetApQuery({ params: { tenantId, serialNumber } })
  const getApCapabilities = useGetApCapabilitiesQuery({ params: { tenantId, serialNumber } })
  const getApAvailableChannels = useGetApValidChannelQuery({ params: { tenantId, serialNumber } })

  const formRef = useRef<StepsFormInstance<ApRadioCustomization>>()
  const venueRef = useRef<ApRadioCustomization>()
  const currentRef = useRef<ApRadioCustomization>()

  const [isUseVenueSettings, setIsUseVenueSettings] = useState(false)
  const [isEnable24g, setIsEnable24g] = useState(true)
  const [isEnable5g, setIsEnable5g] = useState(true)
  const [isEnable6g, setIsEnable6g] = useState(true)
  const [isEnableLower5g, setIsEnableLower5g] = useState(true)
  const [isEnableUpper5g, setIsEnableUpper5g] = useState(true)

  const [apModelType, setApModelType] = useState('indoor')
  const [venue, setVenue] = useState({} as VenueExtended)
  //const [currentRadioData, setCurrentRadioData] = useState<ApRadioCustomization>()
  //const [venueRadioData, setVenueRadioData] = useState<ApRadioCustomization>()
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
    availableChannels: any, isSupport160Mhz = false) => {
    const bandwidthList = Object.keys(availableChannels)
    return bandwidthOptions.filter((option: SelectItemOption) => {
      const bandwidth = (option.value === 'AUTO') ? 'auto' : option.value

      if (bandwidth === '160MHz') {
        return isSupport160Mhz
      }

      return includes(bandwidthList, bandwidth)
    })
  }

  const isSupportDual5G = () => {
    return (isSupportDual5GAp &&
           bandwidthUpper5GOptions.length > 0 &&
           bandwidthUpper5GOptions.length > 0)
  }

  useEffect(() => {
    const ap = getAp.data
    const capabilities = getApCapabilities.data
    const availableChannels = getApAvailableChannels.data

    if (!apDataLoaded && ap && capabilities && availableChannels) {
      const setData = async () => {

        const apCapabilities = capabilities.apModels.find(cap => cap.model === ap.model)
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
        const bandwidth6g = getSupportBandwidth(channelBandwidth6GOptions, supportCh6g, is6GHas160Mhz)
        setSupport6GChannels(supportCh6g)
        setBandwidth6GOptions(bandwidth6g)

        const venue = (await getVenue({
          params: { tenantId, venueId: ap?.venueId } }, true).unwrap())

        const venueRadioData = (await getVenueCustomization({
          params: { tenantId, venueId: ap?.venueId } }, true).unwrap())

        setVenue(venue)
        const apVenueData = convertVenueRadioSetingsToApRadioSettings(venueRadioData)
        venueRef.current = apVenueData
        //setVenueRadioData(apVenueData)
        setApDataLoaded(true)
      }

      setData()
    }
  }, [getAp, getApCapabilities, getApAvailableChannels, apDataLoaded])

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
    if (initData) {
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
    }

  }, [initData])

  const [currentTab, setCurrentTab] = useState('Normal24GHz')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const onEnableChanged = (value: boolean, fieldName: string) => {
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


  const vaildRadioChannels = ( data: ApRadioCustomization,
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
      const { allowedChannels: channel6, method: method6 } = apRadioParams6G || {}
      title = $t({ defaultMessage: '6 GHz - Channel selection' })
      if (!validateChannels(channel6, method6, title)) return false
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
          /*
          if (allowedChannels || allowedChannels.length === 0) {
            radioParams.allowedChannels = supportCh[bandwidth]
          }
          */
        }
      }

      if (isUseVenueSettings) {
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

        if (!vaildRadioChannels(payload, hasRadio5G, hasRadioDual5G, hasRadio6G)) {
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

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    formRef?.current?.setFieldValue('useVenueSettings', isUseVenue)
    setIsUseVenueSettings(isUseVenue)

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

    updateEditContext(formRef?.current as StepsFormInstance, true)
  }

  const updateEditContext = (form: StepsFormInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: isDirty,
      updateChanges: () => handleUpdateRadioSettings(form?.getFieldsValue() as ApRadioCustomization),
      discardChanges: () => handleDiscard()
    })
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings || false)
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = async () => {
    updateEditContext(formRef?.current as StepsFormInstance, true)
  }

  return (
    <Loader states={[{
      isLoading: formInitializing,
      isFetching: isUpdatingApRadio || isDeletingApRadio
    }]}>
      <StepsForm
        formRef={formRef}
        onFormChange={handleChange}
        onFinish={handleUpdateRadioSettings}
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, basePath)
        }
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply Radio' })
        }}
      >
        <StepsForm.StepForm data-testid='radio-settings' initialValues={initData}>
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
                      venuelink: () =>
                        <TenantLink
                          to={`venues/${venue.id}/venue-details/overview`}>{venue?.name}
                        </TenantLink>
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
              //name={['apRadioParamsDual5G', 'enabled']}
            >
              <Radio.Group
                defaultValue={isDual5gMode}
                onChange={handleTriBandTypeRadioChange}
                disabled={isUseVenueSettings}>
                <Radio value={true}>
                  {$t({ defaultMessage: 'Split 5GHz into lower and upper bands' })}
                </Radio>

                <Radio value={false}>
                  {$t({ defaultMessage: 'Use 5 and 6 Ghz bands' })}
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
            <FieldLabel width='180px'>
              {$t({ defaultMessage: 'Enable 2.4 GHz band:' })}
              <Form.Item
                name={['enable24G']}
                //label={$t({ defaultMessage: 'Enable 2.4 GHz band:' })}
                valuePropName='checked'
                style={{ marginTop: '16px' }}
                children={isUseVenueSettings ?
                  <span>{$t({ defaultMessage: 'On' })}</span>
                  :<Switch onChange={(checked)=>onEnableChanged(checked, 'enable24G')} />
                }
              />
            </FieldLabel>
            { (!isEnable24g && !isUseVenueSettings) ? (
              <DisabledDiv>
                {$t({ defaultMessage: '2.4 GHz Radio is disabled' })}
              </DisabledDiv>) : (
              <SingleRadioSettings
                context='ap'
                radioType={ApRadioTypeEnum.Radio24G}
                supportChannels={support24GChannels}
                bandwidthOptions={bandwidth24GOptions}
                editContext={ApEditContext}
                isUseVenueSettings={isUseVenueSettings} />
            )
            }
          </div>
          <div style={{ display: currentTab === 'Normal5GHz' ? 'block' : 'none' }}>
            <FieldLabel width='180px'>
              {$t({ defaultMessage: 'Enable 5 GHz band:' })}
              <Form.Item
                name={['enable50G']}
                valuePropName='checked'
                style={{ marginTop: '16px' }}
                children={isUseVenueSettings ?
                  <span>{$t({ defaultMessage: 'On' })}</span>
                  :<Switch onChange={(checked)=>onEnableChanged(checked, 'enable5G')} />
                }
              />
            </FieldLabel>
            { (!isEnable5g && !isUseVenueSettings) ? (
              <DisabledDiv>
                {$t({ defaultMessage: '5 GHz Radio is disabled' })}
              </DisabledDiv>) : (
              <SingleRadioSettings
                context='ap'
                radioType={ApRadioTypeEnum.Radio5G}
                supportChannels={support5GChannels}
                supportDfsChannels={supportDfsChannels}
                bandwidthOptions={bandwidth5GOptions}
                editContext={ApEditContext}
                isUseVenueSettings={isUseVenueSettings} />
            )
            }
          </div>
          <div style={{ display: currentTab === 'Normal6GHz' ? 'block' : 'none' }}>
            <FieldLabel width='180px'>
              {$t({ defaultMessage: 'Enable 6 GHz band:' })}
              <Form.Item
                name={['enable6G']}
                valuePropName='checked'
                style={{ marginTop: '16px' }}
                children={isUseVenueSettings ?
                  <span>{$t({ defaultMessage: 'On' })}</span>
                  :<Switch onChange={(checked)=>onEnableChanged(checked, 'enable6G')} />
                }
              />
            </FieldLabel>
            { (!isEnable6g && !isUseVenueSettings) ? (
              <DisabledDiv>
                {$t({ defaultMessage: '6 GHz Radio is disabled' })}
              </DisabledDiv>) : (
              <SingleRadioSettings
                context='ap'
                radioType={ApRadioTypeEnum.Radio6G}
                supportChannels={support6GChannels}
                bandwidthOptions={bandwidth6GOptions}
                editContext={ApEditContext}
                isUseVenueSettings={isUseVenueSettings} />
            )
            }
          </div>
          {isSupportDual5GAp && (
            <>
              <div style={{ display: currentTab === 'Lower5GHz' ? 'block' : 'none' }}>
                <FieldLabel width='180px'>
                  {$t({ defaultMessage: 'Enable Lower 5 GHz band:' })}
                  <Form.Item
                    name={['apRadioParamsDual5G', 'lower5gEnabled']}
                    valuePropName='checked'
                    style={{ marginTop: '16px' }}
                    children={isUseVenueSettings ?
                      <span>{$t({ defaultMessage: 'On' })}</span>
                      :<Switch onChange={(checked)=>onEnableChanged(checked, 'enableLower5G')} />
                    }
                  />
                </FieldLabel>
                { (!isEnableLower5g && !isUseVenueSettings) ? (
                  <DisabledDiv>
                    {$t({ defaultMessage: 'Lower 5 GHz Radio is disabled' })}
                  </DisabledDiv>) : (
                  <SingleRadioSettings
                    context='ap'
                    radioType={ApRadioTypeEnum.RadioLower5G}
                    supportChannels={supportLower5GChannels}
                    supportDfsChannels={supportLowerDfsChannels}
                    bandwidthOptions={bandwidthLower5GOptions}
                    editContext={ApEditContext}
                    isUseVenueSettings={isUseVenueSettings} />
                )
                }
              </div>
              <div style={{ display: currentTab === 'Upper5GHz' ? 'block' : 'none' }}>
                <FieldLabel width='180px'>
                  {$t({ defaultMessage: 'Enable Upper 5 GHz band:' })}
                  <Form.Item
                    name={['apRadioParamsDual5G', 'upper5gEnabled']}
                    valuePropName='checked'
                    style={{ marginTop: '16px' }}
                    children={isUseVenueSettings ?
                      <span>{$t({ defaultMessage: 'On' })}</span>
                      :<Switch onChange={(checked)=>onEnableChanged(checked, 'enableUpper5G')} />
                    }
                  />
                </FieldLabel>
                { (!isEnableUpper5g && !isUseVenueSettings) ? (
                  <DisabledDiv>
                    {$t({ defaultMessage: 'Upper 5 GHz Radio is disabled' })}
                  </DisabledDiv>) : (
                  <SingleRadioSettings
                    context='ap'
                    radioType={ApRadioTypeEnum.RadioUpper5G}
                    supportChannels={supportUpper5GChannels}
                    supportDfsChannels={supportUpperDfsChannels}
                    bandwidthOptions={bandwidthUpper5GOptions}
                    editContext={ApEditContext}
                    isUseVenueSettings={isUseVenueSettings} />
                )
                }
              </div>
            </>
          )}
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}
