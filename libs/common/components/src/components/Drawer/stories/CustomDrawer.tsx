import { useState } from 'react'

import { Col, Form, Input, Row } from 'antd'

import { Drawer } from '..'
import { Button } from '../../Button'


export function CustomDrawer () {
  const [visible, setVisible] = useState(false)
  const [resetField, setResetField] = useState(false)

  const onClose = () => {
    setVisible(false)
  }
  const onOpen = () => {
    setVisible(true)
  }
  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const content = <Form layout='vertical' hideRequiredMark>
    <Row>
      <Col span={24}>
        <Form.Item
          name='name'
          label='Name'
          rules={[{ required: true, message: 'Please enter name' }]}
        >
          <Input placeholder='Please enter name' />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Form.Item
          name='description'
          label='Description'
          rules={[
            {
              required: true,
              message: 'Please enter description'
            }
          ]}
        >
          <Input.TextArea rows={4} placeholder='Please enter description' />
        </Form.Item>
      </Col>
    </Row>
  </Form>

  const footer = <>
    <Button onClick={onClose} type={'primary'}>Save</Button>
    <Button onClick={resetFields}>Reset</Button>
  </>
  
  return (
    <>
      <Button onClick={onOpen}>Custom Drawer</Button>
      <Drawer 
        title={'Custom Drawer'}
        visible={visible}
        onClose={onClose}
        content={content}
        footer={footer}
        destroyOnClose={resetField}
      />
    </>
  )
}
