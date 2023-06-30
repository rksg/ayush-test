import { useEffect, useState } from 'react'

import { Form, Input, InputNumber, Radio, RadioChangeEvent, Select } from 'antd'
import { useIntl }                                                   from 'react-intl'

import { Modal }                from '@acx-ui/components'
import {
  AclExtendedRule,
  AclStandardRule,
  validateAclRuleSequence,
  validateSwitchStaticRouteIp
} from '@acx-ui/rc/utils'

export function ACLRuleModal (props: {
  open: boolean,
  aclType: string,
  onSave?:(values: AclStandardRule | AclExtendedRule)=>void,
  onCancel?: ()=>void,
  editRecord?: AclStandardRule | AclExtendedRule
  currrentRecords?: AclStandardRule[] | AclExtendedRule[]
}) {
  const { Option } = Select
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [sourceSpecific, setSourceSpecific] = useState(false)
  const [destinationSpecific, setDestinationSpecific] = useState(false)
  const [disabledField, setDisabledField] = useState(true)

  useEffect(()=>{
    form.resetFields()
    setSourceSpecific(false)
    setDestinationSpecific(false)
    if (props.open && props.editRecord) {
      form.setFieldsValue(props.editRecord)
    }
  }, [form, props.open, props.editRecord])

  const onSrcSourceChange = (e: RadioChangeEvent) => {
    setSourceSpecific(e.target.value === 'specific')
  }

  const onDestSourceChange = (e: RadioChangeEvent) => {
    setDestinationSpecific(e.target.value === 'specific')
  }

  const onProtocolChange = function (value: string) {
    setDisabledField(value === 'ip')
  }

  return (
    <Modal
      visible={props.open}
      maskClosable={false}
      onOk={()=>form.submit()}
      onCancel={props.onCancel}
      destroyOnClose={true}
      title={props.editRecord ?
        $t({ defaultMessage: 'Edit Rule' }) :
        $t({ defaultMessage: 'Add Rule' })}
    >
      <Form layout='vertical'
        labelCol={{ span: 8 }}
        form={form}
        onFinish={props.onSave}
      >
        <Form.Item name='sequence'
          label={$t({ defaultMessage: 'Sequence' })}
          rules={[
            { required: true },
            { validator: (_, value) => {
              if(props.editRecord?.sequence !== value && props.currrentRecords) {
                return validateAclRuleSequence(value, props.currrentRecords)
              }else {
                return Promise.resolve()
              }
            }
            }
          ]}
          children={
            <InputNumber
              type='number'
              min={1}
              max={65000}
              style={{ width: '100%' }}
              placeholder={$t({ defaultMessage: 'Between 1-65000' })}
            />
          }
        />
        <Form.Item
          name='action'
          label={$t({ defaultMessage: 'Action' })}
          initialValue={'permit'}
          children={<Radio.Group>
            <Radio value={'permit'}>
              {$t({ defaultMessage: 'Permit' })}
            </Radio>
            <Radio value={'deny'}>
              {$t({ defaultMessage: 'Deny' })}
            </Radio>
          </Radio.Group>} />
        <Form.Item
          name='protocol'
          hidden={props.aclType === 'standard'}
          label={$t({ defaultMessage: 'Protocol' })}
          initialValue={'ip'}
          children={
            <Select onChange={onProtocolChange}>
              <Option value={'ip'}>
                {$t({ defaultMessage: 'IP' })}</Option>
              <Option value={'tcp'}>
                {$t({ defaultMessage: 'TCP' })}</Option>
              <Option value={'udp'}>
                {$t({ defaultMessage: 'UDP' })}</Option>
            </Select>
          }
        />
        <Form.Item
          name='source'
          label={$t({ defaultMessage: 'Source Network' })}
          initialValue={'any'}
          children={<Radio.Group onChange={onSrcSourceChange}>
            <Radio value={'any'}>
              {$t({ defaultMessage: 'Any' })}
            </Radio>
            <Radio value={'specific'}>
              {$t({ defaultMessage: 'Specific Subnet' })}
            </Radio>
          </Radio.Group>} />
        {sourceSpecific && <Form.Item
          name='specificSrcNetwork'
          initialValue=''
          rules={[
            { required: sourceSpecific },
            { validator: (_, value) => sourceSpecific &&
              validateSwitchStaticRouteIp(value) }
          ]}
          children={<Input placeholder={$t({ defaultMessage: 'e.g 1.1.1.1/24' })}/>}
        />}
        {props.aclType === 'extended' &&
         <>
           <Form.Item
             name='destination'
             label={$t({ defaultMessage: 'Destination Network' })}
             initialValue={'any'}
             children={<Radio.Group onChange={onDestSourceChange}>
               <Radio value={'any'}>
                 {$t({ defaultMessage: 'Any' })}
               </Radio>
               <Radio value={'specific'}>
                 {$t({ defaultMessage: 'Specific Subnet' })}
               </Radio>
             </Radio.Group>}
           />
           {destinationSpecific && <Form.Item
             name='specificDestNetwork'
             initialValue=''
             rules={[
               { required: destinationSpecific },
               { validator: (_, value) => destinationSpecific &&
                validateSwitchStaticRouteIp(value) }
             ]}
             children={<Input placeholder={$t({ defaultMessage: 'e.g 1.1.1.1/24' })}/>}
           />}
           <Form.Item
             name='sourcePort'
             initialValue=''
             label={$t({ defaultMessage: 'Source Port' })}
             children={
               <InputNumber
                 type='number'
                 min={1}
                 max={65535}
                 style={{ width: '100%' }}
                 disabled={disabledField}
               />
             }
           />
           <Form.Item
             name='destinationPort'
             initialValue=''
             label={$t({ defaultMessage: 'Destination Port' })}
             children={
               <InputNumber
                 type='number'
                 min={1}
                 max={65535}
                 style={{ width: '100%' }}
                 disabled={disabledField}
               />}
           />
         </>
        }
      </Form>
    </Modal>
  )
}