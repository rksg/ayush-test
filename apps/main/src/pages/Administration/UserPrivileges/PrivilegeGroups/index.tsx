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
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { useGetMspProfileQuery }    from '@acx-ui/msp/services'
import { MSPUtils }                 from '@acx-ui/msp/utils'
import {
  useGetPrivilegeGroupsQuery,
  useDeletePrivilegeGroupMutation
} from '@acx-ui/rc/services'
import { sortProp,
  defaultSort,
  PrivilegeGroup,
  CustomGroupType,
  AdministrationUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantType, useTenantLink }                                                                  from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                                  from '@acx-ui/types'
import { filterByAccess, getUserProfile, hasAllowedOperations, roleStringMap, useUserProfileContext } from '@acx-ui/user'
import { AccountType, getOpsApi }                                                                     from '@acx-ui/utils'

interface PrivilegeGroupsTableProps {
  isPrimeAdminUser: boolean;
  tenantType?: string;
}

export interface PrivilegeGroupSateProps {
  isOnboardedMsp?: boolean;
  name?: string;
  tenantType?: TenantType
}

const PrivilegeGroups = (props: PrivilegeGroupsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const mspUtils = MSPUtils()
  const navigate = useNavigate()
  const isMspRbacMspEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const [privilegeGroupData, setPrivilegeGroupData] = useState([] as PrivilegeGroup[])
  const { data: userProfileData } = useUserProfileContext()
  const { rbacOpsApiEnabled } = getUserProfile()
  const { data: mspProfile } = useGetMspProfileQuery({ params, enableRbac: isMspRbacMspEnabled })
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
    const stateProp: PrivilegeGroupSateProps = {
      isOnboardedMsp: isOnboardedMsp,
      tenantType: tenantType as TenantType
    }
    navigate({
      ...linkAddPriviledgePath,
      pathname: `${linkAddPriviledgePath.pathname}/create`
    }, { state: stateProp })
  }

  const getPrivilegeScopes = (data: PrivilegeGroup) => {
    // const hasEc = data.delegation === true
    const OwnVenues = data?.policies?.length ?? 0
    // eslint-disable-next-line max-len
    const venueCount = OwnVenues === 0 ?
      $t({ defaultMessage: 'All <VenuePlural></VenuePlural>' }) :
      $t({ defaultMessage: '{OwnVenues} <venuePlural></venuePlural>' }, { OwnVenues })
    const allCustomers = data?.policyEntityDTOS?.length ?? 0
    return isOnboardedMsp ? <>
      <div>{$t({ defaultMessage: 'Own Account: {venueCount}' }, { venueCount })} </div>
      <div>{data.allCustomers === true
        ? $t({ defaultMessage: 'MSP Customers: All Customers' })
        : $t({ defaultMessage: 'MSP Customers: {mspEcCount} Customers' },
          { mspEcCount: allCustomers })}
      </div>
    </> : $t({ defaultMessage: '{venueCount}' }, { venueCount })
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
      dataIndex: 'description',
      sorter: { compare: sortProp('description', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      key: 'roleName',
      dataIndex: 'roleName',
      sorter: { compare: sortProp('roleName', defaultSort) },
      filterable: customRoleOption?.map(role => ({
        key: role as string,
        value: roleStringMap[role as RolesEnum]
          ? $t(roleStringMap[role as RolesEnum]) : role as string }))
        ?.sort(sortProp('value', defaultSort)),
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
      sorter: { compare: sortProp('type', defaultSort) },
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Members' }),
      key: 'memberCount',
      dataIndex: 'memberCount',
      sorter: { compare: sortProp('memberCount', defaultSort) },
      align: 'center'
    }
  ]

  const rowActions: TableProps<PrivilegeGroup>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updatePrivilegeGroup)],
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== CustomGroupType.SYSTEM)
      },
      onClick: (selectedRows) => {
        const stateProp: PrivilegeGroupSateProps = {
          isOnboardedMsp: isOnboardedMsp,
          name: selectedRows[0].name,
          tenantType: tenantType as TenantType
        }
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/edit/${selectedRows[0].id}`
        }, { state: stateProp })
      }
    },
    {
      label: $t({ defaultMessage: 'Clone' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.addPrivilegeGroup)],
      visible: (selectedRows) => {
        const excludedRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.DPSK_ADMIN, RolesEnum.GUEST_MANAGER]
        return (selectedRows.length === 1 &&
          !excludedRoles.includes(selectedRows[0].name as RolesEnum))
      },
      onClick: (selectedRows) => {
        const stateProp: PrivilegeGroupSateProps = {
          isOnboardedMsp: isOnboardedMsp
        }
        navigate({
          ...linkAddPriviledgePath,
          pathname: `${linkAddPriviledgePath.pathname}/clone/${selectedRows[0].id}`
        }, { state: stateProp })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.deletePrivilegeGroup)],
      visible: (selectedRows) => {
        return (selectedRows.length === 1 && selectedRows[0].type !== CustomGroupType.SYSTEM &&
          selectedRows[0].memberCount === 0)
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
  const hasAddPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.addPrivilegeGroup)])
    : isPrimeAdminUser
  if (hasAddPermission && tenantType !== AccountType.MSP_REC) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add Privilege Group' }),
      onClick: handleClickAdd
    })
  }

  const hasRowPermissions = rbacOpsApiEnabled ? filterByAccess(rowActions).length > 0
    : isPrimeAdminUser

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeletePrivilegeGroupUpdating
      }
    ]}
    style={{ minHeight: 45 }}
    >
      <Table
        columns={columns}
        dataSource={privilegeGroupData}
        rowKey='name'
        rowActions={hasRowPermissions
          ? filterByAccess(rowActions)
          : undefined}
        rowSelection={hasRowPermissions ? {
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
