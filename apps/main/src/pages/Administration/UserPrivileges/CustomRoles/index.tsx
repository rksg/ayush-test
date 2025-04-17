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
  useGetCustomRolesQuery,
  useDeleteCustomRoleMutation
} from '@acx-ui/rc/services'
import {
  sortProp,
  defaultSort,
  CustomRole,
  CustomGroupType,
  AdministrationUrlsInfo
}   from '@acx-ui/rc/utils'
import { useTenantLink }  from '@acx-ui/react-router-dom'
import { RolesEnum }      from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasAllowedOperations,
  roleStringMap,
  useUserProfileContext
} from '@acx-ui/user'
import { AccountType, getOpsApi } from '@acx-ui/utils'

interface CustomRolesTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

const CustomRoles = (props: CustomRolesTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const navigate = useNavigate()
  const [customRoleData, setCustomRoleData] = useState([] as CustomRole[])
  const { data: userProfileData } = useUserProfileContext()
  const { rbacOpsApiEnabled } = getUserProfile()

  const { data: roleList, isLoading, isFetching } = useGetCustomRolesQuery({ params })
  const [deleteCustomRole, { isLoading: isDeleteRoleUpdating }] = useDeleteCustomRoleMutation()
  const linkAddCustomRolePath =
    useTenantLink('/administration/userPrivileges/customRoles', 't')

  useEffect(() => {
    if (roleList) {
      setCustomRoleData(roleList)
    }
  }, [roleList])

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
      sorter: { compare: sortProp('name', defaultSort) },
      render: (_, row) => {
        return roleStringMap[row.name as RolesEnum]
          ? $t(roleStringMap[row.name as RolesEnum]) : row.name
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description'
    },
    {
      title: $t({ defaultMessage: 'Role Type' }),
      key: 'type',
      dataIndex: 'type'
    }
  ]

  const rowActions: TableProps<CustomRole>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== CustomGroupType.SYSTEM)
      },
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updateCustomRole)],
      onClick: (selectedRows) => {
        navigate({
          ...linkAddCustomRolePath,
          pathname: `${linkAddCustomRolePath.pathname}/edit/${selectedRows[0].id}`
        }, { state: selectedRows[0] })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== CustomGroupType.SYSTEM)
      },
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.deleteCustomRole)],
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Role' }),
            entityValue: rows[0].name,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteCustomRole({ params: { ...params, customRoleId: rows[0].id } })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  const tableActions = []
  const hasAddRolePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.addCustomRole)])
    : isPrimeAdminUser

  if (hasAddRolePermission && tenantType !== AccountType.MSP_REC) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add Role' }),
      onClick: handleClickAdd
    })
  }

  const hasRowPermissions = rbacOpsApiEnabled ? filterByAccess(rowActions).length > 0
    : isPrimeAdminUser

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeleteRoleUpdating
      }
    ]}>
      <Table
        columns={columns}
        dataSource={customRoleData}
        rowKey='id'
        rowActions={hasRowPermissions
          ? filterByAccess(rowActions)
          : undefined}
        rowSelection={hasRowPermissions ? {
          type: 'radio'//,
          // onSelect: handleRowSelectChange
        } : undefined}
        actions={filterByAccess(tableActions)}
        data-testid='CustomRoleTable'
      />
    </Loader>
  )
}

export default CustomRoles
