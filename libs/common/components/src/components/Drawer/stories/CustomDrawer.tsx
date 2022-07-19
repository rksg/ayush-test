import { useState } from 'react'

import { Form, Input, Space } from 'antd'

import { BulbOutlined } from '@acx-ui/icons'

import { Drawer } from '..'
import { Button } from '../../Button'

export function CustomDrawer () {
  const [visible, setVisible] = useState(false)
  const [resetField, setResetField] = useState(false)
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }
  const onOpen = () => {
    setVisible(true)
    setResetField(false)
  }
  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const content = <Form layout='vertical' form={form} onFinish={onClose}>
    <Form.Item
      name='name'
      label='Name'
      rules={[{ required: true }]}
      children={<Input placeholder='Please enter name' />}
    />
    <Form.Item
      name='description'
      label='Description'
      rules={[{ required: true }]}
      children={<Input.TextArea rows={4} placeholder='Please enter description' />}
    />
  </Form>

  const footer = <Space>
    <Button onClick={() => form.submit()} type={'primary'}>Save</Button>
    <Button onClick={resetFields}>Reset</Button>
  </Space>

  return (
    <>
      <Button onClick={onOpen}>Custom Drawer</Button>
      <Drawer
        title={'Custom Drawer'}
        icon={<BulbOutlined />}
        subtitle={'Subtitle'}
        handleBackClick={onClose}
        visible={visible}
        onClose={onClose}
        children={content}
        footer={footer}
        destroyOnClose={resetField}
        width={'600px'}
      />
    </>
  )
}
