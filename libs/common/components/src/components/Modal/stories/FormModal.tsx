import { useState } from 'react'

import {
  Form,
  Radio,
  Switch,
  Input,
  Space
} from 'antd'

import { Modal }  from '..'
import { Button } from '../../Button'


export function FormModal () {
  const [visible, setVisible] = useState(false)

  const formContent = <Form layout='vertical'>
    <Form.Item
      label='Name'
      name='Name'
      rules={[{ required: true, message: 'Please input your Name!' }]}
    >
      <Input placeholder='Input Name' />
    </Form.Item>

    <Form.Item name='radio-group' label='Type'>
      <Radio.Group>
        <Space direction='vertical'>
          <Radio value='Cloud'>Cloud</Radio>
          <Radio value='On-premise'>On-premise</Radio>
        </Space>
      </Radio.Group>
    </Form.Item>

    <Form.Item
      label='IP Address'
      name='IP Address'
      rules={[{ required: true, message: 'Please input your IP Address!' }]}
    >
      <Input placeholder='Input IP Address'/>
    </Form.Item>

    <Form.Item name='switch' label='Switch' valuePropName='checked'>
      <Switch />
    </Form.Item>
  </Form>

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = () => {
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  return (
    <>
      <Button onClick={showModal}>
        Form Modal
      </Button>
      <Modal
        title='Title'
        visible={visible}
        okText='Add'
        onCancel={handleCancel}
        onOk={handleOk}
        subTitle='Description'
      >
        {formContent}
      </Modal>
    </>
  )  
}
