// import { useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'


import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetCustomRolesQuery,
  useDeleteCustomRoleMutation
} from '@acx-ui/rc/services'
import { sortProp, defaultSort, CustomRole }     from '@acx-ui/rc/utils'
import { useTenantLink }                         from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext } from '@acx-ui/user'
import { AccountType }                           from '@acx-ui/utils'

// import { fakedCustomRoleList } from '../__tests__/fixtures'

interface CustomRolesTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

const CustomRoles = (props: CustomRolesTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const navigate = useNavigate()
  //   const [showDialog, setShowDialog] = useState(false)
  //   const [editMode, setEditMode] = useState(false)
  //   const [editData, setEditData] = useState<AdminGroup>({} as AdminGroup)
  const { data: userProfileData } = useUserProfileContext()

  const { data: roleList, isLoading, isFetching } = useGetCustomRolesQuery({ params })
  const [deleteCustomRole, { isLoading: isDeleteRoleUpdating }] = useDeleteCustomRoleMutation()
  const linkAddCustomRolePath =
    useTenantLink('/administration/userPrivileges/customRoles', 't')

  const handleClickAdd = () => {
    navigate({
      ...linkAddCustomRolePath,
      pathname: `${linkAddCustomRolePath.pathname}/create`
    })
  }

  const columns:TableProps<CustomRole>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description'
    },
    {
      title: $t({ defaultMessage: 'Role Type' }),
      key: 'roleType',
      dataIndex: 'roleType'
    }
  ]

  const rowActions: TableProps<CustomRole>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'View' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].roleType === 'System')
      },
      onClick: (selectedRows) => {
        navigate({
          ...linkAddCustomRolePath,
          pathname: `${linkAddCustomRolePath.pathname}/view/${selectedRows[0].id}`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].roleType !== 'System')
      },
      onClick: (selectedRows) => {
        // show edit dialog
        // setEditData(selectedRows[0])
        // setEditMode(true)
        navigate({
          ...linkAddCustomRolePath,
          pathname: `${linkAddCustomRolePath.pathname}/edit/${selectedRows[0].id}`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Clone' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1)
      },
      onClick: (selectedRows) => {
        navigate({
          ...linkAddCustomRolePath,
          pathname: `${linkAddCustomRolePath.pathname}/clone/${selectedRows[0].id}`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].roleType !== 'System')
      },
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Role' }),
            entityValue: rows.length === 1
              ? rows[0].name
              : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteCustomRole({ params, payload: rows.map(item => item.id) })
              .then(clearSelection)
            clearSelection()
          }
        })
      }
    }
  ]

  const tableActions = []
  if (isPrimeAdminUser && tenantType !== AccountType.MSP_REC) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add Role' }),
      onClick: handleClickAdd
    })
  }

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeleteRoleUpdating
      }
    ]}>
      <Table
        columns={columns}
        // dataSource={fakedCustomRoleList as CustomRole[]}
        dataSource={roleList}
        rowKey='id'
        rowActions={isPrimeAdminUser
          ? filterByAccess(rowActions)
          : undefined}
        rowSelection={isPrimeAdminUser ? {
          type: 'radio'//,
          // onSelect: handleRowSelectChange
        } : undefined}
        actions={filterByAccess(tableActions)}
      />
    </Loader>
  )
}

export default CustomRoles
