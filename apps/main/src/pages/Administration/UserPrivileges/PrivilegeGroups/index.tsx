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
  useGetPrivilegeGroupsQuery,
  useDeletePrivilegeGroupMutation
} from '@acx-ui/rc/services'
import { sortProp, defaultSort, PriviliegeGroup } from '@acx-ui/rc/utils'
import { useTenantLink }                          from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext }  from '@acx-ui/user'
import { AccountType }                            from '@acx-ui/utils'

// import { fakedPriviliegeGroupList } from '../__tests__/fixtures'

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

  const { data: priviliegeGroupList, isLoading, isFetching }
    = useGetPrivilegeGroupsQuery({ params })

  const [deletePriviliegeGroup, { isLoading: isDeletePriviliegeGroupUpdating }]
    = useDeletePrivilegeGroupMutation()
  const linkAddPriviledgePath =
    useTenantLink('/administration/userPrivileges/privilegeGroups', 't')

  const handleClickAdd = () => {
    navigate({
      ...linkAddPriviledgePath,
      pathname: `${linkAddPriviledgePath.pathname}/create`
    })
  }

  const columns:TableProps<PriviliegeGroup>['columns'] = [
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
      title: $t({ defaultMessage: 'Role' }),
      key: 'role',
      dataIndex: 'role',
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      key: 'scope',
      dataIndex: 'scope'
    },
    {
      title: $t({ defaultMessage: 'Group Type' }),
      key: 'type',
      dataIndex: 'type',
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Members' }),
      key: 'members',
      dataIndex: 'members'
    }
  ]

  const rowActions: TableProps<PriviliegeGroup>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'View' }),
      visible: (selectedRows) => {
        return selectedRows.length === 1
      },
      onClick: (selectedRows) => {
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/view/${selectedRows[0].id}`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== 'System')
      },
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
      label: $t({ defaultMessage: 'Clone' }),
      visible: (selectedRows) => {
        return selectedRows.length === 1
      },
      onClick: (selectedRows) => {
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/clone/${selectedRows[0].id}`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== 'System')
      },
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Group' }),
            entityValue: rows.length === 1
              ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deletePriviliegeGroup({ params, payload: rows.map(item => item.id) })
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
        isFetching: isFetching || isDeletePriviliegeGroupUpdating
      }
    ]}>
      <Table
        columns={columns}
        // dataSource={fakedPriviliegeGroupList as PriviliegeGroup[]}
        dataSource={priviliegeGroupList}
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
