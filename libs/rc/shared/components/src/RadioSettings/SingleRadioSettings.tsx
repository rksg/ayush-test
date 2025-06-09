import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Row, Form, Switch, Space } from 'antd'
import { isEmpty }                       from 'lodash'
import { useIntl }                       from 'react-intl'

import { Button, cssStr }                from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }    from '@acx-ui/icons'
import { AFCProps, CapabilitiesApModel } from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { isApFwVersionLargerThan711 }    from '@acx-ui/utils'

import { ApCompatibilityDrawer, ApCompatibilityToolTip, ApCompatibilityType, InCompatibilityFeatures } from '../ApCompatibility'
import { RadioSettingsChannels }                                                                       from '../RadioSettingsChannels'
import { findIsolatedGroupByChannel }                                                                  from '../RadioSettingsChannels/320Mhz/ChannelComponentStates'
import { RadioSettingsChannels320Mhz }                                                                 from '../RadioSettingsChannels/320Mhz/RadioSettingsChannels320Mhz'
import {
  RadioSettingsChannelsManual320Mhz
} from '../RadioSettingsChannels/320Mhz/RadioSettingsChannelsManual320Mhz'

import { ChannelBarControlPopover } from './ChannelBarControlPopover'
import {
  ApRadioTypeDataKeyMap,
  ApRadioTypeEnum, ChannelBars,
  RadioChannel,
  split5GChannels,
  VenueRadioTypeDataKeyMap,
  LPIButtonText,
  SupportRadioChannelsContext,
  SelectItemOption,
  txPowerAdjustmentOptions,
  txPowerAdjustment6GOptions,
  txPowerAdjustmentExtendedOptions,
  FirmwareProps
} from './RadioSettingsContents'
import { RadioSettingsForm } from './RadioSettingsForm'


const { useWatch } = Form

const HzToSizeMap: { [key: string]: number } = {
  '20MHz': 1,
  '40MHz': 2,
  '80MHz': 4,
  '160MHz': 8,
  'auto': 1
}

const initChannelBars: ChannelBars = {
  dfsChannels: [],
  lower5GChannels: [],
  upper5GChannels: []
}

const showChannelBarRadios = [
  ApRadioTypeEnum.Radio5G,
  ApRadioTypeEnum.RadioLower5G,
  ApRadioTypeEnum.RadioUpper5G
]

export function SingleRadioSettings (props:{
  context?: string,
  disabled?: boolean,
  inherit5G?: boolean,
  radioType: ApRadioTypeEnum,
  handleChanged?: () => void,
  onResetDefaultValue?: Function,
  testId?: string,
  isUseVenueSettings?: boolean,
  LPIButtonText?: LPIButtonText,
  afcProps?: AFCProps,
  firmwareProps?: FirmwareProps,
  apCapabilities?: CapabilitiesApModel
}) {

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { venueId } = useParams()
  const {
    disabled = false,
    inherit5G = false,
    context = 'venue',
    isUseVenueSettings = false,
    testId,
    LPIButtonText,
    afcProps,
    firmwareProps,
    apCapabilities
  } = props

  const { radioType, handleChanged } = props

  const {
    bandwidthRadioOptions,
    supportRadioChannels,
    supportRadioDfsChannels
  } = useContext(SupportRadioChannelsContext)

  const isSupportR370ToggleOn = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const isR370Unsupported6gFeatures = isSupportR370ToggleOn &&
    (radioType === ApRadioTypeEnum.Radio6G)

  const bandwidthOptions = bandwidthRadioOptions[radioType]
  const supportChannels = supportRadioChannels[radioType]
  // eslint-disable-next-line max-len
  const supportDfsChannels = supportRadioDfsChannels? supportRadioDfsChannels[radioType]: undefined

  const isSupportRadio = bandwidthOptions?.length > 0
  const radioDataKey = (context === 'venue' || context === 'apGroup') ?
    VenueRadioTypeDataKeyMap[radioType] : ApRadioTypeDataKeyMap[radioType]

  const methodFieldName = [...radioDataKey, 'method']
  const channelBandwidthFieldName = [...radioDataKey, 'channelBandwidth']
  const channelBandwidth320MhzGroupFieldName = [...radioDataKey, 'channelBandwidth320MhzGroup']
  const allowedChannelsFieldName = [...radioDataKey, 'allowedChannels']
  const allowedIndoorChannelsFieldName = [...radioDataKey, 'allowedIndoorChannels']
  const allowedOutdoorChannelsFieldName = [...radioDataKey, 'allowedOutdoorChannels']
  const combinChannelsFieldName = [...radioDataKey, 'combineChannels']
  const txPowerFieldName = [...radioDataKey, 'txPower']

  const [displayRadioBarSettings, setDisplayRadioBarSettings] = useState(
    radioType === ApRadioTypeEnum.Radio5G ? ['5G', 'DFS'] : [])
  const [channelList, setChannelList] = useState<RadioChannel[]>([])
  const [indoorChannelList, setIndoorChannelList] = useState<RadioChannel[]>([])
  const [outdoorChannelList, setOutdoorChannelList] = useState<RadioChannel[]>([])
  const [channelBars] = useState({ ...initChannelBars })
  const [indoorChannelBars, setIndoorChannelBars] = useState({ ...initChannelBars })
  const [outdoorChannelBars, setOutdoorChannelBars] = useState({ ...initChannelBars })
  const [txPowerOptions, setTxPowerOptions] = useState<SelectItemOption[]>([])

  const [groupSize, setGroupSize] = useState(1)

  const [channelErrMsg, setChannelErrMsg] = useState<string>()
  const [indoorChannelErrMsg, setIndoorChannelErrMsg] = useState<string>()
  const [outdoorChannelErrMsg, setOutdoorChannelErrMsg] = useState<string>()

  const [outdoor6gDrawerVisible, setOutdoor6gDrawerVisible] = useState(false)

  const previousChannelMethod = useRef<string>()
  const bandWidthOnChanged = useRef(false)
  const methodOnChanged = useRef(false)
  const combinChannelOnChanged = useRef(false)

  let hasIndoorBandwidth = false
  let hasOutdoorBandwidth = false
  let allowIndoorForOutdoor = false
  let hasIndoorForOutdoor = false

  if (context === 'venue' || context === 'apGroup') {
    const { indoor, outdoor, indoorForOutdoorAp } = supportChannels
    hasIndoorBandwidth = !isEmpty(indoor)
    hasOutdoorBandwidth = !isEmpty(outdoor)
    hasIndoorForOutdoor = !isEmpty(indoorForOutdoorAp)

    allowIndoorForOutdoor = (radioType === ApRadioTypeEnum.Radio5G
                             && hasIndoorForOutdoor === true)
  } else {// context === 'ap'
    //bandwidthList = Object.keys(supportChannels)
  }

  const showChannelBarControlLink = (radioType !== ApRadioTypeEnum.Radio24G &&
                                     radioType !== ApRadioTypeEnum.Radio6G)
  const channelColSpan = (radioType === ApRadioTypeEnum.Radio5G) ? 22 : 20

  const isApTxPowerToggleEnabled = useIsSplitOn(Features.AP_TX_POWER_TOGGLE)
  // eslint-disable-next-line max-len
  const isVenueChannelSelectionManualEnabled = useIsSplitOn(Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)

  const [
    channelMethod,
    channelBandwidth,
    allowedChannels,
    allowedIndoorChannels,
    allowedOutdoorChannels,
    combinChannels
  ] = [
    useWatch<string>(methodFieldName),
    useWatch<string>(channelBandwidthFieldName),
    useWatch<string[]>(allowedChannelsFieldName),
    useWatch<string[]>(allowedIndoorChannelsFieldName),
    useWatch<string[]>(allowedOutdoorChannelsFieldName),
    useWatch<boolean>(combinChannelsFieldName)
  ]

  useEffect(() => {
    const setSelectedChannels = (channels: number[], selected?: number[]) => {
      if(isEmpty(channels)) {
        return []
      }
      const selectedChannels = selected || channels
      return channels.map((channel) => {
        return {
          value: channel.toString(),
          selected: selectedChannels.includes(channel)
        }
      })
    }

    if (!channelBandwidth || isEmpty(supportChannels)) {
      return
    }

    // Reset to AUTO if AP doesn't not supported venue radio settings's bandwidth
    if (channelBandwidth !== 'AUTO' &&
        !bandwidthOptions.find(option => option.value === channelBandwidth)) {
      form.setFieldValue(channelBandwidthFieldName, 'AUTO')
    }

    const bandwidth = (channelBandwidth === 'AUTO')? 'auto' : channelBandwidth
    const isRadio24G = radioType === ApRadioTypeEnum.Radio24G
    const isManualSelect = channelMethod === 'MANUAL'

    const gz = (isRadio24G || isManualSelect) ? 1 : HzToSizeMap[bandwidth]
    setGroupSize(gz)

    if ( !hasIndoorBandwidth && !hasOutdoorBandwidth ) {
      const availableCannels = supportChannels[bandwidth]
      let selectedChannels = setSelectedChannels(availableCannels)

      const isShowChannelBar = showChannelBarRadios.includes(radioType)
      if (isShowChannelBar) {
        const chBars = Object.assign(channelBars, split5GChannels(availableCannels))
        chBars.dfsChannels = (supportDfsChannels && supportDfsChannels[bandwidth]) || []
        setIndoorChannelBars(chBars)
      }

      const isPreviousManualSelect = previousChannelMethod.current === 'MANUAL'
      if (previousChannelMethod.current !== channelMethod) {
        previousChannelMethod.current = channelMethod
      }

      if (bandWidthOnChanged.current ||
          (methodOnChanged.current && isManualSelect !== isPreviousManualSelect)) {
        if (isManualSelect) {
          const allowChannels = form.getFieldValue(allowedChannelsFieldName)
          if (allowChannels.length !== 1 || !availableCannels.includes(allowChannels)) {
            form.setFieldValue(allowedChannelsFieldName, [])
            selectedChannels = setSelectedChannels(availableCannels, [])
          }
        } else {
          form.setFieldValue(allowedChannelsFieldName, availableCannels)
          selectedChannels = setSelectedChannels(availableCannels, availableCannels)
        }

        bandWidthOnChanged.current = false
        methodOnChanged.current = false
      }

      setChannelList(selectedChannels)

    } else {
      const { indoor, outdoor, dfs } = supportChannels
      const availableDfsChannels = (dfs && dfs[bandwidth]) || []

      const availableIndoorChannels = indoor[bandwidth]
      const selectedIndoorChannels = setSelectedChannels(availableIndoorChannels)
      setIndoorChannelList(selectedIndoorChannels)

      // eslint-disable-next-line max-len
      const indoorChBars = Object.assign(indoorChannelBars, split5GChannels(availableIndoorChannels))
      indoorChBars.dfsChannels = availableDfsChannels
      setIndoorChannelBars(indoorChBars)

      const availableOutdoorChannels = outdoor ? outdoor[bandwidth] : []
      const selectedOutdoorChannels = setSelectedChannels(availableOutdoorChannels)
      setOutdoorChannelList(selectedOutdoorChannels)

      // eslint-disable-next-line max-len
      const outdoorChBars = Object.assign(outdoorChannelBars, split5GChannels(availableOutdoorChannels))
      outdoorChBars.dfsChannels = availableDfsChannels
      setOutdoorChannelBars(outdoorChBars)

      if (isVenueChannelSelectionManualEnabled) {
        const isPreviousManualSelect = previousChannelMethod.current === 'MANUAL'
        if (previousChannelMethod.current !== channelMethod) {
          previousChannelMethod.current = channelMethod
        }

        // the bandwidth value is changed
        if (bandWidthOnChanged.current ||
            (methodOnChanged.current && isManualSelect !== isPreviousManualSelect)  ) {
          if (isManualSelect) {
            const allowIndoorChannels = form.getFieldValue(allowedIndoorChannelsFieldName)
            const allowOutdoorChannels = form.getFieldValue(allowedOutdoorChannelsFieldName)

            // eslint-disable-next-line max-len
            if (allowIndoorChannels && availableIndoorChannels && (allowIndoorChannels.length !== 1 || !availableIndoorChannels.includes(allowIndoorChannels))) {
              form.setFieldValue(allowedIndoorChannelsFieldName, [])
              setIndoorChannelList(selectedIndoorChannels)
            }
            // eslint-disable-next-line max-len
            if (allowOutdoorChannels && availableOutdoorChannels && (allowOutdoorChannels.length !== 1 || !availableOutdoorChannels.includes(allowOutdoorChannels))) {
              form.setFieldValue(allowedOutdoorChannelsFieldName, [])
              setOutdoorChannelList(selectedOutdoorChannels)
            }
          } else {
            form.setFieldValue(allowedIndoorChannelsFieldName, availableIndoorChannels)
            form.setFieldValue(allowedOutdoorChannelsFieldName, availableOutdoorChannels)
          }

          bandWidthOnChanged.current = false
        }
      } else {
        if (bandWidthOnChanged.current) {
          form.setFieldValue(allowedIndoorChannelsFieldName, availableIndoorChannels)
          form.setFieldValue(allowedOutdoorChannelsFieldName, availableOutdoorChannels)
          bandWidthOnChanged.current = false
        }
      }

      // the combinChannels value is changed
      if (allowIndoorForOutdoor && combinChannelOnChanged.current) {
        if (combinChannels === false) {
          form.setFieldValue(allowedOutdoorChannelsFieldName, availableOutdoorChannels)
        }
        combinChannelOnChanged.current = false
      }
    }

  }, [supportChannels, channelBandwidth, radioType, bandwidthOptions,
    allowIndoorForOutdoor, combinChannels, channelMethod])


  useEffect(() => {
    const validateChannels = (channelList: string[]) => {
      let errorMessage = ''
      if (!channelList) {
        return errorMessage
      }

      const isManualSelect = channelMethod === 'MANUAL'
      const channelLength = channelList.length || 0

      const isolatedGroup = findIsolatedGroupByChannel(channelList)

      if (isManualSelect) {
        if (channelLength !== 1) {
          errorMessage = $t({ defaultMessage: 'Please select one channel' })
        }
      }
      else if (channelBandwidth === '320MHz' && isolatedGroup.length !== 0) {
        // eslint-disable-next-line max-len
        errorMessage = $t({ defaultMessage: 'Please select two adjacent 160Mhz channels to combine one 320 MHz channel' })
      }
      else if (channelLength < 2) {
        errorMessage = $t({ defaultMessage: 'Please select at least two channels' })
      }
      return errorMessage
    }

    const errMsg = validateChannels(allowedChannels)
    const indoorErrMsg = validateChannels(allowedIndoorChannels)
    const outdoorErrMsg = validateChannels(allowedOutdoorChannels)

    setChannelErrMsg(errMsg)
    setIndoorChannelErrMsg(indoorErrMsg)
    setOutdoorChannelErrMsg(outdoorErrMsg)

    // have error messages
    //const hasErrors = !isEmpty(errMsg + indoorErrMsg + outdoorErrMsg)
  }, [allowedChannels, allowedIndoorChannels, allowedOutdoorChannels, channelMethod])

  useEffect(() => {
    const getTxPowerAdjustmentOptions = () => {
      let res = (radioType === ApRadioTypeEnum.Radio6G
        || (isSupportR370ToggleOn && context === 'ap' && !apCapabilities?.supportAutoCellSizing))
        ? txPowerAdjustment6GOptions
        : txPowerAdjustmentOptions

      if (isApTxPowerToggleEnabled) {
        if ((context === 'venue' || context === 'apGroup')
          // eslint-disable-next-line max-len
          || (context === 'ap' && isModelAndFwSupportAggressiveTxPower(firmwareProps, apCapabilities))) {
          return [...res, ...txPowerAdjustmentExtendedOptions].sort((a, b) => {
            if (a.value === 'MIN') return 1
            if (b.value === 'MIN') return -1
            return 0
          })
        }
      }
      return res
    }
    setTxPowerOptions(getTxPowerAdjustmentOptions())

    if(isApTxPowerToggleEnabled
      && context === 'ap'
      && firmwareProps?.firmware !== undefined
      && !isModelAndFwSupportAggressiveTxPower(firmwareProps, apCapabilities)) {
      const txPower = form.getFieldValue(txPowerFieldName)
      const isExtendedOption = txPowerAdjustmentExtendedOptions.some(o => o.value === txPower)
      if(isExtendedOption) {
        // -10 ~ -23 map to -10 for legacy firmware and unsupported model
        form.setFieldValue(txPowerFieldName, '-10')
      }
    }
  }, [radioType, firmwareProps])

  const isModelAndFwSupportAggressiveTxPower = (
    firmwareProps: FirmwareProps | undefined,
    apCapabilities: CapabilitiesApModel | undefined) => {
    return isApFwVersionLargerThan711(firmwareProps?.firmware)
    && (!isSupportR370ToggleOn || !apCapabilities || apCapabilities?.supportAggressiveTxPower)
  }

  const resetToDefaule = () => {
    if (props.onResetDefaultValue) {
      props.onResetDefaultValue(radioType)
    }
  }

  const updateChannelBarDisplaySettings = (values: string[]) => {
    setDisplayRadioBarSettings(values)
  }

  const handleSettingGUIChanged = (fieldName: string) => {
    if (fieldName === 'bandwidth') {
      bandWidthOnChanged.current = true
    } else if (fieldName === 'method') {
      methodOnChanged.current = true
    }
  }

  const handleCombinChannelsChanged = () => {
    combinChannelOnChanged.current = true
  }


  const selectRadioChannelSelectionType = () => {
    if(channelBandwidth === '320MHz') {
      if (channelMethod === 'MANUAL' && context === 'ap') {
        return (
          <Row gutter={20}>
            <Col span={channelColSpan}>
              <RadioSettingsChannelsManual320Mhz
                formName={allowedChannelsFieldName}
                channelBandwidth320MhzGroupFieldName={channelBandwidth320MhzGroupFieldName}
                channelList={channelList}
                disabled={inherit5G || disabled || isUseVenueSettings}
                handleChanged={handleChanged}
                afcProps={afcProps}
                indoor={!LPIButtonText?.isAPOutdoor}
              />
            </Col>
          </Row>
        )
      }
      return (
        <Row gutter={20}>
          <Col span={channelColSpan}>
            <RadioSettingsChannels320Mhz
              context={context}
              formName={allowedChannelsFieldName}
              channelList={channelList}
              disabled={inherit5G || disabled || isUseVenueSettings}
              handleChanged={handleChanged}
              afcProps={afcProps}
            />
          </Col>
        </Row>
      )
    } else {
      return (
        <Row gutter={20}>
          <Col span={channelColSpan}>
            <RadioSettingsChannels
              formName={allowedChannelsFieldName}
              groupSize={groupSize}
              channelList={channelList}
              displayBarSettings={displayRadioBarSettings}
              channelBars={channelBars}
              disabled={inherit5G || disabled || isUseVenueSettings}
              handleChanged={handleChanged}
              afcProps={afcProps}
            />
          </Col>
        </Row>
      )
    }
  }

  return (
    <>
      {isSupportRadio &&
      <>
        <Row style={{ marginTop: '10px' }} gutter={20} data-testid={testId}>
          <Col span={8}>
            <RadioSettingsForm
              radioType={radioType}
              radioDataKey={radioDataKey}
              disabled={inherit5G || disabled}
              txPowerOptions={txPowerOptions}
              channelBandwidthOptions={bandwidthOptions}
              context={context}
              isUseVenueSettings={isUseVenueSettings}
              onGUIChanged={handleSettingGUIChanged}
              isAFCEnabled={afcProps?.isAFCEnabled}
              LPIButtonText={LPIButtonText}
            />
          </Col>
          { context === 'venue' && !inherit5G && !disabled &&
          <Col offset={4} span={6} style={{ paddingTop: '20px' }}>
            <Button type='link' onClick={resetToDefaule}>
              {$t({ defaultMessage: 'Reset to Default Settings' })}
            </Button>
          </Col>
          }
        </Row>
        <Row gutter={20}>
          <Col span={4}>
            <div>{$t({ defaultMessage: 'Channel selection:' })}</div>
          </Col>
          <Col span={8}>
            {channelErrMsg &&
              <div style={{ color: cssStr('--acx-semantics-red-50') }}>
                {channelErrMsg}
              </div>
            }
          </Col>
          {showChannelBarControlLink &&
            <Col span={6} style={{ paddingLeft: 'unset' }}>
              <ChannelBarControlPopover
                initValue={displayRadioBarSettings}
                onChannelBarDisplayChanged={updateChannelBarDisplaySettings} />
            </Col>
          }
        </Row>
        <Row gutter={20}>
          <Col span={14}>
            <div style={{ color: cssStr('--acx-neutrals-50') }}>
              {
                $t(// eslint-disable-next-line max-len
                  { defaultMessage: 'Selected channels will be available for radio broadcasting in this {context}. Hover to see overlapping channels' },
                  { context: (context === 'venue')?
                    $t({ defaultMessage: '<venueSingular></venueSingular>' }) :
                    (context === 'apGroup')?
                      $t({ defaultMessage: 'AP Group' }) :
                      $t({ defaultMessage: 'AP' })
                  }
                )
              }
            </div>
          </Col>
        </Row>
        {allowIndoorForOutdoor &&
          <Row style={{ paddingTop: '20px' }}>
            <Col span={8} style={{ paddingTop: '8px' }}>
              {$t({ defaultMessage: 'Use same channels for indoor and outdoor APs:' })}
            </Col>
            <Col span={4}>
              <Form.Item
                name={combinChannelsFieldName}
                valuePropName='checked'
              >
                <Switch onChange={handleCombinChannelsChanged}/>
              </Form.Item>
            </Col>
          </Row>
        }

        {
          // Channel Selection Component
          !hasIndoorBandwidth && !hasOutdoorBandwidth && selectRadioChannelSelectionType()
        }

        {hasIndoorBandwidth && !combinChannels &&
        <>
          <Row gutter={20} style={{ paddingTop: '10px' }}>
            <Col span={4}>
              <div>{$t({ defaultMessage: 'Indoor APs' })}</div>
            </Col>
            {indoorChannelErrMsg &&
              <Col span={6}>
                <div style={{ color: cssStr('--acx-semantics-red-50') }}>
                  {indoorChannelErrMsg}
                </div>
              </Col>
            }
          </Row>
          <Row gutter={20}>
            <Col span={channelColSpan}>
              {channelBandwidth !== '320MHz' ?
                <RadioSettingsChannels
                  formName={allowedIndoorChannelsFieldName}
                  groupSize={groupSize}
                  channelList={indoorChannelList}
                  displayBarSettings={displayRadioBarSettings}
                  channelBars={indoorChannelBars}
                  disabled={inherit5G || disabled}
                  handleChanged={handleChanged}
                  afcProps={afcProps}
                /> :
                <RadioSettingsChannels320Mhz
                  context={context}
                  formName={allowedIndoorChannelsFieldName}
                  channelList={indoorChannelList}
                  disabled={inherit5G || disabled || isUseVenueSettings}
                  handleChanged={handleChanged}
                  afcProps={afcProps}
                />
              }
            </Col>
          </Row>
        </>
        }
        {hasOutdoorBandwidth && !combinChannels &&
        <>
          <Row gutter={20}>
            <Col span={4}>
              <Space>
                <div>{$t({ defaultMessage: 'Outdoor APs' })}</div>
                {isR370Unsupported6gFeatures && <ApCompatibilityToolTip
                  title={''}
                  showDetailButton
                  placement='right'
                  onClick={() => setOutdoor6gDrawerVisible(true)}
                  icon={<QuestionMarkCircleOutlined
                    style={{ height: '16px', width: '16px' }}
                  />}
                />}
                {isR370Unsupported6gFeatures &&
                <ApCompatibilityDrawer
                  visible={outdoor6gDrawerVisible}
                  type={(context === 'venue' || context === 'apGroup')
                    ? ApCompatibilityType.VENUE
                    : ApCompatibilityType.ALONE}
                  venueId={venueId}
                  featureNames={[InCompatibilityFeatures.OUTDOOR_6G_CHANNEL]}
                  onClose={() => setOutdoor6gDrawerVisible(false)}
                />}
              </Space>
            </Col>
            {outdoorChannelErrMsg &&
              <Col span={6}>
                <div style={{ color: cssStr('--acx-semantics-red-50') }}>
                  {outdoorChannelErrMsg}
                </div>
              </Col>
            }
          </Row>
          <Row gutter={20}>
            <Col span={channelColSpan}>
              {channelBandwidth !== '320MHz' ?
                <RadioSettingsChannels
                  formName={allowedOutdoorChannelsFieldName}
                  groupSize={groupSize}
                  channelList={outdoorChannelList}
                  displayBarSettings={displayRadioBarSettings}
                  channelBars={outdoorChannelBars}
                  disabled={inherit5G || disabled}
                  handleChanged={handleChanged}
                  afcProps={afcProps}
                /> :
                <RadioSettingsChannels320Mhz
                  context={context}
                  formName={allowedOutdoorChannelsFieldName}
                  channelList={outdoorChannelList}
                  disabled={inherit5G || disabled || isUseVenueSettings}
                  handleChanged={handleChanged}
                  afcProps={afcProps}
                />
              }
            </Col>
          </Row>
        </>
        }
        {combinChannels &&
        <>
          <Row gutter={20} style={{ paddingTop: '10px' }}>
            <Col span={4}>
              <div>{$t({ defaultMessage: 'Indoor & Outdoor APs' })}</div>
            </Col>
            {indoorChannelErrMsg &&
            <Col span={6}>
              <div style={{ color: cssStr('--acx-semantics-red-50') }}>
                {indoorChannelErrMsg}
              </div>
            </Col>
            }
          </Row>
          <Row gutter={20}>
            <Col span={channelColSpan}>
              <RadioSettingsChannels
                formName={allowedIndoorChannelsFieldName}
                groupSize={groupSize}
                channelList={indoorChannelList}
                displayBarSettings={displayRadioBarSettings}
                channelBars={indoorChannelBars}
                disabled={inherit5G || disabled}
                handleChanged={handleChanged}
                afcProps={afcProps}
              />
            </Col>
          </Row>
        </>
        }
      </>
      }
      {!isSupportRadio &&
        <div data-testid={testId}>
          {$t({ defaultMessage: 'This band is not supported for APs in current country' })}
        </div>
      }
    </>
  )
}
