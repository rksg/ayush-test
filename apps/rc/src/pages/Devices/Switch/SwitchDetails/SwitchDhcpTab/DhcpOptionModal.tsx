import { useEffect, useMemo, useState } from 'react'

import { Form, Input, Radio, RadioChangeEvent, Select, Space } from 'antd'
import { Rule }                                                from 'antd/lib/form'
import { useIntl }                                             from 'react-intl'

import { Modal }     from '@acx-ui/components'
import {
  DHCP_OPTION_TYPE,
  getDhcpOptionList,
  serverIpAddressRegExp,
  SwitchDhcpOption
} from '@acx-ui/rc/utils'


const validatorMap: { [key in DHCP_OPTION_TYPE]: Rule[] } = {
  ASCII: [
    { required: true },
    { type: 'string', max: 128 }
  ],
  HEX: [
    { required: true },
    { type: 'string', max: 128, min: 2 },
    { pattern: /^[A-Fa-f0-9]+$/ }
  ],
  IP: [
    { required: true },
    { validator: (_, value) => dhcpOptionIpsValidation(value) }
  ],
  INTEGER: [
    { required: true },
    { type: 'integer', transform: Number }
  ],
  BOOLEAN: [
    { required: true },
    { type: 'enum', enum: ['0', '1'] }
  ]
}

export async function dhcpOptionIpsValidation(value: string) {
  if (value) {
    const ipArray = value.split(' ')
    for (let ip of ipArray) {
      try {
        await serverIpAddressRegExp(ip)
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
  return Promise.resolve()
}

export function DhcpOptionModal (props: {
  open: boolean,
  onSave?:(values: SwitchDhcpOption)=>void
  onCancel?: ()=>void,
  editRecord?: SwitchDhcpOption
  currrentRecords?: SwitchDhcpOption[]
}) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [optionState, setOptionState] = useState<DHCP_OPTION_TYPE[]>()
  const [valueValidator, setValueValidator] = useState<Rule[]>()
  const [isDirty, setDirty] = useState(false)

  const DHCP_OPTIONS = useMemo(() => getDhcpOptionList(), [])

  const seqOptions = useMemo(() => {
    const currrentSeqs = props.currrentRecords?.map(r=>r.seq) || []
    return Object.entries(DHCP_OPTIONS)
      .map(([idx, item])=>({
        label: <><b>{idx}</b> {item.label}</>,
        forSearch: `${idx} ${item.label}`,
        value: item.value,
        disabled: currrentSeqs.includes(item.value) && props.editRecord?.seq !== item.value
      }))
  }, [props.currrentRecords, props.editRecord])

  useEffect(()=>{
    form.resetFields()
    setOptionState(undefined)
    setValueValidator(undefined)
    setDirty(false)
    if (props.open && props.editRecord) {
      form.setFieldsValue(props.editRecord)
      const option = DHCP_OPTIONS[props.editRecord.seq as keyof typeof DHCP_OPTIONS]
      setOptionState(option.type)
    }
  }, [form, props.open, props.editRecord])

  useEffect(()=>{
    if (optionState) {
      const firstEnabledOption = optionState[0]
      form.setFieldValue('type', firstEnabledOption)
      setValueValidator(validatorMap[firstEnabledOption])
    }
  }, [form, optionState])

  useEffect(()=>{
    if (valueValidator && isDirty) {
      form.resetFields(['value'])
    }
  }, [form, valueValidator, isDirty])

  const onSeqChange = (value: number) => {
    setDirty(true)
    const option = DHCP_OPTIONS[value as keyof typeof DHCP_OPTIONS]
    setOptionState(option.type)
  }
  const onTypeChange = (e: RadioChangeEvent) => {
    setDirty(true)
    setValueValidator(validatorMap[e.target.value as DHCP_OPTION_TYPE])
  }

  return (
    <Modal
      visible={props.open}
      maskClosable={false}
      onOk={()=>form.submit()}
      onCancel={props.onCancel}
      title={props.editRecord ?
        $t({ defaultMessage: 'Edit DHCP Option' }) :
        $t({ defaultMessage: 'Add DHCP Option' })}
    >
      <Form layout='horizontal'
        labelCol={{ span: 6 }}
        form={form}
        onFinish={props.onSave}>
        <Form.Item name='seq'
          label={$t({ defaultMessage: 'DHCP Option' })}
          rules={[{ required: true }]}
          children={<Select showSearch
            placeholder={$t({ defaultMessage: 'Select option from list' })}
            filterOption={(input, option) =>
              (option?.forSearch ?? '').toLowerCase().includes(input.toLowerCase())
            }
            onChange={onSeqChange}
            options={seqOptions}/>}
        />
        <Form.Item name='type'
          label={$t({ defaultMessage: 'Value Format' })}
          children={<Radio.Group onChange={onTypeChange} disabled={!optionState}>
            <Space direction='vertical'>
              <Radio value={DHCP_OPTION_TYPE.ASCII}
                disabled={!optionState?.includes(DHCP_OPTION_TYPE.ASCII)}>
                {$t({ defaultMessage: 'ASCII' })}</Radio>
              <Radio value={DHCP_OPTION_TYPE.HEX}
                disabled={!optionState?.includes(DHCP_OPTION_TYPE.HEX)}>
                {$t({ defaultMessage: 'HEX' })}</Radio>
              <Radio value={DHCP_OPTION_TYPE.IP}
                disabled={!optionState?.includes(DHCP_OPTION_TYPE.IP)}>
                {$t({ defaultMessage: 'IP' })}</Radio>
              <Radio value={DHCP_OPTION_TYPE.INTEGER}
                disabled={!optionState?.includes(DHCP_OPTION_TYPE.INTEGER)}>
                {$t({ defaultMessage: 'Integer' })}</Radio>
              <Radio value={DHCP_OPTION_TYPE.BOOLEAN}
                disabled={!optionState?.includes(DHCP_OPTION_TYPE.BOOLEAN)}>
                {$t({ defaultMessage: 'Boolean' })}</Radio>
            </Space>
          </Radio.Group>}
        />
        <Form.Item name='value'
          label={$t({ defaultMessage: 'Option Value' })}
          rules={valueValidator}
          children={<Input disabled={!optionState} />}
        />
      </Form>
    </Modal>
  )
}
