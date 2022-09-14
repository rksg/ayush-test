import { useState, useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { FormInstance }          from 'antd/es/form/Form'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Modal, StepsFormInstance } from '@acx-ui/components'
import {
  Button,
  StepsForm
} from '@acx-ui/components'
import { DHCPOption }         from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import { OptionTable } from './OptionTable'


export function PoolOption (props:{
  optionData: DHCPOption[],
  setOptionList?: (data: DHCPOption[]) => void
  onSave?: (form: FormInstance, data?:DHCPOption ) => void
}) {
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const { optionData } = props
  const formRef = useRef<StepsFormInstance<DHCPOption>>()

  const idValidator = async (value: string) => {
    const { id } = { id: 0, ...formRef.current?.getFieldsValue() }
    if(_.find(optionData, (item)=>{return id !== item.id && item.optId === value})){
      const entityName = $t({ defaultMessage: 'Option ID' })
      const key = 'optId'
      return Promise.reject($t(validationMessages.duplication, { entityName, key }))
    }
    return Promise.resolve()
  }
  const handleSaveData = () => {
    props?.onSave?.(form, formRef?.current?.getFieldsValue())
    onClose()
    return
  }
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    formRef?.current?.resetFields()
    setVisible(false)
  }
  const footer = [
    <Button key='back' onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>,
    <Button key='forward'
      onClick={()=>{
        formRef.current?.validateFields().then(()=>{
          handleSaveData()
        },()=>{
          return false
        })
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
          name='optName'
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
          label={$t({ defaultMessage: 'Option Value' })}
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
      <OptionTable
        optionData={[...optionData]}
        updateOptionData={(optionsData: DHCPOption[]) => {
          form?.setFieldsValue({ dhcpOptions: optionsData })
          props.setOptionList?.(optionsData)
        }}
        showOptionForm={(selectedOption: DHCPOption) => {
          setVisible(true)
          formRef.current?.setFieldsValue(selectedOption)
        }}></OptionTable>
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
