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
  const [updateAdminGroup] = useUpdateAdminGroupsMutation()

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
        contactPerson: {
          name: 'john chang',
          email: 'johnChangt@mail.com'
        },
        processingPriority: 3,
        role: role
      }

      const adminGroupEditData: AdminGroup = {
        name: form.getFieldValue('name'),
        groupId: groupId,
        contactPerson: {
          name: 'john chang',
          email: 'johnChangt@mail.com'
        },
        processingPriority: 3,
        role: role
      }

      if(isEditMode) {
        await updateAdminGroup({ params: { groupId: editData?.id },
          payload: adminGroupEditData }).unwrap()
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
    <Form.Item
      name='name'
      label={$t({ defaultMessage: 'Group Name' })}
      initialValue={isEditMode ? editData?.name : ''}
      rules={[
        { required: true },
        { min: 2 },
        { max: 64 }
      ]}
      children={<Input />}
    />
    <Form.Item
      name='groupId'
      label={$t({ defaultMessage: 'Group ID' })}
      initialValue={isEditMode ? editData?.groupId : ''}
      rules={[
        { required: true },
        { min: 2 },
        { max: 64 }
      ]}
      children={<Input />}
    />

    <Form.Item
      name='role'
      style={{ marginTop: '13px' }}
      label={$t({ defaultMessage: 'Role' })}
      initialValue={editData?.role || ''}
      rules={[
        { required: true }
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
