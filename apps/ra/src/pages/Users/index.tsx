import React, { useEffect, useState } from 'react'

import { Button, Col, Row, Form } from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  useGetUsersQuery,
  useRefreshUserDetailsMutation,
  useUpdateUserRoleAndResourceGroupMutation,
  useDeleteUserResourceGroupMutation,
  useDeleteInvitationMutation
} from '@acx-ui/analytics/services'
import { ManagedUser }                                                                      from '@acx-ui/analytics/utils'
import { Drawer, PageHeader, Loader, StepsFormLegacy, Tooltip, showToast, showActionModal } from '@acx-ui/components'

import { drawerContentConfig } from './config'
import { UsersTable }          from './Table'

type FormItemProps = {
  name: string,
  labelKey: string,
  component: React.ReactNode,
}
const messages = {
  title: defineMessage({
    defaultMessage: '{usersCount, plural, one {User} other {Users}}'
  }),
  info: defineMessage({
    defaultMessage: `"Invite 3rd Party" allows you to invite a user who does not
    belong to your organisation into this RUCKUS AI account.
    {br}
    {br}
    "Add Internal User" allows you to include a user who belongs to your
    organisation into this RUCKUS AI account.
    {br}
    {br}
    In all cases, please note that the invitee needs to have an existing
    Ruckus Support account.`
  }),
  editUser: defineMessage({ defaultMessage: 'Edit User' }),
  save: defineMessage({ defaultMessage: 'Save' }),
  cancel: defineMessage({ defaultMessage: 'Cancel' }),
  refreshSuccessful: defineMessage({ defaultMessage: 'Refreshed user details successfully' }),
  refreshFailure: defineMessage({ defaultMessage: 'Refresh user details is unsuccessful' }),
  deleteSuccessful: defineMessage({ defaultMessage: 'Deleted user details successfully' }),
  deleteFailure: defineMessage({ defaultMessage: 'Delete user details is unsuccessful' }),
  editUserSuccess: defineMessage({ defaultMessage: 'Updated user details successfully' }),
  editUserFailure: defineMessage({ defaultMessage: 'Update user details is unsuccessful' }),
  deleteModalContent: defineMessage({
    defaultMessage: 'Do you really want to remove {firstName} {lastName}?'
  }),
  deleteModalTitle: defineMessage({ defaultMessage: 'Delete user' })
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

type DrawerContentProps = {
  selectedRow: ManagedUser | null;
  onRoleChange: (value: string) => void;
  onResourceGroupChange: (value: string) => void;
  updatedValues: {
    updatedRole: string | null;
    updatedResourceGroup: string | null;
  };
  type: 'edit' | 'create';
}

const DrawerContent: React.FC<DrawerContentProps> = ({
  selectedRow,
  onRoleChange,
  onResourceGroupChange,
  updatedValues,
  type
}) => {
  const { $t } = useIntl()
  const { updatedRole, updatedResourceGroup } = updatedValues

  return (
    <StepsFormLegacy.StepForm>
      {drawerContentConfig[type as keyof typeof drawerContentConfig].map(
        (item) => (
          <FormItem
            key={item.name}
            name={item.name}
            labelKey={$t(item.labelKey)}
            component={
              <item.component
                {...item.componentProps({
                  selectedRow,
                  updatedResourceGroup,
                  updatedRole,
                  onRoleChange,
                  onResourceGroupChange
                })}
              />
            }
          />
        )
      )}
    </StepsFormLegacy.StepForm>
  )
}
const Users = () => {
  const { $t } = useIntl()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedRow, setSelectedRow] = useState<ManagedUser | null>(null)
  const [retrieveUserDetails, setRetrieveUserDetails] = useState(false)
  const [deleteUser, setDeleteUser] = useState({ deleteUser: false, showModal: false })
  const [updatedRole, setUpdatedRole] = useState<string | null>(null)
  const [updatedResourceGroup, setUpdatedResourceGroup] = useState<string | null>(null)
  const usersQuery = useGetUsersQuery()
  const [refreshUserDetails] = useRefreshUserDetailsMutation()
  const [updateUserRoleAndResourceGroup] = useUpdateUserRoleAndResourceGroupMutation()
  const [deleteUserResourceGroup] = useDeleteUserResourceGroupMutation()
  const [deleteInvitation] = useDeleteInvitationMutation()

  const usersCount = usersQuery.data?.length || 0
  useEffect(() => {
    if (retrieveUserDetails && selectedRow) {
      refreshUserDetails({ userId: selectedRow.id })
        .then((response) => {
          usersQuery.refetch()
            .then( () => {
              const isSuccess = (response as { data: string })?.data
              showToast({
                type: isSuccess ? 'success' : 'error',
                content: $t(isSuccess ? messages.refreshSuccessful: messages.refreshFailure)
              })
            }
            )
        }).finally(() => setRetrieveUserDetails(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrieveUserDetails])

  useEffect(() => {
    if(deleteUser.showModal && selectedRow){
      showActionModal({
        type: 'confirm',
        title: $t(messages.deleteModalTitle) ,
        content: $t(messages.deleteModalContent, {
          firstName: selectedRow?.firstName, lastName: selectedRow?.lastName
        }),
        onOk: () => {
          setDeleteUser({ deleteUser: true, showModal: false })
        }
      })
    }
    if (deleteUser.deleteUser && selectedRow) {
      const deleteUserAction = !(selectedRow.invitation?.state === 'pending')
        ? deleteUserResourceGroup({ userId: selectedRow.id })
        : deleteInvitation(
          { resourceGroupId: updatedResourceGroup || selectedRow.resourceGroupId,
            userId: selectedRow.id
          })
      deleteUserAction
        .then((response) => {
          usersQuery.refetch()
            .then(() => {
              const isSuccess = !(response as { error: string })?.error
              showToast({
                type: isSuccess ? 'success' : 'error',
                content: $t(isSuccess ? messages.deleteSuccessful: messages.deleteFailure)
              })
            }
            )
        })
        .finally(() => setDeleteUser({ showModal: false ,deleteUser: false }))
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [selectedRow,deleteUser])

  /* istanbul ignore next */
  const handleSaveClick = () => {
    updateUserRoleAndResourceGroup({
      resourceGroupId: updatedResourceGroup ?? selectedRow?.resourceGroupId!,
      userId: selectedRow?.id!,
      role: updatedRole ?? selectedRow?.role!
    }).then((response) => {
      setOpenDrawer(false)
      const isSuccess = (response as { data: string })?.data
      showToast({
        type: isSuccess ? 'success' : 'error',
        content: $t(isSuccess ? messages.editUserSuccess: messages.editUserFailure)
      })
    })
  }

  /* istanbul ignore next */
  const handleCancelClick = () => {
    setOpenDrawer(false)
    setUpdatedRole(null)
    setUpdatedResourceGroup(null)
  }

  const drawerFooter = (
    <div>
      <Button
        onClick={handleSaveClick}
        disabled={!updatedRole && !updatedResourceGroup}
        type='primary'
      >
        {$t(messages.save)}
      </Button>
      <Button onClick={handleCancelClick}>
        {$t(messages.cancel)}
      </Button>
    </div>
  )
  return (
    <Loader states={[{
      isLoading: false || usersQuery.isLoading,
      isFetching: retrieveUserDetails || deleteUser.deleteUser || usersQuery.isFetching
    }]}>
      <PageHeader
        title={
          <>
            {$t(messages.title, { usersCount })} ({usersCount})
            <Tooltip.Info
              data-html
              title={$t(messages.info, { br: <br/> })}
            />
          </>
        }
      />
      <UsersTable
        data={usersQuery.data}
        toggleDrawer={setOpenDrawer}
        setSelectedRow={setSelectedRow}
        getLatestUserDetails={() => setRetrieveUserDetails(true)}
        handleDeleteUser={() => setDeleteUser({ ...deleteUser, showModal: true })}
      />
      <Drawer
        visible={openDrawer}
        title={$t(messages.editUser)}
        onClose={
          /* istanbul ignore next */
          () => setOpenDrawer(false)}
        footer={drawerFooter}
        width={400}
      >
        <DrawerContent
          selectedRow={selectedRow}
          onRoleChange={setUpdatedRole}
          onResourceGroupChange={setUpdatedResourceGroup}
          updatedValues={{ updatedRole, updatedResourceGroup }}
          type='edit'
        />
      </Drawer>
    </Loader>
  )
}

export default Users
