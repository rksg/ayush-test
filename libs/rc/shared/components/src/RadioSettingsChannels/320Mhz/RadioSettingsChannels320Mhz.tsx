import { useEffect, useState, useContext } from 'react'

import { Col, Row, Form, Checkbox } from 'antd'
import _                            from 'lodash'
import { useIntl }                  from 'react-intl'


import { Tooltip } from '@acx-ui/components'

import { BarButton6G, CheckboxGroupFor320Mhz } from '../styledComponents'

import { defaultStates, ChannelGroup320MhzEnum, findIsolatedGroup } from './ChannelComponentStates'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

interface RadioChannel {
    value: string;
    selected: boolean;
}

const filterUnselectedChannels = (channels: RadioChannel[]) : string [] => {
  const selectedChannels = [] as string[]
  channels.forEach((channel)=> {
    if (channel.selected === true) {
      selectedChannels.push(channel.value)
    }
  })
  return selectedChannels
}

export function RadioSettingsChannels320Mhz (props: {
    context?: string
    formName: string[],
    channelList: RadioChannel[],
    disabled?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editContext: React.Context<any>,
}) {

  let { disabled = false, channelList } = props

  const {
    editContextData,
    setEditContextData
  } = useContext(props.editContext)

  const form = Form.useFormInstance()

  const [complexGroupChannelState, setComplexGroupChannelState] = useState(defaultStates)

  useEffect(()=> {
    let checked160MHzGroup = [] as CheckboxValueType[]
    let availableChannel = [] as CheckboxValueType[]

    const selectedChannels = form.getFieldValue(props.formName)
    const systemChannelOptions = filterUnselectedChannels(channelList)

    // Check does database has record, use the default if it's not.
    // Usually it will be all channel selected if database has no record.
    if (!selectedChannels) {
      availableChannel = availableChannel.concat(systemChannelOptions)
    } else {
      systemChannelOptions.forEach((option) => {
        if(selectedChannels.includes(option)) {
          availableChannel.push(option)
        }
      })
    }

    _.forIn(complexGroupChannelState.ChannelGroup_160MHz, (value, key) => {
      if(_.intersection(value.channels, availableChannel).length !== 0){
        checked160MHzGroup.push(key)
      }
    })

    let unsavedStates = _.cloneDeep(complexGroupChannelState)
    _.set(unsavedStates, 'enabledCheckbox', checked160MHzGroup)

    setComplexGroupChannelState(unsavedStates)
  }, [channelList, form, props.formName])

  const handleClick160MhzGroupChannels = (checkedValues: CheckboxValueType[]) => {
    let unsavedStates = _.cloneDeep(complexGroupChannelState)
    _.set(unsavedStates, 'enabledCheckbox', checkedValues)

    const isolatedChannel = findIsolatedGroup(checkedValues)

    if(isolatedChannel) {
      _.forIn(complexGroupChannelState.ChannelGroup_160MHz, (value, key) => {
        if (isolatedChannel.includes(key)){
          _.set(unsavedStates, `ChannelGroup_160MHz.${key}.isolated`, true)
        }
        else {
          _.set(unsavedStates, `ChannelGroup_160MHz.${key}.isolated`, false)
        }
      })
    }

    setComplexGroupChannelState(unsavedStates)
    form.setFieldValue(props.formName, unsavedStates.getEnabledChannels())
    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })

  }

  const handleClick320MhzGroupChannels = (event: React.MouseEvent) => {

    /* eslint-disable max-len */
    let channel160Groups = _.get(complexGroupChannelState, 'ChannelGroup_320MHz.' + event.currentTarget.id).channel160Groups

    const intersection = _.intersection(channel160Groups, complexGroupChannelState.enabledCheckbox)

    let unsavedStates = _.cloneDeep(complexGroupChannelState)

    let isolatedChannel = [] as CheckboxValueType[]

    /**
     * Once user click 320Mhz group botton, depends on the intersection with channel160Groups,
     * unselect when both two checkbox(160Mhz) is selected.
     *
     * On the contray, no matter only 1 or none heckbox is selected, both 160Mhz checkbox in the
     * channel160Groups will be selected.
     */
    if(intersection.length === 2) {
      let removeIntersection = _.difference(unsavedStates.enabledCheckbox, intersection)
      _.set(unsavedStates, 'enabledCheckbox', removeIntersection)

      isolatedChannel = findIsolatedGroup(removeIntersection)
    }

    else {
      const union = _.union(unsavedStates.enabledCheckbox, channel160Groups)
      _.set(unsavedStates, 'enabledCheckbox', union)
      isolatedChannel = findIsolatedGroup(union)
    }

    if(isolatedChannel) {
      _.forIn(complexGroupChannelState.ChannelGroup_160MHz, (value, key) => {
        if (isolatedChannel.includes(key)){
          _.set(unsavedStates, `ChannelGroup_160MHz.${key}.isolated`, true)
        }
        else {
          _.set(unsavedStates, `ChannelGroup_160MHz.${key}.isolated`, false)
        }
      })
    }

    setComplexGroupChannelState(unsavedStates)
    form.setFieldValue(props.formName, unsavedStates.getEnabledChannels())
    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })
  }

  function TooltipFor320Mhz (props: {
    channelGroupNumber: string,
    availability: boolean
  }) {

    const { $t } = useIntl()
    const { channelGroupNumber, availability } = props

    const message = availability ?
      $t({ defaultMessage: 'Disable this channel' }) :
      $t({ defaultMessage: 'Enable this channel' })
    /* eslint-disable max-len */
    return (
      <Tooltip
        title={
          <div style={{ textAlign: 'center' }}>
            <p>{buildTooltipMessage(message, complexGroupChannelState.ChannelGroup_160MHz[channelGroupNumber].channels)}</p>
          </div>
        }
      >
        {channelGroupNumber}
      </Tooltip>
    )

  }

  const render320MHzGroup = (assignedGroup: ChannelGroup320MhzEnum) => {
    let node: React.ReactNode[] = []
    _.forIn(complexGroupChannelState.ChannelGroup_320MHz, function (value, key){
      if(value.group === assignedGroup)
        node.push(
          <Col span={6}>
            <BarButton6G
              disabled={disabled}
              data-testid={`320-button-${key}`}
              onClick={handleClick320MhzGroupChannels}
              id={key}
            >
              {key}
            </BarButton6G>
          </Col>
        )
    })
    return node
  }

  const render160MHzGroup = () => {
    let node: React.ReactNode[] = []
    _.forIn(complexGroupChannelState.ChannelGroup_160MHz, function (value, key){
      node.push(
        <Col span={3}>
          <Checkbox
            disabled={disabled}
            className={value.isolated ? 'isolated' : ''}
            data-testid={`160-checkbox-${key}`}
            value={key}>
            <TooltipFor320Mhz
              channelGroupNumber={key}
              availability={complexGroupChannelState.enabledCheckbox.includes(key)}
            />
          </Checkbox>
        </Col>
      )
    })
    return node
  }

  return (<>
    <Form.Item name={props.formName} hidden/>
    <CheckboxGroupFor320Mhz
      style={{ width: '100%' }}
      disabled={disabled}
      onChange={handleClick160MhzGroupChannels}
      value={complexGroupChannelState.enabledCheckbox}
    >
      <div style={{ marginTop: '10px' }}>
        <Row style={
          { height: '30px' }}>
          <Col span={2}>
            <p>320 MHz-1</p>
          </Col>
          {render320MHzGroup(ChannelGroup320MhzEnum.Group1)}
        </Row>
        <Row style={
          { height: '50px' }}>
          <Col span={2}>
            <p>320 MHz-2</p>
          </Col>
          <Col span={3}></Col>
          {render320MHzGroup(ChannelGroup320MhzEnum.Group2)}
        </Row>
        <Row style={
          { height: '50px' }}>
          <Col span={2}></Col>
          {render160MHzGroup()}
        </Row>
      </div>
    </CheckboxGroupFor320Mhz>
  </>
  )
}


function buildTooltipMessage (message: string , channels: string[]) {
  channels.forEach((element, index, it) => {

    // Start with a newline and left parenthesis
    if(index === 0) {
      message += '\n('
    }

    message += `#${element}`

    // End it with right parenthesis
    // Don't put it behind the comma,
    // otherwise there will be redundant comma.
    if (index === it.length - 1) {
      message += ')'
    }

    else {
      message += ', '
    }
    // Start newline when message fill with eighth channel
    if(index === 7) {
      message += '\n'
    }
  })
  return message
}