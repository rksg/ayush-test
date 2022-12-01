
import { useContext, useEffect, useState } from 'react'

import { Col, Row, Form, Switch } from 'antd'
import { isEmpty }                from 'lodash'
import { useIntl }                from 'react-intl'

import { Button, cssStr }         from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { RadioSettingsChannels }  from '@acx-ui/rc/components'

import { VenueEditContext } from '../../..'
import {
  ApRadioTypeDataKeyMap,
  ApRadioTypeEnum, ChannelBars,
  RadioChannel,
  SelectItemOption,
  split5GChannels
} from '../contents'

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

export function SingleRadioSettings (props:{
  context?: string,
  disable?: boolean,
  inherit5G?: boolean,
  radioType: ApRadioTypeEnum,
  bandwidthOptions: SelectItemOption[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supportChannels: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editContext: React.Context<any>,
  onResetDefaultValue?: Function
}) {

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { disable = false, inherit5G = false, context = 'venue' } = props
  const { radioType, supportChannels, bandwidthOptions, editContext } = props
  const isSupportRadio = bandwidthOptions?.length > 0
  const displayRadioBarSettings = ['5G', 'DFS']
  const radioDataKey = ApRadioTypeDataKeyMap[radioType]

  const methodFieldName = [...radioDataKey, 'method']
  const channelBandwidthFieldName = [...radioDataKey, 'channelBandwidth']
  const allowedChannelsFieldName = [...radioDataKey, 'allowedChannels']
  const allowedIndoorChannelsFieldName = [...radioDataKey, 'allowedIndoorChannels']
  const allowedOutdoorChannelsFieldName = [...radioDataKey, 'allowedOutdoorChannels']

  const [channelList, setChannelList] = useState<RadioChannel[]>([])
  const [indoorChannelList, setIndoorChannelList] = useState<RadioChannel[]>([])
  const [outdoorChannelList, setOutdoorChannelList] = useState<RadioChannel[]>([])
  const [channelBars, setChannelBars] = useState({ ...initChannelBars })
  const [indoorChannelBars, setIndoorChannelBars] = useState({ ...initChannelBars })
  const [outdoorChannelBars, setOutdoorChannelBars] = useState({ ...initChannelBars })

  const [groupSize, setGroupSize] = useState(1)
  const [oldBandwidth, setOldBandwidth] = useState<string>()
  const [channelErrMsg, setChannelErrMsg] = useState<string>()
  const [indoorChannelErrMsg, setIndoorChannelErrMsg] = useState<string>()
  const [outdoorChannelErrMsg, setOutdoorChannelErrMsg] = useState<string>()

  const {
    editContextData,
    setEditContextData
  } = useContext(editContext)


  let bandwidthList: string[] = []
  let hasIndoorBandwidth = false
  let hasOutdoorBandwidth = false
  let hasDfsBandwidth = false
  let allowIndoorForOutdoor = false
  let hasIndoorForOutdoor = false

  let bandwidthIndoorList = []
  let bandwidthOutdoorList = []
  let bandwidthDfsList = []

  const allowIndoorForOutdoorFeatureFlag = useIsSplitOn(Features.ALLOW_INDOOR_CHANNEL_TOGGLE)

  if (context === 'venue') {
    const { indoor, outdoor, dfs, indoorForOutdoorAp } = supportChannels
    hasIndoorBandwidth = !isEmpty(indoor)
    hasOutdoorBandwidth = !isEmpty(outdoor)
    hasDfsBandwidth = !isEmpty(dfs)
    hasIndoorForOutdoor = !isEmpty(indoorForOutdoorAp)

    if (!hasIndoorBandwidth && !hasOutdoorBandwidth) {
      bandwidthList = Object.keys(supportChannels)
    }

    bandwidthIndoorList = hasIndoorBandwidth? Object.keys(indoor) : []
    bandwidthOutdoorList = hasOutdoorBandwidth? Object.keys(outdoor) : []
    bandwidthDfsList = hasDfsBandwidth? Object.keys(dfs): []
    allowIndoorForOutdoor = (radioType === ApRadioTypeEnum.Radio5G
                             && hasIndoorForOutdoor === true
                             && allowIndoorForOutdoorFeatureFlag)

  } else {// context === 'ap'
    bandwidthList = Object.keys(supportChannels)
  }

  /*
  const showChannelBarCOntrolLink = (radioType !== ApRadioTypeEnum.Radio24G &&
                                     radioType !== ApRadioTypeEnum.Radio6G)

  */

  const [
    channelMethod,
    channelBandwidth,
    allowedChannels,
    allowedIndoorChannels,
    allowedOutdoorChannels
  ] = [
    useWatch<string>(methodFieldName),
    useWatch<string>(channelBandwidthFieldName),
    useWatch<string[]>(allowedChannelsFieldName),
    useWatch<string[]>(allowedIndoorChannelsFieldName),
    useWatch<string[]>(allowedOutdoorChannelsFieldName)
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

    const showChannelBarRadios = [
      ApRadioTypeEnum.Radio5G,
      ApRadioTypeEnum.RadioLower5G,
      ApRadioTypeEnum.RadioUpper5G]

    if (!isEmpty(supportChannels)) {
      const bandwidth = (channelBandwidth === 'AUTO')? 'auto' : channelBandwidth

      const gz = (radioType === ApRadioTypeEnum.Radio24G) ? 1 : HzToSizeMap[bandwidth]
      setGroupSize(gz)

      if ( !hasIndoorBandwidth && !hasOutdoorBandwidth ) {
        const availableCannels = supportChannels[bandwidth]
        const selectedChannels = setSelectedChannels(availableCannels)

        const isShowChannelBar = showChannelBarRadios.includes(radioType)
        if (isShowChannelBar) {
          const chBars = Object.assign(channelBars, split5GChannels(availableCannels))
          chBars.dfsChannels = []
          setIndoorChannelBars(chBars)
        }

        setChannelList(selectedChannels)
        if (oldBandwidth !== bandwidth) {
          if (oldBandwidth) {
            form.setFieldValue(allowedChannelsFieldName, availableCannels)
          }
          setOldBandwidth(bandwidth)
        }
      } else {
        const { indoor, outdoor, dfs } = supportChannels
        const availableDfsChannels = dfs[bandwidth] || []

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

        if (oldBandwidth !== bandwidth) {
          if (oldBandwidth) {
            form.setFieldValue(allowedIndoorChannelsFieldName, availableIndoorChannels)
            form.setFieldValue(allowedOutdoorChannelsFieldName, availableOutdoorChannels)
          }
          setOldBandwidth(bandwidth)
        }
      }
    }

  }, [supportChannels, channelBandwidth, radioType])

  useEffect(() => {
    const validateChannels = (channelList: string[]) => {
      let errorMessage = ''
      if (channelList && channelList.length < 2) {
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

  }, [allowedChannels, allowedIndoorChannels, allowedOutdoorChannels])

  const resetToDefaule = () => {
    if (props.onResetDefaultValue) {
      props.onResetDefaultValue(radioType)
    }
  }

  return (
    <>
      {
        isSupportRadio &&
      <>
        <Row gutter={20}>
          <Col span={8}>
            <RadioSettingsForm
              radioType={radioType}
              radioDataKey={radioDataKey}
              disabled={inherit5G || disable}
              channelBandwidthOptions={bandwidthOptions}
            />
          </Col>
          { context === 'venue' && !inherit5G && !disable &&
          <Col offset={2} span={6} style={{ paddingTop: '20px' }}>
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
          {channelErrMsg &&
            <Col span={6}>
              <div style={{ color: cssStr('--acx-semantics-red-50') }}>
                {channelErrMsg}
              </div>
            </Col>
          }
        </Row>
        <Row gutter={20}>
          <Col span={14}>
            <div style={{ color: cssStr('--acx-neutrals-50') }}>
              {
                (context === 'venue')?
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Selected channels will be available for radio broadcasting in this venue. Hover to see overlapping channels' }) :
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Selected channels will be available for radio broadcasting in this AP. Hover to see overlapping channels' })
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
              <Form.Item>
                <Switch
                  onClick={(checked, event) => {
                    event.stopPropagation()
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        }
        {!hasIndoorBandwidth && !hasOutdoorBandwidth &&
          <Row gutter={20}>
            <Col span={18}>
              <RadioSettingsChannels
                formName={allowedChannelsFieldName}
                groupSize={groupSize}
                channelList={channelList}
                displayBarSettings={displayRadioBarSettings}
                channelBars={channelBars}
                disabled={inherit5G || disable}
                editContext={VenueEditContext}
              />
            </Col>
          </Row>
        }
        {hasIndoorBandwidth &&
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
            <Col span={18}>
              <RadioSettingsChannels
                formName={allowedIndoorChannelsFieldName}
                groupSize={groupSize}
                channelList={indoorChannelList}
                displayBarSettings={displayRadioBarSettings}
                channelBars={indoorChannelBars}
                disabled={inherit5G || disable}
                editContext={VenueEditContext}
              />
            </Col>
          </Row>
        </>
        }
        {hasOutdoorBandwidth &&
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
            <Col span={18}>
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
      </>
      }
      {!isSupportRadio &&
        <div>
          {$t({ defaultMessage: 'This band is not supported for APs in current country' })}
        </div>
      }
    </>
  )
}