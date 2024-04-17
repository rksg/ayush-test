import { useEffect, useState } from 'react'

import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { useGetMspProfileQuery }    from '@acx-ui/msp/services'
import { MSPUtils }                 from '@acx-ui/msp/utils'
import {
  useGetPrivilegeGroupsQuery,
  useDeletePrivilegeGroupMutation
} from '@acx-ui/rc/services'
import { sortProp,
  defaultSort,
  PrivilegeGroup,
  CustomGroupType
} from '@acx-ui/rc/utils'
import { useTenantLink }                                        from '@acx-ui/react-router-dom'
import { RolesEnum }                                            from '@acx-ui/types'
import { filterByAccess, roleStringMap, useUserProfileContext } from '@acx-ui/user'
import { AccountType }                                          from '@acx-ui/utils'

interface PrivilegeGroupsTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

const PrivilegeGroups = (props: PrivilegeGroupsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const mspUtils = MSPUtils()
  const navigate = useNavigate()
  const [privilegeGroupData, setPrivilegeGroupData] = useState([] as PrivilegeGroup[])
  const { data: userProfileData } = useUserProfileContext()
  const { data: mspProfile } = useGetMspProfileQuery({ params })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)

  const { data: privilegeGroupList, isLoading, isFetching }
    = useGetPrivilegeGroupsQuery({ params })

  const [deletePrivilegeGroup, { isLoading: isDeletePrivilegeGroupUpdating }]
    = useDeletePrivilegeGroupMutation()
  const linkAddPriviledgePath =
    useTenantLink('/administration/userPrivileges/privilegeGroups', 't')

  useEffect(() => {
    if (privilegeGroupList) {
      setPrivilegeGroupData(privilegeGroupList ?? [])
    }
  }, [privilegeGroupList])

  const customRoleOption = (privilegeGroupData && privilegeGroupData.length > 0)
    ? _.uniq(privilegeGroupData.filter(item => !!item.roleName).map(c=>c.roleName))
    : []

  const handleClickAdd = () => {
    navigate({
      ...linkAddPriviledgePath,
      pathname: `${linkAddPriviledgePath.pathname}/create`
    }, { state: isOnboardedMsp })
  }

  const getPrivilegeScopes = (data: PrivilegeGroup) => {
    // const hasEc = data.delegation === true
    const OwnVenues = data?.policies?.length ?? 0
    const allCustomers = data?.policyEntityDTOS?.length ?? 0
    return isOnboardedMsp ? <>
      <div>{$t({ defaultMessage: 'Own Account: {venueCount}' }, { venueCount:
            OwnVenues === 0 ? 'All Venues' : OwnVenues+' venues' })} </div>
      <div>{$t({ defaultMessage: 'MSP Customers: {mspEcCount}' }, { mspEcCount:
            allCustomers === 0 ? 'All Customers' : allCustomers+' customers' })} </div>
    </> : $t({ defaultMessage: '{venueCount}' }, { venueCount:
            OwnVenues === 0 ? 'All Venues' : OwnVenues+' venues' })
  }

  const columns:TableProps<PrivilegeGroup>['columns'] = [
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
      title: $t({ defaultMessage: 'Role' }),
      key: 'roleName',
      dataIndex: 'roleName',
      filterable: customRoleOption?.map(role => ({
        key: role as string,
        value: roleStringMap[role as RolesEnum]
          ? $t(roleStringMap[role as RolesEnum]) : role as string })),
      render: (_, row) => {
        return roleStringMap[row.roleName as RolesEnum]
          ? $t(roleStringMap[row.roleName as RolesEnum]) : row.roleName
      }
    },
    {
      title: $t({ defaultMessage: 'Scope' }),
      key: 'scope',
      dataIndex: 'scope',
      render: function (_, row) {
        return getPrivilegeScopes(row)
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
      key: 'memberCount',
      dataIndex: 'memberCount',
      align: 'center'
    }
  ]

  const rowActions: TableProps<PrivilegeGroup>['rowActions'] = [
    // {
    //   label: $t({ defaultMessage: 'View' }),
    //   visible: (selectedRows) => {
    //     return (selectedRows.length === 1 && selectedRows[0].type === CustomGroupType.SYSTEM)
    //   },
    //   onClick: (selectedRows) => {
    //     navigate({
    //       ...linkAddPriviledgePath,
    //       pathname: `${linkAddPriviledgePath.pathname}/view/${selectedRows[0].id}`
    //     }, { state: selectedRows[0] })
    //   }
    // },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== CustomGroupType.SYSTEM)
      },
      onClick: (selectedRows) => {
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/edit/${selectedRows[0].id}`
        }, { state: isOnboardedMsp })
      }
    },
    {
      label: $t({ defaultMessage: 'Clone' }),
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].name !== RolesEnum.PRIME_ADMIN)
      },
      onClick: (selectedRows) => {
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/clone/${selectedRows[0].id}`
        }, { state: isOnboardedMsp })
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
            entityValue: rows[0].name,
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
        rowKey='name'
        rowActions={isPrimeAdminUser
          ? filterByAccess(rowActions)
          : undefined}
        rowSelection={isPrimeAdminUser ? {
          type: 'radio'//,
          // onSelect: handleRowSelectChange
        } : undefined}
        actions={filterByAccess(tableActions)}
        data-testid='PrivilegeGroupTable'
      />
    </Loader>
  )
}

export default PrivilegeGroups
