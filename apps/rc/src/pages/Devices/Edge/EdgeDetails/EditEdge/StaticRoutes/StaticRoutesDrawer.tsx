
import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }                                                     from '@acx-ui/components'
import { EdgeStaticRoute, serverIpAddressRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'

interface StaticRoutesDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  addRoute: (data: EdgeStaticRoute) => void
  editRoute: (data: EdgeStaticRoute) => void
  data?: EdgeStaticRoute
  allRoutes: EdgeStaticRoute[] // For validation
}

const StaticRoutesDrawer = (props: StaticRoutesDrawerProps) => {

  const { $t } = useIntl()
  const { visible, setVisible, addRoute, editRoute, data, allRoutes } = props
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
    formRef.validateFields().then(() => {
      formRef.submit()
      if(!addAnother) {
        handleClose()
      }
    }).catch(() => {
      //do nothing...
    })
  }

  const handleFinish = (formData: EdgeStaticRoute) => {
    if(data) {
      editRoute({ ...formData, id: data.id })
    } else {
      addRoute({
        ...formData,
        id: formData.destIp + formData.destSubnet
      })
    }
    formRef.resetFields()
  }

  const validateDuplicate = (ip: string, subnet: string) => {
    if((data?.destIp !== ip || data?.destSubnet !== subnet) &&
      allRoutes && allRoutes.filter(item => item.destIp === ip && item.destSubnet === subnet)
      .length > 0) {
      return Promise.reject($t({
        defaultMessage: 'Each route should have unique Network Address + Subnet Mask'
      }))
    }
    return Promise.resolve()
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Form.Item
      name='destIp'
      label={$t({ defaultMessage: 'Network Address' })}
      rules={[
        { required: true },
        { validator: (_, value) => serverIpAddressRegExp(value) },
        { validator: (_, value) => validateDuplicate(value, formRef.getFieldValue('destSubnet')) }
      ]}
      children={<Input />}
      validateFirst
    />
    <Form.Item
      name='destSubnet'
      label={$t({ defaultMessage: 'Subnet Mask' })}
      rules={[
        { required: true },
        { validator: (_, value) => subnetMaskIpRegExp(value) },
        { validator: (_, value) => validateDuplicate(formRef.getFieldValue('destIp'), value) }
      ]}
      children={<Input />}
      validateFirst
    />
    <Form.Item
      name='nextHop'
      label={$t({ defaultMessage: 'Gateway' })}
      rules={[
        { required: true },
        { validator: (_, value) => serverIpAddressRegExp(value) }
      ]}
      children={<Input />}
      validateFirst
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