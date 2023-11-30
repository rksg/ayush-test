import { useState } from 'react'
import React        from 'react'

// import { Tooltip }   from 'antd'
// import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
// import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
// import { useGetMspProfileQuery }  from '@acx-ui/msp/services'
// import { MSPUtils }               from '@acx-ui/msp/utils'
import {
  useGetAdminListQuery,
  useDeleteAdminMutation,
  useDeleteAdminsMutation
} from '@acx-ui/rc/services'
import { Administrator, sortProp, defaultSort } from '@acx-ui/rc/utils'
// import { RolesEnum }                                            from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, roleStringMap } from '@acx-ui/user'
import { AccountType }                                          from '@acx-ui/utils'

import { AddGroupDrawer } from './AddGroupDrawer'


interface AdminGroupsTableProps {
  currentUserMail: string | undefined;
  isPrimeAdminUser: boolean;
  // isMspEc: boolean;
  tenantType?: string;
}

// interface TooltipRowProps extends React.PropsWithChildren {
//   'data-row-key': string;
// }

const AdminGroups = (props: AdminGroupsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, tenantType } = props
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Administrator>({} as Administrator)
  // const [editNameOnly, setEditNameOnly] = useState(false)
  const { data: userProfileData } = useUserProfileContext()
  // const mspUtils = MSPUtils()
  // const currentUserMail = userProfileData?.email
  // const currentUserDetailLevel = userProfileData?.detailLevel
  // const allowDeleteAdminFF = useIsSplitOn(Features.MSPEC_ALLOW_DELETE_ADMIN)
  // const isTechPartner =
  //    tenantType === TenantType.MSP_INSTALLER || tenantType === TenantType.MSP_INTEGRATOR

  // const { data: mspProfile } = useGetMspProfileQuery({ params })
  // const isOnboardedMsp = mspUtils.isOnboardedMsp(mspProfile) ||
  //    (isTechPartner)

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

  // const isAllPrimeAdminSelected = (selectedRows: Administrator[]) => {
  //   let isAllSelected = true
  //   adminList?.forEach((admin) => {
  //     if (admin.role === RolesEnum.PRIME_ADMIN) {
  //       const index = _.findIndex(selectedRows, (o) => admin.id === o.id)
  //       if (index === -1) {
  //         isAllSelected = false
  //       }
  //     }
  //   })

  //   return (isMspEc && allowDeleteAdminFF) ? false : isAllSelected
  // }

  // const isSelfSelected = (selectedRows: Administrator[]): boolean => {
  //   let isSelected = false
  //   adminList?.forEach((admin) => {
  //     if (admin.email === currentUserMail) {
  //       const index = _.findIndex(selectedRows, (o) => admin.id === o.id)
  //       if (index !== -1) { // the admin himself/herself was selected
  //         isSelected = true
  //       }
  //     }
  //   })

  //   return isSelected
  // }

  // const handleRowSelectChange = (record: unknown,
  //   selected: boolean, selectedRows: Administrator[]) => {
  //   if (selectedRows.length === 1) {
  //     const allPrimeAdminSelected = isAllPrimeAdminSelected(selectedRows)
  //     const selfSelected = isSelfSelected(selectedRows)

  //     // name is the only editable field:
  //     // - the only one prime admin
  //     setEditNameOnly(selfSelected || allPrimeAdminSelected)
  //   }
  // }

  // name: "cloud-admin",
  // groupId: "admins",
  // contactPerson: {
  //     name: "moshe",
  //     email: "moshe@google.com"
  // },
  //    role: "ROLE_1",
  // priority: 3

  const columns:TableProps<Administrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Group Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('fullName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Group ID' }),
      key: 'groupId',
      dataIndex: 'email',
      sorter: { compare: sortProp('email', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Processing Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      sorter: { compare: sortProp('email', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Logged Members' }),
      key: 'loggedMembers',
      dataIndex: 'loggedMembers',
      sorter: { compare: sortProp('email', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      key: 'role',
      dataIndex: 'role',
      sorter: { compare: sortProp('role', defaultSort) },
      render: function (_, row) {
        return roleStringMap[row.role] ? $t(roleStringMap[row.role]) : ''
      }
    }
  ]

  const rowActions: TableProps<Administrator>['rowActions'] = [
    {
      visible: (selectedRows) => {
        if (selectedRows.length === 1) {
          return true
        } else {
          return false
        }
      },
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        // show edit dialog
        setEditData(selectedRows[0])
        setEditMode(true)
        handleOpenDialog()
      }
    },
    {
      // visible: (selectedRows) => {
      //   const allPrimeAdminSelected = isAllPrimeAdminSelected(selectedRows)
      //   const selfSelected = isSelfSelected(selectedRows)
      //   if (selfSelected) return false
      //   return allPrimeAdminSelected === false
      // },
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Group' }),
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
      label: $t({ defaultMessage: 'Add Group' }),
      onClick: handleClickAdd
    })
  }

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeleteAdminUpdating || isDeleteAdminsUpdating
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
          type: 'checkbox'//,
          // onSelect: handleRowSelectChange
        } : undefined}
        actions={filterByAccess(tableActions)}
      />

      { editMode ?
        <AddGroupDrawer
          visible={showDialog}
          setVisible={setShowDialog}
          isEditMode={editMode}
          editData={editData}
        /> :
        <AddGroupDrawer
          visible={showDialog}
          setVisible={setShowDialog}
          isEditMode={editMode}
        />}
    </Loader>
  )
}

export default AdminGroups
