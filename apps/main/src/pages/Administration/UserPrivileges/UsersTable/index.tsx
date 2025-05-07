import { useState } from 'react'
import React        from 'react'

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
  useDeleteAdminMutation,
  useDeleteAdminsMutation
} from '@acx-ui/rc/services'
import { Administrator, sortProp, defaultSort, AdministrationUrlsInfo }                               from '@acx-ui/rc/utils'
import { RolesEnum }                                                                                  from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, roleStringMap, getUserProfile, hasAllowedOperations } from '@acx-ui/user'
import { AccountType, getOpsApi, noDataDisplay }                                                      from '@acx-ui/utils'


import * as UI from '../../Administrators/styledComponents'

import AddUserDrawer  from './AddUserDrawer'
import EditUserDrawer from './EditUserDrawer'

interface UsersTableProps {
  currentUserMail: string | undefined;
  isPrimeAdminUser: boolean;
  isMspEc: boolean;
  tenantType?: string;
}

interface TooltipRowProps extends React.PropsWithChildren {
  'data-row-key': string;
}

const UsersTable = (props: UsersTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, isMspEc, tenantType } = props
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Administrator>({} as Administrator)
  const [editNameOnly, setEditNameOnly] = useState(false)
  const { data: userProfileData } = useUserProfileContext()
  const { rbacOpsApiEnabled } = getUserProfile()
  const mspUtils = MSPUtils()
  const currentUserMail = userProfileData?.email
  const currentUserDetailLevel = userProfileData?.detailLevel
  const allowDeleteAdminFF = useIsSplitOn(Features.MSPEC_ALLOW_DELETE_ADMIN)
  const isSsoAllowed = useIsTierAllowed(Features.SSO)
  const idmDecouplngFF = useIsSplitOn(Features.IDM_DECOUPLING) && isSsoAllowed
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)
  const isMspRbacMspEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const notificationAdminContextualEnabled =
    useIsSplitOn(Features.NOTIFICATION_ADMIN_CONTEXTUAL_TOGGLE)

  const { data: mspProfile } = useGetMspProfileQuery({ params, enableRbac: isMspRbacMspEnabled })
  const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile)

  const { data: adminList, isLoading, isFetching } = useGetAdminListQuery({ params })

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

  const privilegeGroupOption = (adminList && adminList.length > 0)
    ? _.uniq(adminList.filter(item => !!item.role).map(c=>c.role))
    : []

  const columns:TableProps<Administrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'id',
      searchable: true,
      dataIndex: 'fullName',
      sorter: { compare: sortProp('fullName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      key: 'email',
      searchable: true,
      dataIndex: 'email',
      sorter: { compare: sortProp('email', defaultSort) }
    },
    ...(notificationAdminContextualEnabled ?
      [
        {
          title: $t({ defaultMessage: 'Phone Number' }),
          key: 'phoneNumber',
          dataIndex: 'phoneNumber',
          show: false,
          sorter: { compare: sortProp('phoneNumber', defaultSort) },
          render: function (_: unknown, row: Administrator) {
            return row.phoneNumber ?? noDataDisplay
          }
        }
      ]
      :
      []
    ),
    ...(idmDecouplngFF ?
      [
        {
          title: $t({ defaultMessage: 'Authentication Type' }),
          key: 'authenticationId',
          dataIndex: 'authenticationId',
          sorter: { compare: sortProp('authenticationId', defaultSort) },
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
      title: $t({ defaultMessage: 'Privilege Group' }),
      key: 'role',
      dataIndex: 'role',
      filterable: privilegeGroupOption?.map(role => ({
        key: role as string,
        value: roleStringMap[role as RolesEnum]
          ? $t(roleStringMap[role as RolesEnum]) : role as string })),
      sorter: { compare: sortProp('role', defaultSort) },
      render: function (_, row) {
        return roleStringMap[row.role] ? $t(roleStringMap[row.role]) : row.role
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
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.updateAdmin)],
      label: $t({ defaultMessage: 'Edit' }),
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
      rbacOpsIds: [getOpsApi(AdministrationUrlsInfo.deleteAdmin)],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName:
              rows.length === 1 ? $t({ defaultMessage: 'User' }) : $t({ defaultMessage: 'Users' }),
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

  const hasAddPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.addAdmin)])
    : isPrimeAdminUser
  const tableActions = []
  if (hasAddPermission && tenantType !== AccountType.MSP_REC) {
    tableActions.push({
      label: $t({ defaultMessage: 'Add User' }),
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

  const hasRowPermissions = rbacOpsApiEnabled ? filterByAccess(rowActions).length > 0
    : isPrimeAdminUser

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeleteAdminUpdating || isDeleteAdminsUpdating
      }
    ]}>
      {!isGroupBasedLoginEnabled && <UI.TableTitleWrapper direction='vertical'>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Local Administrators' })}
        </Subtitle>
      </UI.TableTitleWrapper>}
      <Table settingsId='users-table-column-settings'
        columns={columns}
        dataSource={adminList}
        rowKey='id'
        components={{
          body: {
            row: TooltipRow
          }
        }}
        rowActions={hasRowPermissions
          ? filterByAccess(rowActions)
          : undefined}
        rowSelection={hasRowPermissions ? {
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
        <EditUserDrawer
          visible={showDialog}
          setVisible={setShowDialog}
          editData={editData}
          editNameOnly={editNameOnly}
          isMspEc={isMspEc}
          currentUserDetailLevel={currentUserDetailLevel}
        /> :
        <AddUserDrawer
          visible={showDialog}
          setVisible={setShowDialog}
          isMspEc={isMspEc}
          isOnboardedMsp={isOnboardedMsp}
          currentUserDetailLevel={currentUserDetailLevel}
        />}
    </Loader>
  )
}

export default UsersTable
