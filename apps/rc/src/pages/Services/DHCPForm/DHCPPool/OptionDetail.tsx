import { useState, useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Modal, StepsFormInstance } from '@acx-ui/components'
import {
  Button,
  StepsForm
} from '@acx-ui/components'
import { DHCPOption }         from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import { OptionList } from './OptionsTable'


export function OptionDetail (props:{
  optionData: DHCPOption[]
}) {
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const { optionData } = props
  const formRef = useRef<StepsFormInstance<DHCPOption>>()

  const [tableData, setTableData] = useState(optionData)
  const idValidator = async (value: string) => {
    const { id } = { id: 0, ...formRef.current?.getFieldsValue() }
    if(_.find(tableData, (item)=>{return id !== item.id && item.optId === value})){
      const entityName = $t({ defaultMessage: 'Option ID' })
      const key = 'optId'
      return Promise.reject($t(validationMessages.duplication, { entityName, key }))
    }
    return Promise.resolve()
  }
  const handleSaveData = () => {
    if(_.find(formRef.current?.getFieldsError(), (item)=>{return item.errors.length>0})){
      return false
    }
    const dhcpOption = formRef.current?.getFieldsValue()
    if(dhcpOption && !dhcpOption.id){
      dhcpOption.id = new Date().getTime()
    }
    const findIndex = _.findIndex(form.getFieldsValue()['dhcpOptions'],
      (item:DHCPOption)=>{return dhcpOption?.id === item.id})
    if(findIndex > -1){
      form.getFieldsValue()['dhcpOptions'][findIndex] = dhcpOption
    }
    else form.getFieldsValue()['dhcpOptions'].push({ ...dhcpOption })
    setTableData(form.getFieldsValue()['dhcpOptions'])
    onClose()
    return true
  }
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    formRef?.current?.resetFields()
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
  }
  const footer = [
    <Button key='back' onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>,
    <Button key='forward'
      onClick={
        async ()=>{
          await formRef.current?.validateFields()
          handleSaveData()
        }
      }>
      {$t({ defaultMessage: 'Save' })}
    </Button>
  ]
  const getContent=visible?<StepsForm.StepForm formRef={formRef}>
    <Row gutter={20}>
      <Col span={12}>
        <Form.Item
          name='id'
          style={{ height: 0 }}
        />
        <Form.Item
          name='optId'
          label={$t({ defaultMessage: 'Option ID' })}
          rules={[
            { required: true },
            { validator: (_, value) => idValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Option Name' })}
          rules={[
            { required: true }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='format'
          label={$t({ defaultMessage: 'Option Format' })}
          rules={[
            { required: true }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='value'
          label={$t({ defaultMessage: 'Option value' })}
          rules={[
            { required: true },
            { validator: (_, value) => { return value ? Promise.resolve() : Promise.reject() } }
          ]}
          children={<Input />}
        />
      </Col>
    </Row>
  </StepsForm.StepForm>:null
  return (


    <Form.Item label={$t({ defaultMessage: 'Add DHCP options:' })}>
      <OptionList
        optionData={tableData}
        updateOptionData={(optionsData: DHCPOption[]) => {
          form.setFieldsValue({ dhcpOptions: optionsData })
          setTableData([...optionsData])
        }}
        showOptionForm={(selectedOption: DHCPOption) => {
          onOpen()
          formRef.current?.setFieldsValue(selectedOption)
        }}></OptionList>
      <Modal
        title={$t({ defaultMessage: 'DHCP option' })}
        visible={visible}
        onCancel={onClose}
        width={400}
        footer={footer}
      >
        {getContent}
      </Modal>
    </Form.Item>
  )
}
