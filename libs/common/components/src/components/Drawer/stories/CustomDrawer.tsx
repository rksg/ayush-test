import { useState } from 'react'

import { Form, Input, Space } from 'antd'

import { BulbOutlined } from '@acx-ui/icons'

import { Drawer } from '..'
import { Button } from '../../Button'

export function CustomDrawer () {
  const [visible, setVisible] = useState(false)
  const [resetField, setResetField] = useState(false)
  const [showAddAnother, setShowAddAnother] = useState(false)
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }
  const onOpen = () => {
    setVisible(true)
    setResetField(false)
    setShowAddAnother(false)
  }
  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onOpenWithAddAnother = () => {
    setVisible(true)
    setResetField(false)
    setShowAddAnother(true)
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

  const footerWithAddAnother = (
    <Drawer.FormFooter
      showAddAnother={showAddAnother}
      onCancel={resetFields}
      onSave={() => form.submit()}
    />
  )

  return (
    <>
      <Space>
        <Button onClick={onOpen}>Custom Drawer</Button>
        <Button onClick={onOpenWithAddAnother}>Custom Drawer With Add Another</Button>
      </Space>
      <Drawer
        title={'Custom Drawer'}
        icon={<BulbOutlined />}
        subTitle={'Subtitle'}
        onBackClick={onClose}
        visible={visible}
        onClose={onClose}
        children={content}
        footer={footerWithAddAnother}
        destroyOnClose={resetField}
        width={'600px'}
      />
    </>
  )
}
