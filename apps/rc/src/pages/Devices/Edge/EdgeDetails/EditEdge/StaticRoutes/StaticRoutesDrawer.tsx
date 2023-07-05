
import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }                                                                              from '@acx-ui/components'
import { EdgeStaticRoute, generalSubnetMskRegExp, networkWifiIpRegExp, serverIpAddressRegExp } from '@acx-ui/rc/utils'

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

  const validateStaticRoute = (ip: string, subnet: string) => {
    if(!!!ip || !!!subnet) return Promise.resolve()
    // validation rule: ip & subnet = ip
    const ipSegment = ip.split('.')
    const subnetSegment = subnet.split('.')
    const seg1 = Number(ipSegment[0]) & Number(subnetSegment[0])
    const seg2 = Number(ipSegment[1]) & Number(subnetSegment[1])
    const seg3 = Number(ipSegment[2]) & Number(subnetSegment[2])
    const seg4 = Number(ipSegment[3]) & Number(subnetSegment[3])
    if(seg1 !== Number(ipSegment[0]) || seg2 !== Number(ipSegment[1])
      || seg3 !== Number(ipSegment[2]) || seg4 !== Number(ipSegment[3])) {
      return Promise.reject($t({
        defaultMessage: 'Please enter a valid Network Address + Subnet Mask'
      }))
    }
    return Promise.resolve()
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
        { validator: (_, value) => networkWifiIpRegExp(value) },
        {
          validator: (_, value) => validateStaticRoute(value, formRef.getFieldValue('destSubnet'))
        },
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
        { validator: (_, value) => generalSubnetMskRegExp(value) },
        {
          validator: (_, value) => validateStaticRoute(formRef.getFieldValue('destIp'), value)
        },
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