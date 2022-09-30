import { useState, useRef } from 'react'

import { Col, Form, Input, Row } from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Modal, Button }      from '@acx-ui/components'
import { DHCPOption }         from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import { OptionTable } from './OptionTable'

const defaultData: Partial<DHCPOption> = {
  id: 0
}

export function PoolOption (props:{
  value?: DHCPOption[]
  onChange?: (data: DHCPOption[]) => void
}) {
  const { $t } = useIntl()
  const { value: optionData } = props
  const optionsMap = useRef(optionData ? _.keyBy(optionData, 'id') : {})
  const options = Object.values(optionsMap.current)

  const [modalForm] = Form.useForm<DHCPOption>()
  const idValidator = async (text: string) => {
    const { id } = { ...modalForm.getFieldsValue() }
    if(_.find(optionData, (item)=>{return id !== item.id && item.optId === text})){
      const entityName = $t({ defaultMessage: 'Option ID' })
      const key = 'optId'
      return Promise.reject($t(validationMessages.duplication, { entityName, key }))
    }
    return Promise.resolve()
  }

  const handleChanged = () => {
    props.onChange?.(Object.values(optionsMap.current))
  }

  const handleSaveData = (data: DHCPOption) => {
    let id = data.id
    if (id === defaultData.id) { id = data.id = Date.now() }
    optionsMap.current[id] = data
    handleChanged()
    onClose()
  }
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const footer = [
    <Button
      key='back'
      type='link'
      onClick={onClose}
      children={$t({ defaultMessage: 'Cancel' })}
    />,
    <Button
      key='forward'
      type='secondary'
      onClick={() => modalForm.submit()}
      children={$t({ defaultMessage: 'Save' })}
    />
  ]
  const getContent = <Form
    form={modalForm}
    layout='vertical'
    onFinish={handleSaveData}
    initialValues={defaultData}
  >
    <Row gutter={20}>
      <Col span={23}>
        <Form.Item name='id' hidden />
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
            { required: true }
          ]}
          children={<Input />}
        />
      </Col>
    </Row>
  </Form>

  const onAddOrEdit = (item?: DHCPOption) => {
    setVisible(true)
    if (item) modalForm.setFieldsValue(item)
    else modalForm.resetFields()
  }

  const onDelete = (items: DHCPOption[]) => {
    items.forEach(item => {
      delete optionsMap.current[item.id]
    })
    handleChanged()
  }

  return (<>
    <OptionTable
      data={options}
      onAdd={onAddOrEdit}
      onEdit={onAddOrEdit}
      onDelete={onDelete}
    />
    <Modal
      title={$t({ defaultMessage: 'DHCP option' })}
      visible={visible}
      onCancel={onClose}
      width={300}
      footer={footer}
    >
      {getContent}
    </Modal>
  </>)
}
