import { useEffect, useState, useContext } from 'react'

import { Col, Row, Form, Checkbox } from 'antd'
import _                            from 'lodash'
import { useIntl }                  from 'react-intl'

import { Tooltip } from '@acx-ui/components'


import { CheckboxGroupFor320Mhz } from '../styledComponents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

interface RadioChannel {
  value: string;
  selected: boolean;
}
type ChannelGroup = {
  [key: string] : string[]
}
/* eslint-disable max-len */
const ChannelGroup_320MHz: ChannelGroup = {
  31: ['1', '5', '9', '13', '17', '21', '25', '29', '33', '37', '41', '45', '49', '53', '57', '61'],
  63: ['33', '37', '41', '45', '49', '53', '57', '61', '65', '69', '73', '77', '81', '85', '89', '93'],
  95: ['65', '69', '73', '77', '81', '85', '89', '93', '97', '101', '105', '109', '113', '117', '121', '125'],
  127: ['97', '101', '105', '109', '113', '117', '121', '125', '129', '133', '137', '141', '145', '149', '153', '157'],
  159: ['129', '133', '137', '141', '145', '149', '153', '157', '161', '165', '169', '173', '177', '181', '185', '189'],
  191: ['161', '165', '169', '173', '177', '181', '185', '189', '193', '197', '201', '205', '209', '213', '217', '221']
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

const setSelectedCannelGroupCheckBox = (defaultSelectedChannels: string[]): CheckboxValueType[] => {
  let checkedChannelGroup = [] as CheckboxValueType[]
  // 改成全測 intersection
  _.forIn(ChannelGroup_320MHz, function (value, key) {
    const shouldCheckboxBeChecked = _.intersection(value, defaultSelectedChannels).length === 16
    if (shouldCheckboxBeChecked) {
      checkedChannelGroup.push(key)
    }
  })
  console.log(`Default Gourp: ${checkedChannelGroup}`)
  return checkedChannelGroup
}
/* eslint-enable max-len */
export function RadioSettingsChannels320Mhz (props: {
  context?: string
  formName: string[],
  channelList: RadioChannel[],
  disabled?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editContext: React.Context<any>,
  channelMethod?: string
}) {
  let { disabled = false, formName, channelList } = props

  const {
    editContextData,
    setEditContextData
  } = useContext(props.editContext)

  const form = Form.useFormInstance()

  const [checkedChannelGroup, setCheckedChannelGroup] = useState([] as CheckboxValueType[])
  const [selectedChannels, setSelectedChannels] = useState([] as string[])

  useEffect(()=> {

    setSelectedChannels(filterUnselectedChannels(channelList))

    form.setFieldValue(formName, selectedChannels)

    const unsavedCheckedChannelGroup = setSelectedCannelGroupCheckBox(selectedChannels)

    setCheckedChannelGroup(unsavedCheckedChannelGroup)

  }, [])

  const handleClickGroupChannels = (checkedValues: CheckboxValueType[]) => {

    const unselectChannel = _.head(_.difference(checkedChannelGroup, checkedValues)) as string

    if (unselectChannel) {
      setSelectedChannels(
        _.difference(selectedChannels, ChannelGroup_320MHz[unselectChannel])
      )
    }

    const selectChannel = _.head(_.difference(checkedValues, checkedChannelGroup))

    if (selectChannel) {

    }


    // _.forIn(ChannelGroup_320MHz, function (value, key) {
    //   const shouldAppendSelectedChannels = checkedValues.includes(key)
    //   if (shouldAppendSelectedChannels) {
    //     selectedChannels = selectedChannels.concat(value)
    //   }
    // })
    const sortedSelectedChannels = _.sortedUniq(selectedChannels)
    console.log(`Onchange Select Channels: ${sortedSelectedChannels}`)
    console.log(`Onchange Select Group: ${checkedValues}`)

    form.setFieldValue(props.formName, sortedSelectedChannels)
    setCheckedChannelGroup(checkedValues)

    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })
  }


  return (
    <CheckboxGroupFor320Mhz
      style={{ width: '100%' }}
      disabled={disabled}
      onChange={handleClickGroupChannels}
      value={checkedChannelGroup}
    >
      <div style={{ marginTop: '10px' }}>
        <Row style={
          { marginBottom: '10px',
            backgroundColor: '#FEF6ED',
            height: '50px',
            paddingTop: '10px' }}>
          <Col span={2}>
            <p style={{ lineHeight: '30px', margin: '0px' }}>320 MHz-1</p>
          </Col>
          <Col span={6}>
            <Checkbox value={'31'}>
              <TooltipFor320Mhz
                channelGroupNumber={'31'}
                availability={checkedChannelGroup.includes('31')}
              />
            </Checkbox>
          </Col>
          <Col span={6}>
            <Checkbox value={'95'}>
              <TooltipFor320Mhz
                channelGroupNumber={'95'}
                availability={checkedChannelGroup.includes('95')}
              />
            </Checkbox>
          </Col>
          <Col span={6}>
            <Checkbox value={'159'}>
              <TooltipFor320Mhz
                channelGroupNumber={'159'}
                availability={checkedChannelGroup.includes('159')}
              />
            </Checkbox>
          </Col>
        </Row>
        <Row style={
          { marginBottom: '10px',
            backgroundColor: '#FEF6ED',
            height: '50px',
            paddingTop: '10px' }}>
          <Col span={2}>
            <p style={{ lineHeight: '30px', margin: '0px' }}>320 MHz-2</p>
          </Col>
          <Col span={6} offset={3}>
            <Checkbox value={'63'}>
              <TooltipFor320Mhz
                channelGroupNumber={'63'}
                availability={checkedChannelGroup.includes('63')}
              />
            </Checkbox>
          </Col>
          <Col span={6}>
            <Checkbox value={'127'}>
              <TooltipFor320Mhz
                channelGroupNumber={'127'}
                availability={checkedChannelGroup.includes('127')}
              />
            </Checkbox>
          </Col>
          <Col span={6}>
            <Checkbox value={'191'}>
              <TooltipFor320Mhz
                channelGroupNumber={'191'}
                availability={checkedChannelGroup.includes('191')}
              />
            </Checkbox>
          </Col>
        </Row>
      </div>
    </CheckboxGroupFor320Mhz>
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

function TooltipFor320Mhz (props: {
  channelGroupNumber: string,
  availability: boolean
}) {

  const { $t } = useIntl()
  const { channelGroupNumber, availability } = props

  const message = availability ?
    $t({ defaultMessage: 'Disable this channel' }) :
    $t({ defaultMessage: 'Enable this channel' })

  return (
    <Tooltip
      title={
        <div style={{ textAlign: 'center' }}>
          <p>{buildTooltipMessage(message, ChannelGroup_320MHz[channelGroupNumber])}</p>
        </div>
      }
    >
      {channelGroupNumber}
    </Tooltip>
  )

}