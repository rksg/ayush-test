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
  useGetAdminGroupsQuery,
  useDeleteAdminGroupsMutation
//   useUpdateAdminGroupsMutation
} from '@acx-ui/rc/services'
import { AdminGroup, sortProp, defaultSort }                    from '@acx-ui/rc/utils'
import { useTenantLink }                                        from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext, roleStringMap } from '@acx-ui/user'
import { AccountType }                                          from '@acx-ui/utils'

interface PrivilegeGroupsTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

const PrivilegeGroups = (props: PrivilegeGroupsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const navigate = useNavigate()
  //   const [showDialog, setShowDialog] = useState(false)
  //   const [editMode, setEditMode] = useState(false)
  //   const [editData, setEditData] = useState<AdminGroup>({} as AdminGroup)
  const { data: userProfileData } = useUserProfileContext()

  const { data: adminList, isLoading, isFetching } = useGetAdminGroupsQuery({ params })

  const [deleteAdminGroup, { isLoading: isDeleteAdminUpdating }] = useDeleteAdminGroupsMutation()
  //   const [updateAdminGroup] = useUpdateAdminGroupsMutation()
  const linkAddPriviledgePath =
    useTenantLink('/administration/userPrivileges/privilegeGroups', 't')

  const handleClickAdd = () => {
    navigate({
      ...linkAddPriviledgePath,
      pathname: `${linkAddPriviledgePath.pathname}/create`
    })
  }

  const columns:TableProps<AdminGroup>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('groupType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description'
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      key: 'role',
      dataIndex: 'role',
      filterable: true,
      render: function (_, row) {
        return row.role ? $t(roleStringMap[row.role]) : ''
      }
    },
    {
      title: $t({ defaultMessage: 'Group Type' }),
      key: 'groupType',
      dataIndex: 'groupType',
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      key: 'scope',
      dataIndex: 'scope'
    },
    {
      title: $t({ defaultMessage: 'Assigned Users' }),
      key: 'assignedUsers',
      dataIndex: 'assignedUsers'
    }
  ]

  const rowActions: TableProps<AdminGroup>['rowActions'] = [
    {
      visible: (selectedRows) => {
        if (selectedRows.length === 1) {
          return true
        } else {
          return false
        }
      },
      label: $t({ defaultMessage: 'View' }),
      onClick: (selectedRows) => {
        // show edit dialog
        // setEditData(selectedRows[0])
        // setEditMode(true)
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/edit/${selectedRows[0].id}`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Group' }),
            entityValue: rows.length === 1
              ? rows[0].name !== ' ' ? rows[0].name : rows[0].groupId
              : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteAdminGroup({ params, payload: rows.map(item => item.id) })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const tableActions = []
  if (isPrimeAdminUser && tenantType !== AccountType.MSP_REC) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add Privilege Group' }),
      onClick: handleClickAdd
    })
  }

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeleteAdminUpdating
      }
    ]}>
      <Table
        columns={columns}
        dataSource={adminList}
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

export default PrivilegeGroups
