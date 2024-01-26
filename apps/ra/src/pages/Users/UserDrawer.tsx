import React, { useState } from 'react'

import { Button, Col, Form, Row } from 'antd'
import { isEqual, pick, isEmpty } from 'lodash'
import { useIntl }                from 'react-intl'


import {
  useUpdateUserMutation,
  useAddUserMutation
} from '@acx-ui/analytics/services'
import { ManagedUser }                                from '@acx-ui/analytics/utils'
import { Drawer, Loader, StepsFormLegacy, showToast } from '@acx-ui/components'

import { drawerContentConfig } from './config'


type FormItemProps = {
  name: string,
  labelKey: string,
  component: React.ReactNode,
}

const FormItem: React.FC<FormItemProps> = ({ name, labelKey, component }) => (
  <Row gutter={20}>
    <Col span={8}>
      <Form.Item name={name} label={labelKey}>
        {component}
      </Form.Item>
    </Col>
  </Row>
)

type UserDrawerProps = {
  opened: boolean
  selectedRow: ManagedUser | null
  type: 'edit' | 'create'
  toggleDrawer: CallableFunction
}

export const UserDrawer: React.FC<UserDrawerProps> = ({
  opened,
  selectedRow,
  type,
  toggleDrawer
}) => {
  const { $t } = useIntl()
  const selectedUser = pick(selectedRow,['id', 'email', 'resourceGroupId', 'role'])
  const [ updatedUser, setUpdatedUser ] = useState(selectedUser)
  const [ isLoading, setIsloading ] = useState(false)
  const [updateUser] = useUpdateUserMutation()
  const [addUser] = useAddUserMutation()
  const handleSaveClick = async () => {
    setIsloading(true)
    if (type === 'edit') {
      await updateUser({
        resourceGroupId: updatedUser.resourceGroupId!,
        userId: updatedUser.id!,
        role: updatedUser.role!
      })
        .unwrap()
        .then(() => {
          setIsloading(false)
          setUpdatedUser({})
          toggleDrawer(false)
          showToast({
            type: 'success',
            content: $t({ defaultMessage: 'User edited successfully' })
          })
        })
        .catch((error) => {
          setIsloading(false)
          setUpdatedUser({})
          toggleDrawer(false)
          showToast({
            type: 'error',
            content: $t({ defaultMessage: 'Error: {error}' }, { error: error.data })
          })
        })
    } else {
      await addUser({
        resourceGroupId: updatedUser.resourceGroupId!,
        swuId: updatedUser.id!,
        role: updatedUser.role!
      })
        .unwrap()
        .then(() => {
          setIsloading(false)
          setUpdatedUser({})
          toggleDrawer(false)
          showToast({
            type: 'success',
            content: $t({ defaultMessage: 'User added successfully' })
          })
        })
        .catch((error) => {
          setIsloading(false)
          setUpdatedUser({})
          toggleDrawer(false)
          showToast({
            type: 'error',
            content: $t({ defaultMessage: 'Error: {error}' }, { error: error.data })
          })
        })
    }
  }
  const isUserDataValid = () => {
    if (type === 'create') {
      return Boolean(
        updatedUser.id &&
        updatedUser.email &&
        updatedUser.resourceGroupId &&
        updatedUser.role
      )
    } else {
      return !isEmpty(updatedUser) && !isEqual(selectedUser, updatedUser)
    }
  }
  const handleCancelClick = () => {
    setUpdatedUser({})
    toggleDrawer(false)
  }

  const drawerFooter = (
    <div>
      <Button
        onClick={handleSaveClick}
        disabled={!isUserDataValid()}
        type='primary'>
        {$t({ defaultMessage: 'Save' })}
      </Button>
      <Button onClick={handleCancelClick}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>
  )
  return <Drawer
    visible={opened}
    title={$t(
      { defaultMessage: '{type} User' },
      { type: type === 'edit' ? 'Edit' : 'Create' }
    )}
    onClose={handleCancelClick}
    footer={drawerFooter}
    width={400}
  ><Loader states={[{ isLoading }]}>
      <StepsFormLegacy.StepForm>
        {drawerContentConfig[type as 'edit' | 'create'].map((item) => (
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
      </StepsFormLegacy.StepForm>
    </Loader>
  </Drawer>
}