import { useState } from 'react'

import { Form, Input, Select }    from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Drawer }                          from '@acx-ui/components'
import {
  useAddTenantAuthenticationsMutation,
  useUpdateTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {
  TenantAuthentications,
  TenantAuthenticationType,
  ApplicationAuthenticationStatus
} from '@acx-ui/rc/utils'

enum ProviderType {
    TWILIO = 'Twilio',
    ESENDEX = 'Esendex',
    OTHER = 'Other'
}

const providerText = {
  [ProviderType.TWILIO]: defineMessage({ defaultMessage: 'Twilio' }),
  [ProviderType.ESENDEX]: defineMessage({ defaultMessage: 'Esendex' }),
  [ProviderType.OTHER]: defineMessage({ defaultMessage: 'Other' })
}

const getProviders = () => {
  return Object.keys(providerText).map(roleKey => ({
    label: providerText[roleKey as ProviderType],
    value: roleKey
  }))
}

interface SetupSmsProviderDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: TenantAuthentications
  setVisible: (visible: boolean) => void
}

export const SetupSmsProviderDrawer = (props: SetupSmsProviderDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, editData } = props
  const [providerType, setProviderType] = useState<string>('')
  const [form] = Form.useForm()

  const [addApiToken] = useAddTenantAuthenticationsMutation()
  const [updateApiToken] = useUpdateTenantAuthenticationsMutation()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSubmit = async () => {
    const name = form.getFieldValue('name')
    const clientId = form.getFieldValue('clientId')
    const secret = form.getFieldValue('secret')
    const scopes = form.getFieldValue('scopes')
    try {
      await form.validateFields()
      const apiTokenData: TenantAuthentications = {
        name: name,
        clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
        clientID: clientId,
        authenticationType: TenantAuthenticationType.oauth2_client,
        clientSecret: secret,
        scopes: scopes
      }

      const apiTokenEditData: TenantAuthentications = {
        name: form.getFieldValue('name'),
        authenticationType: TenantAuthenticationType.oauth2_client,
        clientSecret: form.getFieldValue('secret'),
        scopes: scopes
      }

      if(isEditMode) {
        await updateApiToken({ params: { authenticationId: editData?.id },
          payload: apiTokenEditData }).unwrap()
      } else {
        await addApiToken({ payload: apiTokenData }).unwrap()
      }
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const providerList = getProviders().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  const handleProviderChange = (value: string) => {
    setProviderType(value)
  }

  const formContent = <Form layout='vertical'form={form} >
    <Form.Item
      name='smsProvider'
      label={$t({ defaultMessage: 'SMS Provider' })}
      rules={[
        { required: true,
          message: $t({ defaultMessage:
            'Please select the provider' })
        }
      ]}
    >
      <Select
        options={providerList}
        placeholder={$t({ defaultMessage: 'Select...' })}
        onChange={handleProviderChange}
      />
    </Form.Item>
    {providerType === ProviderType.TWILIO && <Form.Item
      name='accountSid'
      label={$t({ defaultMessage: 'Account SID' })}
      rules={[
        { required: true }
      ]}
      children={<Input />}
    />}
    {providerType === ProviderType.TWILIO && <Form.Item
      name='authToken'
      label={$t({ defaultMessage: 'Auth Token' })}
      rules={[
        { required: true }
      ]}
      children={<Input />}
    />}
    {(providerType === ProviderType.ESENDEX || providerType === ProviderType.OTHER) &&
      <Form.Item
        name='apiKey'
        label={$t({ defaultMessage: 'API Key' })}
        rules={[
          { required: true }
        ]}
        children={<Input.TextArea rows={8} />}
      />}
    {providerType === ProviderType.OTHER &&
      <Form.Item
        name='sendUrl'
        label={$t({ defaultMessage: 'Send URL' })}
        rules={[
          { required: true }
        ]}
        children={<Input />}
      />}

  </Form>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Set SMS Provider' })}
      width={452}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Save' })
          }}
          onCancel={onClose}
          onSave={onSubmit}
        />
      }
    />
  )
}
