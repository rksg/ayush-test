import { useEffect } from 'react'

import { Form, Input, InputNumber, Select } from 'antd'
import { useIntl }                          from 'react-intl'

import { Alert, Drawer }   from '@acx-ui/components'
import {
  EdgeIpModeEnum,
  EdgePortTypeEnum,
  SubInterface,
  edgePortIpValidator,
  generalSubnetMskRegExp
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

interface SubInterfaceDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: SubInterface
  handleAdd: (data: SubInterface) => Promise<unknown>
  handleUpdate: (data: SubInterface) => Promise<unknown>
  allSubInterfaceVlans: { id: String, vlan: number }[]
}

const getPortTypeOptions = () => {
  const { $t } = getIntl()
  return [
    { label: $t({ defaultMessage: 'LAN' }), value: EdgePortTypeEnum.LAN }
  ]
}

const getIpModeOptions = () => {
  const { $t } = getIntl()
  return [
    { label: $t({ defaultMessage: 'DHCP' }), value: EdgeIpModeEnum.DHCP },
    { label: $t({ defaultMessage: 'Static IP' }), value: EdgeIpModeEnum.STATIC }
  ]
}

const SubInterfaceDrawer = (props: SubInterfaceDrawerProps) => {

  const { $t } = useIntl()
  const { visible, setVisible, data, handleAdd, handleUpdate } = props
  const [formRef] = Form.useForm()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldsValue(data)
    }
  }, [visible, formRef, data])

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

  const handleFinish = async () => {
    const formData = formRef.getFieldsValue(true)
    const { id, ip, subnet, ...rest } = formData
    const payload = {
      ...rest,
      ...(
        rest.ipMode === EdgeIpModeEnum.STATIC ?
          { ip, subnet } : {}
      ),
      id: id ? id : 'new_' + Date.now()
    }

    try {
      if(data) {
        await handleUpdate(payload)
      } else {
        await handleAdd(payload)
      }
    } catch (error) {
      // TODO error message not be defined
    }
    handleClose()
  }

  const validateVlanDuplication = (vlan: number) => {
    const duplicate = props.data ?
      props.allSubInterfaceVlans.find(item => item.vlan === vlan && item.id !== props.data?.id) :
      props.allSubInterfaceVlans.find(item => item.vlan === vlan)

    return duplicate ?
      Promise.reject($t({ defaultMessage: 'VLAN should be unique' })) :
      Promise.resolve()
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Form.Item
      name='portType'
      initialValue={EdgePortTypeEnum.LAN}
      label={$t({ defaultMessage: 'Port Type' })}
      rules={[{ required: true }]}
      children={<Select options={getPortTypeOptions()} />}
    />
    <Form.Item
      name='ipMode'
      initialValue={EdgeIpModeEnum.DHCP}
      label={$t({ defaultMessage: 'IP Assignment Type' })}
      rules={[{ required: true }]}
      children={<Select options={getIpModeOptions()} />}
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
                { validator: (_, value) => edgePortIpValidator(value, getFieldValue('subnet')) }
              ]}
              children={<Input />}
              dependencies={['subnet']}
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
        },
        { validator: (_, value) => validateVlanDuplication(value) }
      ]}
      children={<InputNumber min={1} max={4094} />}
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