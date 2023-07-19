/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Row, Form, Switch } from 'antd'
import { isEmpty }                from 'lodash'
import { useIntl }                from 'react-intl'

import { Button, cssStr }         from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { RadioSettingsChannels }       from '../RadioSettingsChannels'
import { findIsolatedGroupByChannel }  from '../RadioSettingsChannels/320Mhz/ChannelComponentStates'
import { RadioSettingsChannels320Mhz } from '../RadioSettingsChannels/320Mhz/RadioSettingsChannels320Mhz'
import {
  RadioSettingsChannelsManual320Mhz
} from '../RadioSettingsChannels/320Mhz/RadioSettingsChannelsManual320Mhz'

import { ChannelBarControlPopover } from './ChannelBarControlPopover'
import {
  ApRadioTypeDataKeyMap,
  ApRadioTypeEnum, ChannelBars,
  RadioChannel,
  SelectItemOption,
  split5GChannels,
  VenueRadioTypeDataKeyMap
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
  disable?: boolean,
  inherit5G?: boolean,
  radioType: ApRadioTypeEnum,
  bandwidthOptions: SelectItemOption[],
  supportChannels: any,
  editContext: React.Context<any>,
  onResetDefaultValue?: Function,
  testId?: string,
  isUseVenueSettings?: boolean,
  supportDfsChannels?: any
}) {

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const {
    disable = false,
    inherit5G = false,
    context = 'venue',
    isUseVenueSettings = false,
    testId } = props

  const {
    radioType,
    supportChannels,
    bandwidthOptions,
    editContext,
    supportDfsChannels } = props

  const {
    editContextData,
    setEditContextData
  } = useContext(editContext)

  const isSupportRadio = bandwidthOptions?.length > 0
  const radioDataKey = (context === 'venue') ?
    VenueRadioTypeDataKeyMap[radioType] : ApRadioTypeDataKeyMap[radioType]

  const methodFieldName = [...radioDataKey, 'method']
  const channelBandwidthFieldName = [...radioDataKey, 'channelBandwidth']
  const channelBandwidth320MhzGroupFieldName = [...radioDataKey, 'channelBandwidth320MhzGroup']
  const allowedChannelsFieldName = [...radioDataKey, 'allowedChannels']
  const allowedIndoorChannelsFieldName = [...radioDataKey, 'allowedIndoorChannels']
  const allowedOutdoorChannelsFieldName = [...radioDataKey, 'allowedOutdoorChannels']
  const combinChannelsFieldName = [...radioDataKey, 'combineChannels']

  const [displayRadioBarSettings, setDisplayRadioBarSettings] = useState(['5G', 'DFS'])
  const [channelList, setChannelList] = useState<RadioChannel[]>([])
  const [indoorChannelList, setIndoorChannelList] = useState<RadioChannel[]>([])
  const [outdoorChannelList, setOutdoorChannelList] = useState<RadioChannel[]>([])
  const [channelBars] = useState({ ...initChannelBars })
  const [indoorChannelBars, setIndoorChannelBars] = useState({ ...initChannelBars })
  const [outdoorChannelBars, setOutdoorChannelBars] = useState({ ...initChannelBars })

  const [groupSize, setGroupSize] = useState(1)

  const [channelErrMsg, setChannelErrMsg] = useState<string>()
  const [indoorChannelErrMsg, setIndoorChannelErrMsg] = useState<string>()
  const [outdoorChannelErrMsg, setOutdoorChannelErrMsg] = useState<string>()

  const previousChannelMethod = useRef<string>()
  const bandWidthOnChanged = useRef(false)
  const methodOnChanged = useRef(false)
  const combinChannelOnChanged = useRef(false)

  let hasIndoorBandwidth = false
  let hasOutdoorBandwidth = false
  let allowIndoorForOutdoor = false
  let hasIndoorForOutdoor = false

  const allowIndoorForOutdoorFeatureFlag = useIsSplitOn(Features.ALLOW_INDOOR_CHANNEL_TOGGLE)
  const Wifi7_320Mhz_FeatureFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_320MHZ)

  if (context === 'venue') {
    const { indoor, outdoor, indoorForOutdoorAp } = supportChannels
    hasIndoorBandwidth = !isEmpty(indoor)
    hasOutdoorBandwidth = !isEmpty(outdoor)
    hasIndoorForOutdoor = !isEmpty(indoorForOutdoorAp)

    allowIndoorForOutdoor = (radioType === ApRadioTypeEnum.Radio5G
                             && hasIndoorForOutdoor === true
                             && allowIndoorForOutdoorFeatureFlag)

  } else {// context === 'ap'
    //bandwidthList = Object.keys(supportChannels)
  }

  const showChannelBarControlLink = (radioType !== ApRadioTypeEnum.Radio24G &&
                                     radioType !== ApRadioTypeEnum.Radio6G)
  const channelColSpan = (radioType === ApRadioTypeEnum.Radio5G) ? 22 : 20


  const [
    channelMethod,
    channelBandwidth,
    allowedChannels,
    allowedIndoorChannels,
    allowedOutdoorChannels,
    combinChannels,
    channelBandwidth320MhzGroup
  ] = [
    useWatch<string>(methodFieldName),
    useWatch<string>(channelBandwidthFieldName),
    useWatch<string[]>(allowedChannelsFieldName),
    useWatch<string[]>(allowedIndoorChannelsFieldName),
    useWatch<string[]>(allowedOutdoorChannelsFieldName),
    useWatch<boolean>(combinChannelsFieldName),
    useWatch<string>(channelBandwidth320MhzGroupFieldName)
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

    if (radioType === ApRadioTypeEnum.Radio6G) {
      if (channelBandwidth === '320MHz' && channelMethod === 'MANUAL') {
        if (!channelBandwidth320MhzGroup || channelBandwidth320MhzGroup === 'AUTO') {
          form.setFieldValue(channelBandwidth320MhzGroupFieldName, '320MHz-1')
        }
      } else {
        form.setFieldValue(channelBandwidth320MhzGroupFieldName, 'AUTO')
      }
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

      const availableOutdoorChannels = outdoor[bandwidth]
      const selectedOutdoorChannels = setSelectedChannels(availableOutdoorChannels)
      setOutdoorChannelList(selectedOutdoorChannels)

      // eslint-disable-next-line max-len
      const outdoorChBars = Object.assign(outdoorChannelBars, split5GChannels(availableOutdoorChannels))
      outdoorChBars.dfsChannels = availableDfsChannels
      setOutdoorChannelBars(outdoorChBars)

      // the bandwidth value is changed
      if (bandWidthOnChanged.current) {
        form.setFieldValue(allowedIndoorChannelsFieldName, availableIndoorChannels)
        form.setFieldValue(allowedOutdoorChannelsFieldName, availableOutdoorChannels)
        bandWidthOnChanged.current = false
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
    const hasErrors = !isEmpty(errMsg + indoorErrMsg + outdoorErrMsg)
    setEditContextData({
      ...editContextData,
      hasError: hasErrors
    })
  }, [allowedChannels, allowedIndoorChannels, allowedOutdoorChannels, channelMethod])

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
    if(channelBandwidth === '320MHz' && Wifi7_320Mhz_FeatureFlag) {
      if (channelMethod === 'MANUAL' && context === 'ap') {
        return (
          <Row gutter={20}>
            <Col span={channelColSpan}>
              <RadioSettingsChannelsManual320Mhz
                formName={allowedChannelsFieldName}
                channelBandwidth320MhzGroupFieldName={channelBandwidth320MhzGroupFieldName}
                channelList={channelList}
                disabled={inherit5G || disable || isUseVenueSettings}
                editContext={editContext}
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
              disabled={inherit5G || disable || isUseVenueSettings}
              editContext={editContext}
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
              disabled={inherit5G || disable || isUseVenueSettings}
              editContext={editContext}
            />
          </Col>
        </Row>
      )
    }
  }

  return (
    <>
      {
        isSupportRadio &&
      <>
        <Row gutter={20} data-testid={testId}>
          <Col span={8}>
            <RadioSettingsForm
              radioType={radioType}
              radioDataKey={radioDataKey}
              disabled={inherit5G || disable}
              channelBandwidthOptions={bandwidthOptions}
              context={context}
              isUseVenueSettings={isUseVenueSettings}
              onGUIChanged={handleSettingGUIChanged}
            />
          </Col>
          { context === 'venue' && !inherit5G && !disable &&
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
                $t(
                  // eslint-disable-next-line max-len
                  { defaultMessage: 'Selected channels will be available for radio broadcasting in this {context}. Hover to see overlapping channels' },
                  { context: (context === 'venue')? 'venue' : 'AP' }
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
              <RadioSettingsChannels
                formName={allowedIndoorChannelsFieldName}
                groupSize={groupSize}
                channelList={indoorChannelList}
                displayBarSettings={displayRadioBarSettings}
                channelBars={indoorChannelBars}
                disabled={inherit5G || disable}
                editContext={editContext}
              />
            </Col>
          </Row>
        </>
        }
        {hasOutdoorBandwidth && !combinChannels &&
        <>
          <Row gutter={20}>
            <Col span={4}>
              <div>{$t({ defaultMessage: 'Outdoor APs' })}</div>
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
              <RadioSettingsChannels
                formName={allowedOutdoorChannelsFieldName}
                groupSize={groupSize}
                channelList={outdoorChannelList}
                displayBarSettings={displayRadioBarSettings}
                channelBars={outdoorChannelBars}
                disabled={inherit5G || disable}
                editContext={editContext}
              />
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
                disabled={inherit5G || disable}
                editContext={editContext}
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
