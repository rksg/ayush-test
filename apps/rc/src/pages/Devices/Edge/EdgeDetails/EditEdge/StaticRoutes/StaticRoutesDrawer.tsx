
import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }           from '@acx-ui/components'
import { EdgeStaticRoutes } from '@acx-ui/rc/utils'

interface StaticRoutesDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  addRoute: (data: EdgeStaticRoutes) => void
  data?: EdgeStaticRoutes
}

const StaticRoutesDrawer = (props: StaticRoutesDrawerProps) => {

  const { $t } = useIntl()
  const { visible, setVisible, addRoute, data } = props
  const [formRef] = Form.useForm()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldsValue(data)
    }
  }, [visible, formRef, data])

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Static Route' },
      { operation: data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async (addAnother: boolean) => {
    formRef.submit()
    if(!addAnother) {
      handleClose()
    }
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={addRoute}>
    <Form.Item
      name='networkAddress'
      label='Network Address'
      rules={[{ required: true }]}
      children={<Input />}
    />
    <Form.Item
      name='subnetMask'
      label='Subnet Mask'
      rules={[{ required: true }]}
      children={<Input />}
    />
    <Form.Item
      name='gateway'
      label='Gateway'
      rules={[{ required: true }]}
      children={<Input />}
    />
  </Form>

  const footer = (
    <Drawer.FormFooter
      showAddAnother={!!!data}
      buttonLabel={{
        addAnother: $t({ defaultMessage: 'Add another route' }),
        save: !!data ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={getTitle()}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
    />
  )
}

export default StaticRoutesDrawer