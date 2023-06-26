import { Divider, Form, Input } from 'antd'
import { useIntl }              from 'react-intl'

import { Button, Drawer, PasswordInput }   from '@acx-ui/components'
import {
  useAddTenantAuthenticationsMutation,
  useUpdateTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {
  excludeSpaceRegExp,
  notAllDigitsRegExp,
  TenantAuthentications,
  TenantAuthenticationType,
  ApplicationAuthenticationStatus
} from '@acx-ui/rc/utils'

interface AddApplicationDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: TenantAuthentications
  setVisible: (visible: boolean) => void
}

const generateHexKey = (keyLength: number):string => {
  let hexKey = ''
  const crypto = window.crypto
  const array = new Uint32Array(1)
  while (hexKey.length < keyLength) {
    hexKey += crypto.getRandomValues(array)[0].toString(16).substring(2)
  }
  return hexKey.slice(0, keyLength)
}

export const AddApplicationDrawer = (props: AddApplicationDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, editData } = props
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
    try {
      await form.validateFields()
      const apiTokenData: TenantAuthentications = {
        name: name,
        clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
        clientID: clientId,
        authenticationType: TenantAuthenticationType.oauth2_client,
        clientSecret: secret
      }

      const apiTokenEditData: TenantAuthentications = {
        name: form.getFieldValue('name'),
        authenticationType: TenantAuthenticationType.oauth2_client,
        clientSecret: form.getFieldValue('secret')
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

  const handleClickCopy = (copyString: string) => {
    navigator.clipboard.writeText(copyString)
  }

  const initClientId = editData?.clientID || generateHexKey(32)
  const formContent = <Form layout='vertical'form={form} >
    <Form.Item
      name='name'
      label={$t({ defaultMessage: 'Application Name' })}
      initialValue={editData?.name || ''}
      rules={[
        { required: true },
        { min: 2 },
        { max: 64 }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='clientId'
      label={$t({ defaultMessage: 'Client ID' })}
      initialValue={initClientId}
      children={<>
        <label>{initClientId}</label>
        <Button
          style={{ marginLeft: '20px' }}
          type='link'
          onClick={() => {
            handleClickCopy(form.getFieldValue('clientId'))
          }}>
          {$t({ defaultMessage: 'Copy' })}
        </Button></>
      }
    />
    <Form.Item
      name='secret'
      label={$t({ defaultMessage: 'Client secret' })}
      initialValue={editData?.clientSecret || ''}
      rules={[
        { required: true },
        { validator: (_, value) =>
        {
          if(value.length !== 32) {
            return Promise.reject(
              `${$t({ defaultMessage: 'Secret must be 32 characters long' })} `
            )
          }
          return Promise.resolve()
        }
        },
        { validator: (_, value) => excludeSpaceRegExp(value) },
        { validator: (_, value) => notAllDigitsRegExp(value) }
      ]}
      children={<PasswordInput />}
    />
    <Button
      type='link'
      onClick={() => {
        const sec = generateHexKey(32)
        form.setFieldValue('secret', sec)
      }}>
      {$t({ defaultMessage: 'Generate Secret' })}
    </Button>
    <Divider type='vertical'/>
    <Button
      type='link'
      onClick={() => {
        handleClickCopy(form.getFieldValue('secret'))
      }}>
      {$t({ defaultMessage: 'Copy' })}
    </Button>

  </Form>

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit API Token' })
        : $t({ defaultMessage: 'Add API Token' })}
      width={452}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: isEditMode
              ? $t({ defaultMessage: 'Save' })
              : $t({ defaultMessage: 'Add' })
          }}
          onCancel={onClose}
          onSave={onSubmit}
        />
      }
    />
  )
}
