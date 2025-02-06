import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }                from '@acx-ui/components'
import {
  useAddAdminGroupsMutation,
  useUpdateAdminGroupsMutation
} from '@acx-ui/rc/services'
import {
  AdminGroup
} from '@acx-ui/rc/utils'
import { RolesEnum } from '@acx-ui/types'

import PrivilegeGroupSelector from '../PrivilegeGroups/PrivilegeGroupSelector'

interface AddGroupDrawerProps {
  visible: boolean
  isEditMode: boolean
  editData?: AdminGroup
  groupData?: AdminGroup[]
  setVisible: (visible: boolean) => void
}

interface AdminGroupData {
  name?: string,
  groupId?: string,
  role: RolesEnum
}

export const AddSsoGroupDrawer = (props: AddGroupDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, editData, groupData } = props
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
      const adminGroupData: AdminGroupData = {
        name: name,
        groupId: groupId,
        role: role
      }

      const adminGroupEditData: AdminGroupData = {
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

  useEffect(() => {
    if (editData && visible)
      form.setFieldsValue(editData)
  }, [form, editData, visible])

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
          { max: 64 },
          { validator: (_, value) => {
            if(groupData?.map((item) => { return item.name}).includes(value)) {
              return Promise.reject(
                `${$t({ defaultMessage: 'The Group Name already exists' })} `
              )
            }
            return Promise.resolve()}
          }
        ]}
        children={<Input />}
      />}
    {isEditMode ?
      <Form.Item label={$t({ defaultMessage: 'Group ID' })}>
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
    <PrivilegeGroupSelector />
  </Form>

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit SSO User Group' })
        : $t({ defaultMessage: 'Add SSO User Group' })}
      width={452}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: isEditMode
              ? $t({ defaultMessage: 'Apply' })
              : $t({ defaultMessage: 'Add Group' })
          }}
          onCancel={onClose}
          onSave={onSubmit}
        />
      }
    />
  )
}
