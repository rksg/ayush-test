import { useEffect, useState } from 'react'

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
import { sortProp, defaultSort, PrivilegeGroup, CustomGroupType } from '@acx-ui/rc/utils'
import { useTenantLink }                                          from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext }                  from '@acx-ui/user'
import { AccountType, noDataDisplay }                             from '@acx-ui/utils'

interface PrivilegeGroupsTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

const PrivilegeGroups = (props: PrivilegeGroupsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const navigate = useNavigate()
  const [privilegeGroupData, setPrivilegeGroupData] = useState([] as PrivilegeGroup[])
  const { data: userProfileData } = useUserProfileContext()

  const { data: privilegeGroupList, isLoading, isFetching }
    = useGetPrivilegeGroupsQuery({ params })

  const [deletePrivilegeGroup, { isLoading: isDeletePrivilegeGroupUpdating }]
    = useDeletePrivilegeGroupMutation()
  const linkAddPriviledgePath =
    useTenantLink('/administration/userPrivileges/privilegeGroups', 't')

  useEffect(() => {
    if (privilegeGroupList) {
      setPrivilegeGroupData(privilegeGroupList as PrivilegeGroup[])
    }
  }, [privilegeGroupList])

  const handleClickAdd = () => {
    navigate({
      ...linkAddPriviledgePath,
      pathname: `${linkAddPriviledgePath.pathname}/create`
    })
  }

  const columns:TableProps<PrivilegeGroup>['columns'] = [
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
      key: 'roleName',
      dataIndex: 'roleName',
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      key: 'scope',
      dataIndex: 'scope',
      render: function (_, row) {
        return row.allCustomers ? $t({ defaultMessage: 'All Customers' }) : noDataDisplay
      }
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

  const rowActions: TableProps<PrivilegeGroup>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'View' }),
      visible: (selectedRows) => {
        return selectedRows.length === 1
      },
      onClick: (selectedRows) => {
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/view/${selectedRows[0].id}`
        }, { state: selectedRows[0] })
      }
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== CustomGroupType.SYSTEM)
      },
      onClick: (selectedRows) => {
        // show edit dialog
        // setEditData(selectedRows[0])
        // setEditMode(true)
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/edit/${selectedRows[0].id}`
        }, { state: selectedRows[0] })
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
        }, { state: selectedRows[0] })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== CustomGroupType.SYSTEM)
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
            deletePrivilegeGroup({ params: { ...params, privilegeGroupId: rows[0].id } })
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
        isFetching: isFetching || isDeletePrivilegeGroupUpdating
      }
    ]}>
      <Table
        columns={columns}
        dataSource={privilegeGroupData}
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
