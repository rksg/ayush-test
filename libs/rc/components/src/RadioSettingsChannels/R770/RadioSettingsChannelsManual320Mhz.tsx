import { useEffect, useState, useContext } from 'react'

import { Col, Row, Form } from 'antd'
import { Radio }          from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import { CheckboxGroup } from '../styledComponents'

import type { RadioChangeEvent }  from 'antd'
import type { CheckboxValueType } from 'antd/es/checkbox/Group'



type ChannelGroup = {
  [key: string] : string[]
}
interface RadioChannel {
  value: string;
  selected: boolean;
}

/* eslint-disable max-len */
const ChannelGroup_320MHz_Manual: ChannelGroup = {
  '320MHz-1': [
    '1', '5', '9', '13', '17', '21', '25', '29', '33', '37', '41', '45', '49', '53', '57', '61',
    '65', '69', '73', '77', '81', '85', '89', '93', '97', '101', '105', '109', '113', '117', '121', '125',
    '129', '133', '137', '141', '145', '149', '153', '157', '161', '165', '169', '173', '177', '181', '185', '189'
  ],
  '320MHz-2': [
    '33', '37', '41', '45', '49', '53', '57', '61', '65', '69', '73', '77', '81', '85', '89', '93',
    '97', '101', '105', '109', '113', '117', '121', '125', '129', '133', '137', '141', '145', '149', '153', '157',
    '161', '165', '169', '173', '177', '181', '185', '189', '193', '197', '201', '205', '209', '213', '217', '221'
  ]
}
/* eslint-enable max-len */

export function RadioSettingsChannelsManual320Mhz (props: {
  context?: string
  formName: string[],
  channelList: RadioChannel[],
  disabled?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editContext: React.Context<any>,
  channelMethod?: string

}) {

  const {
    editContextData,
    setEditContextData
  } = useContext(props.editContext)

  const [checkedChannel, setCheckedChannel] = useState([] as CheckboxValueType[])

  const filterUnselectedChannel = (channels: RadioChannel[]) : CheckboxValueType[] => {
    let selectedChannels = [] as CheckboxValueType[]
    channels.forEach((channel) => {
      if (channel.selected === true) {
        selectedChannels.push(channel.value)
      }
    })
    return selectedChannels
  }

  let { disabled = false, formName, channelList } = props

  const [checkedGroup, setCheckGroup] = useState('320MHz-1')
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const handleClickGroupChannels = (event: RadioChangeEvent) => {
    setCheckGroup(event.target.value)
    if(_.intersection(ChannelGroup_320MHz_Manual[event.target.value], checkedChannel)) {
      return
    }
    else {
      setCheckedChannel([])
    }
    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })
  }

  const handleChannelChange = (checkedValues: CheckboxValueType[]) => {
    setCheckedChannel(_.difference(checkedValues, checkedChannel))
    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })
  }

  useEffect(()=> {

    const defaultSelectedChannels = filterUnselectedChannel(channelList)
    if(!defaultSelectedChannels){
      form.setFieldValue(formName, defaultSelectedChannels)
    }
    setCheckedChannel(defaultSelectedChannels)
  }, [])



  return(
    <Radio.Group onChange={handleClickGroupChannels} value={checkedGroup}>
      <Row>
        <Radio value={'320MHz-1'}>320MHz-1</Radio>
      </Row>
      {(checkedGroup === '320MHz-1') && <Row>
        <Col span={14}>
          <CheckboxGroup
            value={checkedChannel}
            disabled={disabled}
            onChange={handleChannelChange}
            options={ChannelGroup_320MHz_Manual['320MHz-1'].map((value: string) => {
              return {
                label:
                <Tooltip
                  key={value}
                  title={disabled
                    ? ''
                    : (checkedChannel.includes(value)
                      ? $t({ defaultMessage: 'Disable this channel' })
                      : $t({ defaultMessage: 'Enable this channel' }))
                  }
                >
                  {value}
                </Tooltip>,
                value: value
              }
            })}
          />
        </Col>
      </Row>}
      <Row>
        <Radio value={'320MHz-2'}>320MHz-2</Radio>
      </Row>
      {(checkedGroup === '320MHz-2') && <Row>
        <Col span={14}>
          <CheckboxGroup
            value={checkedChannel}
            disabled={disabled}
            onChange={handleChannelChange}
            options={ChannelGroup_320MHz_Manual['320MHz-2'].map((value: string) => {
              return {
                label:
                <Tooltip
                  key={value}
                  title={disabled
                    ? ''
                    : (checkedChannel.includes(value)
                      ? $t({ defaultMessage: 'Disable this channel' })
                      : $t({ defaultMessage: 'Enable this channel' }))
                  }
                >
                  {value}
                </Tooltip>,
                value: value
              }
            })}
          />
        </Col>
      </Row>}
    </Radio.Group>)
}