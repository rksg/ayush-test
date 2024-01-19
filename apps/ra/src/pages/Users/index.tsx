import React, { useState } from 'react'

import { Button, Col, Form, Row } from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery, useUpdateUserRoleAndResourceGroupMutation } from '@acx-ui/analytics/services'
import { ManagedUser }                                                 from '@acx-ui/analytics/utils'
import { Drawer, PageHeader, Loader, StepsFormLegacy }                 from '@acx-ui/components'

import { drawerContentConfig } from './config'
import { UsersTable }          from './Table'

const title = defineMessage({
  defaultMessage: '{usersCount, plural, one {User} other {Users}}'
})

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
      {drawerContentConfig[type as 'edit'].map((item) => (
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
      ))}
    </StepsFormLegacy.StepForm>
  )
}
const Users: React.FC = () => {
  const { $t } = useIntl()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedRow, setSelectedRow] = useState<ManagedUser | null>(null)
  const [updatedRole, setUpdatedRole] = useState<string | null>(null)
  const [updatedResourceGroup, setUpdatedResourceGroup] = useState<string | null>(null)
  const usersQuery = useGetUsersQuery()
  const { data, refetch } = usersQuery
  const [updateUserRoleAndResourceGroup] = useUpdateUserRoleAndResourceGroupMutation()
  const usersCount = data?.length || 0

  const handleSaveClick = () => {
    updateUserRoleAndResourceGroup({
      resourceGroupId: updatedResourceGroup ?? selectedRow?.resourceGroupId!,
      userId: selectedRow?.id!,
      role: updatedRole ?? selectedRow?.role!
    })
    setOpenDrawer(false)
    refetch()
  }

  const handleCancelClick = () => {
    setOpenDrawer(false)
    setUpdatedResourceGroup(null)
    setUpdatedRole(null)
  }

  const drawerFooter = (
    <div>
      <Button
        onClick={handleSaveClick}
        disabled={!Boolean(updatedRole || updatedResourceGroup)}
        type='primary'>
        {$t({ defaultMessage: 'Save' })}
      </Button>
      <Button onClick={handleCancelClick}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>
  )

  return (
    <Loader states={[usersQuery]}>
      <PageHeader title={<>{$t(title, { usersCount })} ({usersCount})</>} />
      <UsersTable
        data={usersQuery.data}
        toggleDrawer={setOpenDrawer}
        setSelectedRow={setSelectedRow} />
      <Drawer
        visible={openDrawer}
        title={$t({ defaultMessage: 'Edit User' })}
        onClose={() => setOpenDrawer(false)}
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
