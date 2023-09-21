import { useEffect, useState } from 'react'

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
  handleChanged?: () => void,
  channelMethod?: string
}) {

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [checkedGroup, setCheckGroup] = useState('320MHz-1')
  const [checkedChannel, setCheckedChannel] = useState([] as CheckboxValueType[])

  let { disabled = false, handleChanged } = props

  const handleClickGroupChannels = (event: RadioChangeEvent) => {
    const selected320MhzGroup = event.target.value
    setCheckGroup(selected320MhzGroup)
    form.setFieldValue(props.channelBandwidth320MhzGroupFieldName, selected320MhzGroup)

    // If 320MHz-1's channel is selected, and that channel is overlap with 320MHz-2
    // Keep that channel selected, clear state if it's not.
    if(!_.intersection(ChannelGroup_320MHz_Manual[selected320MhzGroup], checkedChannel)) {
      form.setFieldValue(props.formName, [])
      setCheckedChannel([])
    }

    // notify data is changed
    if(handleChanged) {
      handleChanged()
    }
  }


  const handleChannelChange = (checkedValues: CheckboxValueType[]) => {
    // Only one channel can be selected, use lodash difference will return new selected everytime
    // even default is nothing selected.
    const diff = _.difference(checkedValues, checkedChannel)
    setCheckedChannel(diff)
    form.setFieldValue(props.formName, diff)
    // notify data is changed
    if(handleChanged) {
      handleChanged()
    }
  }

  useEffect(()=> {
    const selectedChannels = form.getFieldValue(props.formName)

    if (selectedChannels) {
      setCheckedChannel(selectedChannels)
    }

    const group = form.getFieldValue(props.channelBandwidth320MhzGroupFieldName)
    if(group && group !== 'AUTO') {
      setCheckGroup(group)
    }
  }, [form, props.formName])

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
