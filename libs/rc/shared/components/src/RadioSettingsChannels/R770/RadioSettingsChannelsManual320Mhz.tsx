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
  formName: string[],
  channelBandwidth320MhzGroupFieldName: string[]
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


  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [checkedGroup, setCheckGroup] = useState('320MHz-1')
  const [checkedChannel, setCheckedChannel] = useState([] as CheckboxValueType[])

  let { disabled = false } = props

  const handleClickGroupChannels = (event: RadioChangeEvent) => {
    setCheckGroup(event.target.value)
    form.setFieldValue(props.channelBandwidth320MhzGroupFieldName, event.target.value)
    if(_.intersection(ChannelGroup_320MHz_Manual[event.target.value], checkedChannel)) {
      return
    }
    else {
      form.setFieldValue(props.formName, [])
      setCheckedChannel([])
    }
    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })
  }

  const filterUnselectedChannels = (channels: RadioChannel[]) : string [] => {
    const selectedChannels = [] as string[]
    channels.forEach((channel)=> {
      if (channel.selected === true) {
        selectedChannels.push(channel.value)
      }
    })

    if (selectedChannels.length > 1) {
      return _.castArray(selectedChannels[0])
    }

    return selectedChannels
  }

  const handleChannelChange = (checkedValues: CheckboxValueType[]) => {
    const diff = _.difference(checkedValues, checkedChannel)
    setCheckedChannel(diff)
    form.setFieldValue(props.formName, diff)
    // notify data is changed
    setEditContextData({
      ...editContextData,
      isDirty: true
    })
  }

  useEffect(()=> {
    const selectedChannels = filterUnselectedChannels(props.channelList)
    if (selectedChannels) {
      setCheckedChannel(selectedChannels)
    }

    const group = form.getFieldValue(props.channelBandwidth320MhzGroupFieldName)
    if(group) {
      setCheckGroup(group)
    }
  }, [])

  return(<>
    <Radio.Group onChange={handleClickGroupChannels} value={checkedGroup}>
      <Row>
        <Radio data-testid={'320MHz-1-radio'} value={'320MHz-1'}>320MHz-1</Radio>
      </Row>
      {(checkedGroup === '320MHz-1') && <Row>
        <Col span={14}>
          <CheckboxGroup
            value={checkedChannel}
            disabled={disabled}
            data-testid={'320MHz-1-checkboxgroup'}
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
        <Radio data-testid={'320MHz-2-radio'} value={'320MHz-2'}>320MHz-2</Radio>
      </Row>
      {(checkedGroup === '320MHz-2') && <Row>
        <Col span={14}>
          <CheckboxGroup
            value={checkedChannel}
            disabled={disabled}
            data-testid={'320MHz-2-checkboxgroup'}
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
    </Radio.Group>
    <Form.Item name={props.channelBandwidth320MhzGroupFieldName} hidden/>
    <Form.Item name={props.formName} hidden/>
  </>
  )
}