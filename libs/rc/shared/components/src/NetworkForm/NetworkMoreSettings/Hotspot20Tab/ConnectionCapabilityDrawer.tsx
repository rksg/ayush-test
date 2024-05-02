import { useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer } from '@acx-ui/components'
import {
  Hotspot20ConnectionCapability,
  Hotspot20ConnectionCapabilityStatusEnum,
  portRegExp
} from '@acx-ui/rc/utils'

type ConnectionCapabilityDrawerProps = {
  visible?: boolean,
  editMode?: boolean,
  editData?: Hotspot20ConnectionCapability,
  modalCallBack?: (editMode?: boolean, capability?: Hotspot20ConnectionCapability) => void
}

const ConnectionCapabilityDrawer = (props: ConnectionCapabilityDrawerProps) => {
  const { $t } = useIntl()
  const { visible, editMode, editData, modalCallBack } = props

  const [form] = Form.useForm()

  const statusOptions = Object.keys(Hotspot20ConnectionCapabilityStatusEnum).map((key => {
    return (
      { value: key,
        label: Hotspot20ConnectionCapabilityStatusEnum[
          key as keyof typeof Hotspot20ConnectionCapabilityStatusEnum] }
    )
  }))

  useEffect(() => {
    if (form && editData) {
      form.setFieldsValue(editData)
    }
  }, [form, editData])

  const content = <Form layout='vertical' form={form}>
    <Form.Item
      name='protocol'
      label={$t({ defaultMessage: 'Protocol' })}
      initialValue={''}
      validateFirst
      rules={[
        { required: true },
        { min: 1 },
        { max: 32 }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='protocolNumber'
      label={$t({ defaultMessage: 'Protocol Number' })}
      initialValue={''}
      rules={[
        { required: true },
        { min: 0 },
        { max: 254 }
      ]}
      children={<Input type='number' />}
    />
    <Form.Item
      name='port'
      label={$t({ defaultMessage: 'Port' })}
      initialValue={''}
      rules={[
        { required: true },
        { min: 0 },
        { max: 65535 },
        { validator: (_, value) => portRegExp(value) }
      ]}
      children={<Input type='number'/>}
    />
    <Form.Item
      name='status'
      label={$t({ defaultMessage: 'Status' })}
      rules={[
        { required: true }
      ]}
      children={
        <Select
          onChange={(value) => form.setFieldValue('status', value)}
          options={statusOptions}
        />
      }
    />
  </Form>

  return (
    <Drawer
      title={!editData
        ? $t({ defaultMessage: 'Add Protocol' })
        : $t({ defaultMessage: 'Edit Protocol' })
      }
      visible={visible}
      width={430}
      push={false}
      children={content}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          onCancel={form.resetFields}
          onSave={async () => {
            try {
              await form.validateFields()
              modalCallBack?.(editMode, form.getFieldsValue() as Hotspot20ConnectionCapability)
              form.resetFields()
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            }
          }}
        />
      }
    />
  )
}

export default ConnectionCapabilityDrawer