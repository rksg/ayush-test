import { useEffect } from 'react'

import { Form, Input, InputNumber, Select } from 'antd'
import { useIntl }                          from 'react-intl'
import { useParams }                        from 'react-router-dom'

import { Alert, Drawer }                                                                                                             from '@acx-ui/components'
import { useAddSubInterfacesMutation, useUpdateSubInterfacesMutation }                                                               from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeSubInterface, generalSubnetMskRegExp, multicastIpAddressRegExp, networkWifiIpRegExp } from '@acx-ui/rc/utils'
import { validationMessages }                                                                                                        from '@acx-ui/utils'

interface StaticRoutesDrawerProps {
  mac: string
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: EdgeSubInterface
}

const SubInterfaceDrawer = (props: StaticRoutesDrawerProps) => {

  const { $t } = useIntl()
  const { mac, visible, setVisible, data } = props
  const params = useParams()
  const [formRef] = Form.useForm()
  const [addSubInterface] = useAddSubInterfacesMutation()
  const [updateSubInterface] = useUpdateSubInterfacesMutation()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldsValue(data)
    }
  }, [visible, formRef, data])

  const portTypeOptions = [
    {
      label: $t({ defaultMessage: 'LAN' }),
      value: EdgePortTypeEnum.LAN
    }
  ]

  const ipModeOptions = [
    {
      label: $t({ defaultMessage: 'DHCP' }),
      value: EdgeIpModeEnum.DHCP
    },
    {
      label: $t({ defaultMessage: 'Static IP' }),
      value: EdgeIpModeEnum.STATIC
    }
  ]

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Sub-interface' },
      { operation: data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    formRef.submit()
  }

  const handleFinish = async (formData: EdgeSubInterface) => {
    formData.name = data?.name || ''
    formData.mac = mac
    formData.enabled = true
    const requestPayload = {
      params: { ...params, mac: mac, subInterfaceId: data?.id },
      payload: formData
    }
    try {
      if(data) {
        await updateSubInterface(requestPayload).unwrap()
      } else {
        await addSubInterface(requestPayload).unwrap()
      }
    } catch (error) {
      // TODO error message not be defined
      console.log(error) // eslint-disable-line no-console
    }
    handleClose()
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Form.Item
      name='portType'
      initialValue={EdgePortTypeEnum.LAN}
      label={$t({ defaultMessage: 'Port Type' })}
      rules={[{ required: true }]}
      children={<Select options={portTypeOptions} />}
    />
    <Form.Item
      name='ipMode'
      initialValue={EdgeIpModeEnum.DHCP}
      label={$t({ defaultMessage: 'IP Assignment Type' })}
      rules={[{ required: true }]}
      children={<Select options={ipModeOptions} />}
    />
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => prev.ipMode !== cur.ipMode}
    >
      {({ getFieldValue }) =>
        getFieldValue('ipMode') === EdgeIpModeEnum.DHCP ? (
          <Alert message={
            $t({ defaultMessage: `Note: Do not add default route pointing 
              to default gateway provided by server.` })
          }
          type='info'
          />
        ) : null
      }
    </Form.Item>
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => prev.ipMode !== cur.ipMode}
    >
      {({ getFieldValue }) =>
        getFieldValue('ipMode') === EdgeIpModeEnum.STATIC ? (
          <>
            <Form.Item
              name='ip'
              label={$t({ defaultMessage: 'IP Address' })}
              validateFirst
              rules={[
                { required: true },
                { validator: (_, value) => networkWifiIpRegExp(value) },
                { validator: (_, value) => multicastIpAddressRegExp(value, true) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='subnet'
              label={$t({ defaultMessage: 'Subnet Mask' })}
              rules={[
                { required: true },
                { validator: (_, value) => generalSubnetMskRegExp(value) }
              ]}
              children={<Input />}
            />
          </>
        ) : null
      }
    </Form.Item>
    <Form.Item
      name='vlan'
      label={$t({ defaultMessage: 'VLAN' })}
      rules={[
        { required: true },
        {
          type: 'number',
          min: 1,
          max: 4094,
          message: $t(validationMessages.vlanRange)
        }
      ]}
      children={<InputNumber />}
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

export default SubInterfaceDrawer