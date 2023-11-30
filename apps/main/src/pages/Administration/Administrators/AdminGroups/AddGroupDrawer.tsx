import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer }                          from '@acx-ui/components'
import {
  useAddTenantAuthenticationsMutation,
  useUpdateTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {
//   excludeSpaceRegExp,
//   notAllDigitsRegExp,
  TenantAuthentications,
  TenantAuthenticationType,
  ApplicationAuthenticationStatus,
  getRoles,
  Administrator
} from '@acx-ui/rc/utils'

interface AddGroupDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: Administrator
  setVisible: (visible: boolean) => void
}

export const AddGroupDrawer = (props: AddGroupDrawerProps) => {
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
    const clientId = form.getFieldValue('groupId')
    const scopes = form.getFieldValue('role')
    try {
      await form.validateFields()
      const apiTokenData: TenantAuthentications = {
        name: name,
        clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
        clientID: clientId,
        authenticationType: TenantAuthenticationType.oauth2_client,
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
        // reloadAuthTable(2)
      } else {
        await addApiToken({ payload: apiTokenData }).unwrap()
        // reloadAuthTable(1)
      }
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const rolesList = getRoles().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  const formContent = <Form layout='vertical'form={form} >
    {isEditMode ?
      <Form.Item label={$t({ defaultMessage: 'Group Name' })}>
        {`${editData?.name}`}
      </Form.Item> :
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Group Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 64 }
        ]}
        children={<Input />}
      />}
    {isEditMode ?
      <Form.Item label={$t({ defaultMessage: 'Group Id' })}>
        {`${editData?.email}`}
      </Form.Item> :
      <Form.Item
        name='groupId'
        label={$t({ defaultMessage: 'Group ID' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 64 }
        ]}
        children={<Input />}
      />}
    <Form.Item
      name='role'
      style={{ marginTop: '13px' }}
      label={$t({ defaultMessage: 'Role' })}
      initialValue={editData?.role || ''}
      rules={[
        { required: true }
        // { required: true,
        //   message: $t({ defaultMessage:
        //     'Please select the scope (role) to apply to this application' })
        // }
      ]}
    >
      <Select
        options={rolesList}
        placeholder={$t({ defaultMessage: 'Select...' })}
      />
    </Form.Item>
  </Form>

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit Admins Group' })
        : $t({ defaultMessage: 'Add Admins Group' })}
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
