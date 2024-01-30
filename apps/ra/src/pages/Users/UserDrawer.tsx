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

import { drawerContentConfig } from './config'


export type UserType = 'edit' | 'create' | 'invite3rdParty'
type UserDrawerProps = {
  opened: boolean
  selectedRow: ManagedUser | null
  type: UserType
  toggleDrawer: CallableFunction
}
const drawerTitle = (type: string) : string => {
  switch(type) {
    case 'create': return 'Add Internal'
    case 'invite3rdParty': return 'Invite 3RD Party'
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
            { action: type === 'edit' ? 'edited' : 'added' }
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
    try {
      await form.validateFields()
    } catch {
      return
    }
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
        return updatedUser.invitedEmail &&
        updatedUser.resourceGroupId &&
        updatedUser.role &&
        updatedUser?.disclaimerChecked
    }
  }
  const handleCancelClick = () => cleanUp()

  const drawerFooter = (
    <div>
      <Button
        onClick={type === 'invite3rdParty' ? handleInviteClick : handleSaveClick}
        disabled={!isUserDataValid()}
        type='primary'>
        {$t(
          { defaultMessage: '{label}' },
          { label: type === 'invite3rdParty' ? 'Invite' : 'Save' }
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
        {drawerContentConfig[type as UserType].map(
          ({ labelKey, tooltip, componentProps, component: Cmp, ...props }, index) => (
            <Row key={index} gutter={20}>
              <Col span={24}>
                <Form.Item
                  label={tooltip
                    ? <>
                      {$t(labelKey)}
                      <Tooltip.Info
                        title={$t(tooltip)}
                        placement='top' />
                    </>
                    : $t(labelKey)
                  }
                  children={<Cmp
                    {...componentProps({
                      selectedUser,
                      updatedUser,
                      onChange: (updatedValue: object) => setUpdatedUser(
                        { ...updatedUser, ...updatedValue }
                      )
                    })}
                  />}
                  {...props}
                />
              </Col>
            </Row>
          ))}
      </Form>
    </Loader>
  </Drawer>
}