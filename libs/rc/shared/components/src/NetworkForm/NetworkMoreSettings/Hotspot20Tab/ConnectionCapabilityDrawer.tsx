import { Form, FormInstance, Input, Select } from 'antd'
import { useIntl }                           from 'react-intl'

import { Drawer }                                              from '@acx-ui/components'
import { Hotspot20ConnectionCapabilityStatusEnum, portRegExp } from '@acx-ui/rc/utils'

interface ConnectionCapabilityDrawerProps {
  visible: boolean,
  editMode: boolean,
  drawerForm: FormInstance,
  handleDrawerSave: () => void,
  handleDrawerClose: () => void
}

const ConnectionCapabilityDrawer = (props: ConnectionCapabilityDrawerProps) => {
  const { $t } = useIntl()
  const { visible, editMode, drawerForm, handleDrawerSave, handleDrawerClose } = props

  const statusOptions = Object.keys(Hotspot20ConnectionCapabilityStatusEnum).map((key => {
    return (
      { value: key,
        label: Hotspot20ConnectionCapabilityStatusEnum[
          key as keyof typeof Hotspot20ConnectionCapabilityStatusEnum] }
    )
  }))

  const content = <Form layout='vertical' form={drawerForm}>
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
          onChange={(value) => drawerForm.setFieldValue('status', value)}
          options={statusOptions}
        />
      }
    />
  </Form>

  return (
    <Drawer
      title={editMode
        ? $t({ defaultMessage: 'Edit Protocol' })
        : $t({ defaultMessage: 'Add Protocol' })
      }
      visible={visible}
      destroyOnClose={true}
      width={430}
      onClose={handleDrawerClose}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          onCancel={handleDrawerClose}
          onSave={async () => {
            try {
              await drawerForm.validateFields()
              handleDrawerSave()
              drawerForm.resetFields()
              handleDrawerClose()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

export default ConnectionCapabilityDrawer