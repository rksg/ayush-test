import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer }                from '@acx-ui/components'
import {
  useAddAdminGroupsMutation,
  useUpdateAdminGroupsMutation
} from '@acx-ui/rc/services'
import {
//   excludeSpaceRegExp,
//   notAllDigitsRegExp,
  getRoles,
  // Administrator,
  AdminGroup
} from '@acx-ui/rc/utils'

interface AddGroupDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: AdminGroup
  setVisible: (visible: boolean) => void
}

export const AddGroupDrawer = (props: AddGroupDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, editData } = props
  const [form] = Form.useForm()

  const [addAdminGroup] = useAddAdminGroupsMutation()
  const [updateApiToken] = useUpdateAdminGroupsMutation()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSubmit = async () => {
    const name = form.getFieldValue('name')
    const groupId = form.getFieldValue('groupId')
    const role = form.getFieldValue('role')
    try {
      await form.validateFields()
      const adminGroupData: AdminGroup = {
        name: name,
        groupId: groupId,
        role: role
      }

      const apiTokenEditData: AdminGroup = {
        name: form.getFieldValue('name'),
        groupId: groupId,
        role: role
      }

      if(isEditMode) {
        await updateApiToken({ params: { groupId: editData?.groupId },
          payload: apiTokenEditData }).unwrap()
      } else {
        await addAdminGroup({ payload: adminGroupData }).unwrap()
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
        {`${editData?.groupId}`}
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
