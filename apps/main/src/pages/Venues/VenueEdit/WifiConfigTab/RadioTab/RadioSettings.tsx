/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from 'react'

import {
  Col,
  Divider,
  Form,
  Radio,
  RadioChangeEvent,
  Row,
  Switch } from 'antd'
import { includes, isEmpty, dropRight } from 'lodash'
import { useIntl }                      from 'react-intl'
import styled                           from 'styled-components/macro'

import { Loader, showActionModal, StepsFormLegacy, StepsFormLegacyInstance, Tabs, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                                       from '@acx-ui/icons'
import { ApRadioTypeEnum,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  SelectItemOption,
  SingleRadioSettings,
  findIsolatedGroupByChannel,
  split5GChannels }                               from '@acx-ui/rc/components'
import {
  useLazyApListQuery,
  useGetDefaultRadioCustomizationQuery,
  useVenueDefaultRegulatoryChannelsQuery,
  useGetVenueRadioCustomizationQuery,
  useUpdateVenueRadioCustomizationMutation,
  useGetVenueTripleBandRadioSettingsQuery,
  useUpdateVenueTripleBandRadioSettingsMutation, useGetVenueApCapabilitiesQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  VenueRadioCustomization,
  ChannelBandwidth6GEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../..'


const displayWidth = '40px'
const RadioLegends = styled.div`
  position: relative;
  padding-top: 1em;
  .legends {
    position: absolute;
    display: grid;
    grid-template-columns: 190px 114px 314px ;
    grid-column-gap: 8px;
    height: 16px;

    .legend {
      border: 1px dashed var(--acx-neutrals-50);
      border-bottom: none;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      position: relative;

      .legend-display {
        position: absolute;
        width: ${displayWidth};
        height: 20px;
        top: -10px;
        left: calc(50% - ${displayWidth}/2);
        text-align: center;
        background: white;
        font-weight: 300;
      }
    }
  }
`
const RadioLable = styled.div`
  display: flex;
  justify-content: center;
`

export function RadioSettings () {
  const { $t } = useIntl()
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  const wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)

  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  } = useContext(VenueEditContext)

  const { tenantId, venueId } = useParams()

  const formRef = useRef<StepsFormLegacyInstance<VenueRadioCustomization>>()
  const isTriBandRadioRef = useRef<boolean>(false)
  const [isTriBandRadio, setIsTriBandRadio] = useState(false)
  const [isDual5gMode, setIsDual5gMode] = useState(true)

  const [support24GChannels, setSupport24GChannels] = useState<any>({})
  const [support5GChannels, setSupport5GChannels] = useState<any>({})
  const [support6GChannels, setSupport6GChannels] = useState<any>({})
  const [support5GLowerChannels, setSupport5GLowerChannels] = useState<any>({})
  const [support5GUpperChannels, setSupport5GUpperChannels] = useState<any>({})

  const [bandwidth24GOptions, setBandwidth24GOptions] = useState<SelectItemOption[]>([])
  const [bandwidth5GOptions, setBandwidth5GOptions] = useState<SelectItemOption[]>([])
  const [bandwidth6GOptions, setBandwidth6GOptions] = useState<SelectItemOption[]>([])
  const [bandwidthLower5GOptions, setBandwidthLower5GOptions] = useState<SelectItemOption[]>([])
  const [bandwidthUpper5GOptions, setBandwidthUpper5GOptions] = useState<SelectItemOption[]>([])

  const [isLower5gInherit, setIsLower5gInherit] = useState(true)
  const [isUpper5gInherit, setIsUpper5gInherit] = useState(true)

  const [triBandApModels, setTriBandApModels] = useState<string[]>([])
  const [hasTriBandAps, setHasTriBandAps] = useState(false)

  const { data: venueCaps } = useGetVenueApCapabilitiesQuery({ params: { tenantId, venueId } })

  const { data: tripleBandRadioSettingsData } =
    useGetVenueTripleBandRadioSettingsQuery({ params: { tenantId, venueId } })

  // available channels from this venue country code
  const { data: supportChannelsData } =
    useVenueDefaultRegulatoryChannelsQuery({ params: { tenantId, venueId } })

  // default radio data
  const { data: defaultRadioSettingsData } =
    useGetDefaultRadioCustomizationQuery({
      params: { tenantId, venueId },
      payload: { defaultonly: true }
    })

  // Custom radio data
  const { data: venueSavedChannelsData, isLoading: isLoadingVenueData } =
    useGetVenueRadioCustomizationQuery({ params: { tenantId, venueId } })

  const [ updateVenueRadioCustomization, { isLoading: isUpdatingVenueRadio } ] =
    useUpdateVenueRadioCustomizationMutation()

  const [ updateVenueTripleBandRadioSettings ] = useUpdateVenueTripleBandRadioSettingsMutation()

  const [ apList ] = useLazyApListQuery()

  const getSupportBandwidth = (bandwidthOptions: SelectItemOption[], availableChannels: any) => {
    const bandwidthList = Object.keys(availableChannels)
    return bandwidthOptions.filter((option: SelectItemOption) => {
      const bandwidth = (option.value === 'AUTO') ? 'auto' : option.value

      return includes(bandwidthList, bandwidth)
    })
  }

  const getSupport5GBandwidth = (bandwidthOptions: SelectItemOption[], availableChannels: any) => {
    const { indoor = {}, outdoor = {} } = availableChannels
    const indoorBandwidthList = Object.keys(indoor)
    const outdoorBandwidthList = Object.keys(outdoor)
    return bandwidthOptions.filter((option: SelectItemOption) => {
      const bandwidth = (option.value === 'AUTO') ? 'auto' : option.value

      return includes(indoorBandwidthList, bandwidth) || includes(outdoorBandwidthList, bandwidth)
    })
  }

  const supportedApModelTooltip = wifi7_320Mhz_FeatureFlag ?
    // eslint-disable-next-line max-len
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R770, R760 and R560' }) :
    // eslint-disable-next-line max-len
    $t({ defaultMessage: 'These settings apply only to AP models that support tri-band, such as R760 and R560' })

  useEffect(() => {
    if (supportChannelsData) {
      const supportCh24g = supportChannelsData['2.4GChannels'] || {}
      const supportCh5g = supportChannelsData['5GChannels'] || {}
      const supportCh6g = supportChannelsData['6GChannels'] || {}
      const supportChLower5g = supportChannelsData['5GLowerChannels'] || {}
      const supportChUpper5g = supportChannelsData['5GUpperChannels'] || {}

      setSupport24GChannels(supportCh24g)
      setSupport5GChannels(supportCh5g)
      setSupport6GChannels(supportCh6g)
      setSupport5GLowerChannels(supportChLower5g)
      setSupport5GUpperChannels(supportChUpper5g)

      setBandwidth24GOptions(getSupportBandwidth(channelBandwidth24GOptions, supportCh24g))
      setBandwidth5GOptions(getSupport5GBandwidth(channelBandwidth5GOptions, supportCh5g))
      // eslint-disable-next-line max-len
      const wifi7_320Bandwidth = wifi7_320Mhz_FeatureFlag ? channelBandwidth6GOptions : dropRight(channelBandwidth6GOptions)
      setBandwidth6GOptions(getSupportBandwidth(wifi7_320Bandwidth, supportCh6g))
      setBandwidthLower5GOptions(getSupport5GBandwidth(channelBandwidth5GOptions, supportChLower5g))
      setBandwidthUpper5GOptions(getSupport5GBandwidth(channelBandwidth5GOptions, supportChUpper5g))
    }

  }, [supportChannelsData])

  useEffect(() => {
    if (venueCaps) {
      let apModels = venueCaps.apModels
        .filter(apCapability => apCapability.supportTriRadio === true)
        .map(triBandApCapability => triBandApCapability.model) as string[]

      setTriBandApModels(apModels)
    }
  }, [venueCaps])

  useEffect(() => {
    const triBandApModelNames = isEmpty(triBandApModels)? ['R760', 'R560'] : triBandApModels
    let filters = { model: triBandApModelNames, venueId: [venueId] }

    const payload = {
      fields: ['name', 'model', 'venueId', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      url: '/api/viewmodel/{tenantId}/aps',
      filters
    }

    if (apList) {
      apList({ params: { tenantId }, payload }, true).unwrap().then((res)=>{
        const { data } = res || {}
        if (data) {
          const findAp = data.some((ap: APExtended) => ap.venueId === venueId)
          setHasTriBandAps(findAp)
        }
      })
    }
  }, [triBandApModels])

  useEffect(() => {
    const triBandEnabled = !!(triBandRadioFeatureFlag && tripleBandRadioSettingsData?.enabled)
    setIsTriBandRadio(hasTriBandAps || triBandEnabled)
    isTriBandRadioRef.current = hasTriBandAps || triBandEnabled

  }, [tripleBandRadioSettingsData, triBandRadioFeatureFlag, hasTriBandAps])

  useEffect(() => {
    const setRadioFormData = (data: VenueRadioCustomization) => {
      setEditRadioContextData({ radioData: data })
      formRef?.current?.setFieldsValue(data)

      const dual5GData = data?.radioParamsDual5G
      setIsDual5gMode(!!dual5GData?.enabled)

      setIsLower5gInherit(!!dual5GData?.inheritParamsLower5G)
      setIsUpper5gInherit(!!dual5GData?.inheritParamsUpper5G)

      setEditRadioContextData({
        ...editRadioContextData,
        radioData: formRef.current?.getFieldsValue(),
        updateWifiRadio: handleUpdateRadioSettings
      })
    }

    if (venueSavedChannelsData){
      setRadioFormData(venueSavedChannelsData)
    }
  }, [venueSavedChannelsData])

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
    const isSupportLower5G = bandwidthLower5GOptions.length > 0
    const isSupportUpper5G = bandwidthUpper5GOptions.length > 0

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
    const isSupport6g = bandwidth6GOptions.length > 0

    if (!radioParams6G) {
      return
    }

    if (isSupport6g) {
      radioParams6G.allowedChannels = curForm?.getFieldValue(['radioParams6G', 'allowedChannels'])
    } else {
      delete formData.radioParams6G
    }
  }

  const validateRadioChannels = ( data: VenueRadioCustomization ) => {
    const { radioParams24G, radioParams50G, radioParams6G, radioParamsDual5G } = data
    const validateChannels = (channels: unknown[] | undefined,
      title: string, dual5GName?: string) => {

      const content = dual5GName?
        $t(
          { defaultMessage: 'The Radio {dual5GName} inherited the channel selection from the Radio 5 GHz.{br}Please select at least two channels under the {dual5GName} block' },
          { dual5GName, br: <br /> }
        ):
        $t({ defaultMessage: 'Please select at least two channels' })

      if (Array.isArray(channels) && channels.length <2) {
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
    const title24 = $t({ defaultMessage: '2.4 GHz - Channel selection' })
    if (!validateChannels(channel24, title24)) return false

    const indoorChannel5 = radioParams50G?.allowedIndoorChannels
    const indoorTitle5 = $t({ defaultMessage: '5 GHz - Indoor AP channel selection' })
    if (!validateChannels(indoorChannel5, indoorTitle5)) return false

    const outdoorChannel5 = radioParams50G?.allowedOutdoorChannels
    const outdoorTitle5 = $t({ defaultMessage: '5 GHz - Outdoor AP channel selection' })
    if (!validateChannels(outdoorChannel5, outdoorTitle5)) return false

    const channelBandwidth6 = radioParams6G?.channelBandwidth
    const channel6 = radioParams6G?.allowedChannels
    const title6 = $t({ defaultMessage: '6 GHz - Channel selection' })
    if (!validateChannels(channel6, title6)) return false
    if (channelBandwidth6 === ChannelBandwidth6GEnum._320MHz){
      if (!validate320MHzIsolatedGroup(channel6, title6)) return false
    }

    const { radioParamsLower5G, radioParamsUpper5G,
      inheritParamsLower5G, inheritParamsUpper5G } = radioParamsDual5G || {}

    let indoorLower5GChs, indoorUpper5GChs
    if (indoorChannel5) {
      const { lower5GChannels, upper5GChannels } = split5GChannels(indoorChannel5 as string[])
      indoorLower5GChs = lower5GChannels
      indoorUpper5GChs = upper5GChannels
    }

    let outdoorLower5GChs, outdoorUpper5GChs
    if (outdoorChannel5) {
      const { lower5GChannels, upper5GChannels } = split5GChannels(outdoorChannel5 as string[])
      outdoorLower5GChs = lower5GChannels
      outdoorUpper5GChs = upper5GChannels
    }

    const lower5GName = inheritParamsLower5G ? 'Lower 5 GHz' : undefined

    const indoorLowerChannel5 = inheritParamsLower5G
      ? indoorLower5GChs
      : radioParamsLower5G?.allowedIndoorChannels
    const indoorLowerTitle5 = inheritParamsLower5G
      ? $t({ defaultMessage: '5 GHz - Indoor AP channel selection' })
      : $t({ defaultMessage: 'Lower 5 GHz - Indoor AP channel selection' })
    if (!validateChannels(indoorLowerChannel5, indoorLowerTitle5, lower5GName)) return false

    const outdoorLowerChannel5 = inheritParamsLower5G
      ? outdoorLower5GChs
      : radioParamsLower5G?.allowedOutdoorChannels
    const outdoorLowerTitle5 = inheritParamsLower5G
      ? $t({ defaultMessage: '5 GHz - Outdoor AP channel selection' })
      : $t({ defaultMessage: 'Lower 5 GHz - Outdoor AP channel selection' })
    if (!validateChannels(outdoorLowerChannel5, outdoorLowerTitle5, lower5GName)) return false

    const upper5GName = inheritParamsUpper5G ? 'Upper 5 GHz' : undefined

    const indoorUpperChannel5 = inheritParamsUpper5G
      ? indoorUpper5GChs
      : radioParamsUpper5G?.allowedIndoorChannels
    const indoorUpperTitle5 = inheritParamsUpper5G
      ? $t({ defaultMessage: '5 GHz - Indoor AP channel selection' })
      : $t({ defaultMessage: 'Upper 5 GHz - Indoor AP channel selection' })
    if (!validateChannels(indoorUpperChannel5, indoorUpperTitle5, upper5GName)) return false

    const outdoorUpperChannel5 = inheritParamsUpper5G
      ? outdoorUpper5GChs
      : radioParamsUpper5G?.allowedOutdoorChannels
    const outdoorUpperTitle5 = inheritParamsUpper5G
      ? $t({ defaultMessage: '5 GHz - Outdoor AP channel selection' })
      : $t({ defaultMessage: 'Upper 5 GHz - Outdoor AP channel selection' })
    if (!validateChannels(outdoorUpperChannel5, outdoorUpperTitle5, upper5GName)) return false

    return true
  }


  const handleUpdateRadioSettings = async (formData: VenueRadioCustomization) => {
    const d = formRef?.current?.getFieldsValue() || formData
    const data = { ...d }

    update5gData(data)

    const isTriBandRadioEnabled = isTriBandRadioRef.current

    if (isTriBandRadioEnabled) {
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
      await updateVenueTripleBandRadioSettings({
        params: { tenantId, venueId },
        payload: { enabled: isTriBandRadioEnabled }
      }).unwrap()

      await updateVenueRadioCustomization({
        params: { tenantId, venueId },
        payload: data
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
      updateWifiRadio: handleUpdateRadioSettings
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
    <Loader states={[{ isLoading: isLoadingVenueData, isFetching: isUpdatingVenueRadio }]}>
      <StepsFormLegacy
        formRef={formRef}
        onFormChange={handleChange}
      >
        <StepsFormLegacy.StepForm data-testid='radio-settings'>
          <Row gutter={20}>
            <Col span={10}>
              {triBandRadioFeatureFlag &&
              <>
                {$t({ defaultMessage: 'Tri-band radio settings' })}
                <Switch
                  disabled={hasTriBandAps}
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
              {triBandRadioFeatureFlag && isTriBandRadio &&
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
            </Col>
          </Row>
          {isTriBandRadio &&
            <RadioLegends>
              { isDual5gMode &&
                <div className='legends'>
                  <div></div>
                  <div></div>
                  <div className='legend'>
                    <div className='legend-display'>R760</div>
                  </div>
                </div>
              }
            </RadioLegends>
          }
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
            { isTriBandRadio &&
              <Tabs.TabPane key='Normal6GHz'
                style={
                  { width: '50px' }
                }
                tab={<RadioLable style={{ width: '60px' }}>
                  {$t({ defaultMessage: '6 GHz' })}
                  {isDual5gMode &&
                    <Tooltip
                      placement='topRight'
                      title={$t({ defaultMessage: '6 GHz only supports R770 and R560.' })}
                    >
                      <QuestionMarkCircleOutlined
                        style={{ height: '16px' }} />
                    </Tooltip>}
                </RadioLable>}/>
            }
            { isTriBandRadio && isDual5gMode && <>
              <Tabs.TabPane key='Lower5GHz'
                tab={<RadioLable style={{ width: '100px' }}>
                  {$t({ defaultMessage: 'Lower 5 GHz' })}</RadioLable>}/>
              <Tabs.TabPane key='Upper5GHz'
                tab={<RadioLable style={{ width: '100px' }}>
                  {$t({ defaultMessage: 'Upper 5 GHz' })}</RadioLable>}/>
            </>
            }
          </Tabs>
          <div style={{ display: currentTab === 'Normal24GHz' ? 'block' : 'none' }}>
            <SingleRadioSettings
              testId='radio-24g-tab'
              radioType={ApRadioTypeEnum.Radio24G}
              supportChannels={support24GChannels}
              bandwidthOptions={bandwidth24GOptions}
              handleChanged={handleChange}
              onResetDefaultValue={handleResetDefaultSettings} />
          </div>
          <div style={{ display: currentTab === 'Normal5GHz' ? 'block' : 'none' }}>
            <SingleRadioSettings
              testId='radio-5g-tab'
              radioType={ApRadioTypeEnum.Radio5G}
              supportChannels={support5GChannels}
              bandwidthOptions={bandwidth5GOptions}
              handleChanged={handleChange}
              onResetDefaultValue={handleResetDefaultSettings} />
          </div>
          { isTriBandRadio &&<div style={{ display: isTriBandRadio &&
                currentTab === 'Normal6GHz' ? 'block' : 'none' }}>
            <SingleRadioSettings
              testId='radio-6g-tab'
              radioType={ApRadioTypeEnum.Radio6G}
              supportChannels={support6GChannels}
              bandwidthOptions={bandwidth6GOptions}
              handleChanged={handleChange}
              onResetDefaultValue={handleResetDefaultSettings} />
          </div>
          }
          { isTriBandRadio && isDual5gMode &&
            <>
              <div style={{
                display: isTriBandRadio && isDual5gMode &&
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
                  supportChannels={support5GLowerChannels}
                  bandwidthOptions={bandwidthLower5GOptions}
                  handleChanged={handleChange}
                  onResetDefaultValue={handleResetDefaultSettings} />
              </div>
              <div style={{
                display: isTriBandRadio && isDual5gMode &&
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
                  supportChannels={support5GUpperChannels}
                  bandwidthOptions={bandwidthUpper5GOptions}
                  handleChanged={handleChange}
                  onResetDefaultValue={handleResetDefaultSettings} />
              </div>
            </>
          }
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </Loader>
  )
}
