
import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { Drawer }                      from '@acx-ui/components'
import {
  useAddSwitchStaticRouteMutation,
  useUpdateSwitchStaticRouteMutation
} from '@acx-ui/rc/services'
import {
  StaticRoute,
  validateSwitchStaticRouteIp,
  IP_SUBNET_VALIDATION_PATTERN,
  validateSwitchStaticRouteNextHop,
  validateSwitchStaticRouteAdminDistance,
  IpCalculatorUtilsService,
  Ipv4Format
} from '@acx-ui/rc/utils'

interface StaticRoutesDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: StaticRoute
}

const StaticRoutesDrawer = (props: StaticRoutesDrawerProps) => {

  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const { visible, setVisible, data } = props
  const [formRef] = Form.useForm()
  const [addSwitchStaticRoute] = useAddSwitchStaticRouteMutation()
  const [updateSwitchStaticRoute] = useUpdateSwitchStaticRouteMutation()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldsValue(data)
    }
  }, [visible, formRef, data])

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Route' },
      { operation: data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const updateIp = () => {
    const destinationIp = formRef.getFieldValue('destinationIp')
    if(destinationIp && !RegExp(IP_SUBNET_VALIDATION_PATTERN).test(destinationIp)) {
      const ipAddress = destinationIp.split('/')[0]
      const mask = parseInt(destinationIp.split('/')[1], 10)
      const ipCalcService = new IpCalculatorUtilsService()
      const ipCalculated: Ipv4Format = ipCalcService.Ipv4Address(ipAddress, mask)
      const ipAddressCalculated = ipCalculated.netaddressDotQuad + '/' + mask
      if(ipAddressCalculated !== formRef.getFieldValue('destinationIp')){
        formRef.setFieldValue('destinationIp', ipAddressCalculated)
      }
    }
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    formRef.validateFields().then(() => {
      formRef.submit()
      handleClose()
    }).catch(() => {
      //do nothing...
    })
  }

  const handleFinish = (formData: StaticRoute) => {
    const payload = formData
    const params = { tenantId, switchId, staticRouteId: formData.id }
    if(data) {
      updateSwitchStaticRoute({ params, payload }).unwrap()
        .catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })
    } else {
      addSwitchStaticRoute({ params, payload }).unwrap()
        .catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })
    }
    formRef.resetFields()
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Form.Item
      name='destinationIp'
      label={$t({ defaultMessage: 'Destination IP' })}
      rules={[
        { required: true },
        { validator: (_, value) => validateSwitchStaticRouteIp(value) }
      ]}
      children={<Input onBlur={updateIp}/>}
      validateFirst
    />
    <Form.Item
      name='nextHop'
      label={$t({ defaultMessage: 'Next Hop' })}
      rules={[
        { required: true },
        { validator: (_, value) => validateSwitchStaticRouteNextHop(value) }
      ]}
      children={<Input />}
      validateFirst
    />
    <Form.Item
      name='adminDistance'
      label={$t({ defaultMessage: 'Admin Distance' })}
      rules={[
        { validator: (_, value) => validateSwitchStaticRouteAdminDistance(value) }
      ]}
      children={<Input />}
      validateFirst
    />
    <Form.Item
      name='id'
      initialValue={''}
      // eslint-disable-next-line react/jsx-no-useless-fragment
      children={<></>}
    />
  </Form>

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
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
