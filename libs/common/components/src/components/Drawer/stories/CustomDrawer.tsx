import { useState } from 'react'

import { Form, Input, Space } from 'antd'

import { BulbOutlined } from '@acx-ui/icons'

import { Drawer } from '..'
import { Button } from '../../Button'

export function CustomDrawer () {
  const [visible, setVisible] = useState(false)
  const [resetField, setResetField] = useState(false)
  const [showAddAnother, setShowAddAnother] = useState(false)
  const [showLoadingOnSave, setShowLoadingOnSave] = useState(false)
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }
  const onOpen = () => {
    setVisible(true)
    setResetField(false)
    setShowAddAnother(false)
    setShowLoadingOnSave(false)
  }
  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onOpenWithAddAnother = () => {
    setVisible(true)
    setResetField(false)
    setShowAddAnother(true)
    setShowLoadingOnSave(false)
  }

  const onOpenWithLoadingState = () => {
    setVisible(true)
    setResetField(false)
    setShowAddAnother(false)
    setShowLoadingOnSave(true)
  }

  const content = <Form layout='vertical' form={form} onFinish={resetFields}>
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
      showLoadingOnSave={showLoadingOnSave}
      onCancel={resetFields}
      onSave={async () => {
        form.submit()

        if (showLoadingOnSave) {
          // Sleep 5 seconds to observe the loading indicator
          await new Promise(r => setTimeout(r, 5000))
        }
      }}
    />
  )

  return (
    <>
      <Space>
        <Button onClick={onOpen}>Custom Drawer</Button>
        <Button onClick={onOpenWithAddAnother}>Custom Drawer With Add Another</Button>
        <Button onClick={onOpenWithLoadingState}>Custom Drawer With Loading state</Button>
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
