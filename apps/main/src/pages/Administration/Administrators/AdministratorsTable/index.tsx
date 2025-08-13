import React, { useState } from 'react'

import { Tooltip }   from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Loader,
  showActionModal,
  Table,
  TableProps,
  Subtitle
} from '@acx-ui/components'
import { useIsSplitOn, Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useGetMspProfileQuery }                    from '@acx-ui/msp/services'
import { MSPUtils }                                 from '@acx-ui/msp/utils'
import {
  useGetAdminListQuery,
  useGetAdminListPaginatedQuery,
  useDeleteAdminMutation,
  useDeleteAdminsMutation
} from '@acx-ui/rc/services'
import {
  Administrator,
  sortProp,
  defaultSort,
  AdministrationUrlsInfo
}                 from '@acx-ui/rc/utils'
import { RolesEnum } from '@acx-ui/types'
import {
  filterByAccess,
  useUserProfileContext,
  roleStringMap
} from '@acx-ui/user'
import { AccountType, getOpsApi, useTableQuery } from '@acx-ui/utils'

import * as UI from '../styledComponents'

import AddAdministratorDialog  from './AddAdministratorDialog'
import EditAdministratorDialog from './EditAdministratorDialog'

interface AdministratorsTableProps {
  currentUserMail: string | undefined;
  isPrimeAdminUser: boolean;
  isMspEc: boolean;
  tenantType?: string;
}

interface TooltipRowProps extends React.PropsWithChildren {
  'data-row-key': string;
}

const AdministratorsTable = (props: AdministratorsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, isMspEc, tenantType } = props
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Administrator>({} as Administrator)
  const [editNameOnly, setEditNameOnly] = useState(false)
  const { data: userProfileData } = useUserProfileContext()
  const mspUtils = MSPUtils()
  const currentUserMail = userProfileData?.email
  const currentUserDetailLevel = userProfileData?.detailLevel
  const allowDeleteAdminFF = useIsSplitOn(Features.MSPEC_ALLOW_DELETE_ADMIN)
  const isSsoAllowed = useIsTierAllowed(Features.SSO)
  const idmDecouplngFF = useIsSplitOn(Features.IDM_DECOUPLING) && isSsoAllowed
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)
  const isMspRbacMspEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isPaginationEnabled = useIsSplitOn(Features.PTENANT_USERS_PRIVILEGES_FILTER_TOGGLE)

  const { data: mspProfile } = useGetMspProfileQuery({ params, enableRbac: isMspRbacMspEnabled })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)

  // Conditional implementation based on feature flag
  const settingsId = 'administrators-table-column-settings'

  const defaultPayload = {
    page: 1,
    pageSize: 10,
    sortField: 'name',
    sortOrder: 'ASC',
    searchTargetFields: ['name', 'username'],
    searchString: '',
    filters: {}
  }

  const tableQuery = useTableQuery({
    useQuery: useGetAdminListPaginatedQuery,
    defaultPayload,
    search: {
      searchTargetFields: defaultPayload.searchTargetFields,
      searchString: defaultPayload.searchString
    },
    pagination: { settingsId },
    option: { skip: !isPaginationEnabled }
  })

  const { data: adminListOriginal, isLoading: isLoadingOriginal, isFetching: isFetchingOriginal } =
    useGetAdminListQuery({ params }, { skip: isPaginationEnabled })

  const adminList = isPaginationEnabled ? (tableQuery?.data?.data || []) : (adminListOriginal || [])

  const privilegeGroupOption = (adminList && adminList.length > 0)
    ? _.uniq(adminList.filter(item => !!item.role).map(c=>c.role))
    : []

  const [deleteAdmin, { isLoading: isDeleteAdminUpdating }] = useDeleteAdminMutation()
  const [deleteAdmins, { isLoading: isDeleteAdminsUpdating }] = useDeleteAdminsMutation()

  const handleOpenDialog = () => {
    setShowDialog(true)
  }

  const handleClickAdd = () => {
    setEditMode(false)
    setEditData({} as Administrator)
    handleOpenDialog()
  }

  const isAllPrimeAdminSelected = (selectedRows: Administrator[]) => {
    let isAllSelected = true
    adminList?.forEach((admin) => {
      if (admin.role === RolesEnum.PRIME_ADMIN) {
        const index = _.findIndex(selectedRows, (o) => admin.id === o.id)
        if (index === -1) {
          isAllSelected = false
        }
      }
    })

    return (isMspEc && allowDeleteAdminFF) ? false : isAllSelected
  }

  const isSelfSelected = (selectedRows: Administrator[]): boolean => {
    let isSelected = false
    adminList?.forEach((admin) => {
      if (admin.email === currentUserMail) {
        const index = _.findIndex(selectedRows, (o) => admin.id === o.id)
        if (index !== -1) { // the admin himself/herself was selected
          isSelected = true
        }
      }
    })

    return isSelected
  }

  const handleRowSelectChange = (record: unknown,
    selected: boolean, selectedRows: Administrator[]) => {
    if (selectedRows.length === 1) {
      const allPrimeAdminSelected = isAllPrimeAdminSelected(selectedRows)
      const selfSelected = isSelfSelected(selectedRows)

      // name is the only editable field:
      // - the only one prime admin
      setEditNameOnly(selfSelected || allPrimeAdminSelected)
    }
  }

  const columns:TableProps<Administrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'id',
      searchable: true,
      dataIndex: isPaginationEnabled ? 'name' : 'fullName',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp(isPaginationEnabled ? 'name' : 'fullName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      key: isPaginationEnabled ? 'username' : 'email',
      searchable: true,
      dataIndex: isPaginationEnabled ? 'username' : 'email',
      sorter: { compare: sortProp(isPaginationEnabled ? 'username' : 'email', defaultSort) }
    },
    ...(idmDecouplngFF ?
      [
        {
          title: $t({ defaultMessage: 'Authentication Type' }),
          key: 'authenticationId',
          dataIndex: 'authenticationId',
          sorter: { compare: sortProp('authenticationId', defaultSort) },
          filterable: [
            {
              key: null,
              value: $t({ defaultMessage: 'RUCKUS' })
            },
            {
              key: 'SSO',
              value: $t({ defaultMessage: 'SSO with 3rd Party' })
            }
          ],
          render: function (_: unknown, row: Administrator) {
            return row.authenticationId
              ? $t({ defaultMessage: 'SSO with 3rd Party' }) : $t({ defaultMessage: 'RUCKUS' })
          }
        }
      ]
      :
      []
    ),
    {
      title: $t({ defaultMessage: 'Role' }),
      key: 'role',
      dataIndex: 'role',
      sorter: { compare: sortProp('role', defaultSort) },
      ...(isPaginationEnabled ? {
        filterable: privilegeGroupOption?.map(role => ({
          key: role as string,
          value: roleStringMap[role as RolesEnum]
            ? $t(roleStringMap[role as RolesEnum]) : role as string }))
          ?.sort(sortProp('value', defaultSort))
      } : {}),
      render: function (_, row) {
        return roleStringMap[row.role] ? $t(roleStringMap[row.role]) : ''
      }
    }
  ]

  const rowActions: TableProps<Administrator>['rowActions'] = [
    {
      visible: (selectedRows) => {
        // DISABLE to edit:
        //  - prime admin himself/herself
        //  - multiple-selected

        if (selectedRows.length === 1) {
          const selfSelected = isSelfSelected(selectedRows)

          return selfSelected === false
        } else {
          return false
        }
      },
      label: $t({ defaultMessage: 'Edit' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updateAdmin)],
      onClick: (selectedRows) => {
        // show edit dialog
        setEditMode(true)
        setEditData(selectedRows[0])
        handleOpenDialog()
      }
    },
    {
      visible: (selectedRows) => {
        // DISABLE to delete:
        //  - himself/herself
        //  - delete all prime admin

        const allPrimeAdminSelected = isAllPrimeAdminSelected(selectedRows)
        const selfSelected = isSelfSelected(selectedRows)
        if (selfSelected) return false
        return allPrimeAdminSelected === false
      },
      label: $t({ defaultMessage: 'Delete' }),
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.deleteAdmin)],
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Administrators' }),
            entityValue: rows.length === 1
              ? rows[0].fullName !== ' ' ? rows[0].fullName : rows[0].email
              : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteAdmin({ params: { ...params, adminId: rows[0].id } })
                .then(clearSelection) :
              deleteAdmins({ params, payload: rows.map(item => item.id) })
                .then(clearSelection)
          }
        })
      }
    }
  ]

  const tableActions = []
  if (isPrimeAdminUser && tenantType !== AccountType.MSP_REC) {
    tableActions.push({
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.addAdmin)],
      label: $t({ defaultMessage: 'Add Administrator' }),
      onClick: handleClickAdd
    })
  }

  const TooltipRow: React.FC<TooltipRowProps> = (props) => {
    const isPrimeAdminItself =
      props['data-row-key'] === userProfileData?.adminId && isPrimeAdminUser

    return isPrimeAdminItself ?
      <Tooltip
        placement='topLeft'
        title={$t({ defaultMessage: 'You cannot edit or delete yourself' })}
      >
        <tr {...props} />
      </Tooltip>
      : <tr {...props} />
  }

  return (
    <Loader states={[
      {
        isLoading: isPaginationEnabled
          ? (tableQuery.isLoading || !userProfileData)
          : (isLoadingOriginal || !userProfileData),
        isFetching: isPaginationEnabled
          ? (tableQuery.isFetching || isDeleteAdminUpdating || isDeleteAdminsUpdating)
          : (isFetchingOriginal || isDeleteAdminUpdating || isDeleteAdminsUpdating)
      }
    ]}>
      {!isGroupBasedLoginEnabled && <UI.TableTitleWrapper direction='vertical'>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Local Administrators' })}
        </Subtitle>
      </UI.TableTitleWrapper>}
      <Table
        settingsId={isPaginationEnabled ? settingsId : undefined}
        columns={columns}
        dataSource={adminList}
        rowKey='id'
        components={{
          body: {
            row: TooltipRow
          }
        }}
        {...(isPaginationEnabled ? {
          pagination: tableQuery.pagination,
          onChange: tableQuery.handleTableChange,
          onFilterChange: tableQuery.handleFilterChange
        } : {})}
        rowActions={isPrimeAdminUser
          ? filterByAccess(rowActions)
          : undefined}
        rowSelection={isPrimeAdminUser ? {
          type: 'checkbox',
          getCheckboxProps: (record: Administrator) => ({
            // only prime-admin cannot edit/delete itself
            disabled: record.email === currentUserMail && isPrimeAdminUser,
            name: record.fullName
          }),
          onSelect: handleRowSelectChange
        } : undefined}
        actions={filterByAccess(tableActions)}
      />

      { editMode ?
        <EditAdministratorDialog
          visible={showDialog}
          setVisible={setShowDialog}
          editData={editData}
          editNameOnly={editNameOnly}
          isMspEc={isMspEc}
          currentUserDetailLevel={currentUserDetailLevel}
        /> :
        <AddAdministratorDialog
          visible={showDialog}
          setVisible={setShowDialog}
          isMspEc={isMspEc}
          isOnboardedMsp={isOnboardedMsp}
          currentUserDetailLevel={currentUserDetailLevel}
        />}
    </Loader>
  )
}

export default AdministratorsTable
