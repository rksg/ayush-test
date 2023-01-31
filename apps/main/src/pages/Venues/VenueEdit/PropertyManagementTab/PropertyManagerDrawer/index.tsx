import React, { useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import { useForm }             from 'antd/lib/form/Form'
import { useIntl }             from 'react-intl'

import { Button, Drawer }                                        from '@acx-ui/components'
import { emailRegExp, PropertyManager, PropertyManagerRoleEnum } from '@acx-ui/rc/utils'

interface PropertyDrawerProps {
  visible: boolean,
  onClose: () => void
}

export function PropertyManagerDrawer (props: PropertyDrawerProps) {
  const { $t } = useIntl()
  const { visible, onClose } = props
  const [form] = useForm<PropertyManager>()

  useEffect(() => {
    if (!visible) {
      form.resetFields()
    }
  }, [visible])

  const footer = [
    <div key={'footer'} style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
      <Button key='cancel' onClick={onClose}>
        { $t({ defaultMessage: 'Cancel' }) }
      </Button>
      <Button
        key='submit'
        type={'secondary'}
        onClick={() => form.submit()}
        // FIXME: isLoading handling
        // loading={addPersonaGroupState.isLoading || updatePersonaGroupState.isLoading}
      >
        {$t({ defaultMessage: 'Add' })}
      </Button>
    </div>
  ]

  const addPropertyManager = (data: PropertyManager) => {
    console.log('[AddPropertyManager] :: ', data)
    // TODO: [API] - integrate with add Property manager
  }

  const addPropertyManagerForm =
    <Form
      form={form}
      layout={'vertical'}
      onFinish={addPropertyManager}
    >
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Property Manager Name' })}
        children={<Input />}
        rules={[
          { required: true }
        ]}
      />
      <Form.Item
        name='role'
        label={$t({ defaultMessage: 'Role' })}
        initialValue={PropertyManagerRoleEnum.PrimeAdministrator}
        children={<Select
          options={Object.entries(PropertyManagerRoleEnum)
            .map(([key, value]) => {
              return { label: value, value: key }
            })}
        />
        }
        rules={[
          { required: true }
        ]}
      />
      <Form.Item
        name='email'
        label={$t({ defaultMessage: 'Email Address' })}
        children={<Input />}
        rules={[
          { required: true },
          { validator: (_, value) => emailRegExp(value) }
        ]}
      />
      <Form.Item
        name='phone'
        label={$t({ defaultMessage: 'Phone Number' })}
        children={<Input />}
        rules={[
          { required: true }
          // FIXME: Add phone number validation
        ]}
      />
    </Form>


  return (
    <Drawer
      forceRender
      width='400px'
      zIndex={200}
      title={$t({ defaultMessage: 'Add Property Manager' })}
      visible={visible}
      onClose={onClose}
      children={addPropertyManagerForm}
      footer={footer}
    />
  )
}
