import React, { useState } from 'react'

import { Button, Col, Form, Row } from 'antd'
import { isEqual, pick, isEmpty } from 'lodash'
import { useIntl }                from 'react-intl'


import {
  useUpdateUserMutation,
  useAddUserMutation,
  AddUserPayload,
  UpdateUserPayload,
  useLazyFindUserQuery,
  useInviteUserMutation
} from '@acx-ui/analytics/services'
import { ManagedUser }                        from '@acx-ui/analytics/utils'
import { Drawer, Loader, Tooltip, showToast } from '@acx-ui/components'
import { emailRegExp }                        from '@acx-ui/rc/utils'

import { drawerContentConfig } from './config'


type FormItemProps = {
  name: string,
  labelKey: string,
  component: React.ReactNode
}

const FormItem: React.FC<FormItemProps> = ({ name, labelKey, component }) => {
  const { $t } = useIntl()
  const Item = name === 'invitedEmail'
    ? <Form.Item
      name={name}
      label={<>
        {labelKey}
        <Tooltip.Info
          title={$t(
            { defaultMessage:
                `Invite a 3rd Party user who does not belong to your organisation
                into this RUCKUS AI account. Please note
                that the invitee needs to have an existing
                Ruckus Support account.` })}
          placement='top' />
      </>}
      rules={[{
        required: true,
        message: $t({ defaultMessage: 'Email is required!' })
      },
      {
        validator: (_, value) => emailRegExp(value)
      }]}
      children={component}
    />
    : <Form.Item name={name} label={labelKey}>
      {component}
    </Form.Item>

  return <Row gutter={20}>
    <Col span={24}>
      {Item}
    </Col>
  </Row>
}
export type UserType = 'edit' | 'create' | 'createExternal'
type UserDrawerProps = {
  opened: boolean
  selectedRow: ManagedUser | null
  type: UserType
  toggleDrawer: CallableFunction
}
const drawerTitle = (type: string) : string => {
  switch(type) {
    case 'create': return 'Create User'
    case 'createExternal': return 'Invite 3RD Party'
    default: return 'Edit User'
  }
}
type UpdatedUser = Partial<ManagedUser> & {
  disclaimerChecked?: boolean
  invitedEmail?: string
  invitedUserId?: string
}
export const UserDrawer: React.FC<UserDrawerProps> = ({
  opened,
  selectedRow,
  type,
  toggleDrawer
}) => {
  const { $t } = useIntl()
  const selectedUser = pick(selectedRow,['id', 'email', 'resourceGroupId', 'role'])
  const [ updatedUser, setUpdatedUser ] = useState<UpdatedUser>(selectedUser)
  const [ isLoading, setIsloading ] = useState(false)
  const [updateUser] = useUpdateUserMutation()
  const [addUser] = useAddUserMutation()
  const [inviteUser] = useInviteUserMutation()
  const [form] = Form.useForm()
  const cleanUp = () => {
    setIsloading(false)
    setUpdatedUser({})
    form.resetFields()
    toggleDrawer(false)
  }
  const [findQuery] = useLazyFindUserQuery()

  const handleSaveClick = async () => {
    setIsloading(true)
    const mutation = type === 'edit' ? updateUser : addUser
    const payload = type === 'edit'
      ? {
        resourceGroupId: updatedUser.resourceGroupId!,
        userId: updatedUser.id!,
        role: updatedUser.role!
      } as UpdateUserPayload
      : {
        resourceGroupId: updatedUser.resourceGroupId!,
        swuId: updatedUser.id!,
        role: updatedUser.role!
      } as AddUserPayload
    await mutation(payload as AddUserPayload & UpdateUserPayload)
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t(
            { defaultMessage: 'User {action} successfully' },
            { action: type === 'edit' ? 'Edited' : 'Added' }
          )
        })
        cleanUp()
      })
      .catch((error) => {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'Error: {error}' }, { error: error.data })
        })
        cleanUp()
      })
  }
  const handleInviteClick = async () => {
    setIsloading(true)
    await findQuery({
      username: updatedUser?.invitedEmail!
    })
      .unwrap()
      .then(async (result) => {
        const invitedUserId = result.userId
        const { resourceGroupId, role } = updatedUser
        await inviteUser({
          invitedUserId,
          resourceGroupId,
          role,
          type: 'tenant' // todo accept as prop when invite brand
        })
          .unwrap()
          .then(() => {
            setIsloading(false)
            showToast({
              type: 'success',
              content: $t({ defaultMessage: 'User invited successfully' })
            })
            cleanUp()
          })
          .catch(({ data }) => {
            setIsloading(false)
            showToast({
              type: 'error',
              content: $t({ defaultMessage: 'Error: {error}' }, { error: JSON.parse(data).error })
            })
          })
      })
      .catch(({ data }) => {
        setIsloading(false)
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'Error: {error}' }, { error: data.error })
        })
      })
  }
  const isUserDataValid = () => {
    switch(type) {
      case 'create':
        return Boolean(
          updatedUser.id &&
          updatedUser.email &&
          updatedUser.resourceGroupId &&
          updatedUser.role
        )
      case 'edit':
        return !isEmpty(updatedUser) && !isEqual(selectedUser, updatedUser)
      default: // external
        return !form.getFieldError('invitedEmail').length &&
        updatedUser.resourceGroupId &&
        updatedUser.role &&
        updatedUser?.disclaimerChecked
    }
  }
  const handleCancelClick = () => cleanUp()

  const drawerFooter = (
    <div>
      <Button
        onClick={type === 'createExternal' ? handleInviteClick : handleSaveClick}
        disabled={!isUserDataValid()}
        type='primary'>
        {$t(
          { defaultMessage: '{label}' },
          { label: type === 'createExternal' ? 'Invite' : 'Save' }
        )}
      </Button>
      <Button onClick={handleCancelClick}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>
  )
  return <Drawer
    visible={opened}
    title={$t(
      { defaultMessage: '{title}' },
      { title: drawerTitle(type) }
    )}
    onClose={handleCancelClick}
    footer={drawerFooter}
    width={400}
  ><Loader states={[{ isLoading: isLoading }]}>
      <Form layout='vertical' form={form}>
        {drawerContentConfig[type as UserType].map((item) => (
          <FormItem
            key={item.name}
            name={item.name}
            labelKey={$t(item.labelKey)}
            component={
              <item.component
                {...item.componentProps({
                  selectedUser,
                  updatedUser,
                  onChange: (updatedValue: object) => setUpdatedUser(
                    { ...updatedUser, ...updatedValue }
                  )
                })}
              />
            }
          />
        ))}
      </Form>
    </Loader>
  </Drawer>
}