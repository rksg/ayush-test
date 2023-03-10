import { useState } from 'react'

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
import {
  useGetAdminListQuery,
  useGetMspProfileQuery,
  useDeleteAdminMutation,
  useDeleteAdminsMutation
} from '@acx-ui/rc/services'
import { Administrator, MSPUtils, sortProp, defaultSort }       from '@acx-ui/rc/utils'
import { RolesEnum }                                            from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, roleStringMap } from '@acx-ui/user'

import * as UI from '../styledComponents'

import AddAdministratorDialog  from './AddAdministratorDialog'
import EditAdministratorDialog from './EditAdministratorDialog'

interface AdministratorsTableProps {
  currentUserMail: string | undefined;
  isPrimeAdminUser: boolean;
  isMspEc: boolean;
}

const AdministratorsTable = (props: AdministratorsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, isMspEc } = props
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Administrator>({} as Administrator)
  const [editNameOnly, setEditNameOnly] = useState(false)
  const { data: userProfileData } = useUserProfileContext()
  const mspUtils = MSPUtils()
  const currentUserMail = userProfileData?.email
  const currentUserDetailLevel = userProfileData?.detailLevel

  const { data: mspProfile } = useGetMspProfileQuery({ params })
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

    return isAllSelected
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

  const columns:TableProps<Administrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'id',
      dataIndex: 'fullName',
      sorter: { compare: sortProp('fullName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      key: 'email',
      dataIndex: 'email',
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
        // DISABLE to edit:
        //  - prime admin himself/herself
        //  - multiple-selected

        if (selectedRows.length === 1) {
          const allPrimeAdminSelected = isAllPrimeAdminSelected(selectedRows)
          const selfSelected = isSelfSelected(selectedRows)

          // name is the only editable field:
          // - the only one prime admin
          setEditNameOnly(selfSelected || allPrimeAdminSelected)

          return selfSelected === false
        } else {
          return false
        }
      },
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
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Administrators' }),
            entityValue: rows.length === 1 ? rows[0].fullName : undefined,
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
  if (isPrimeAdminUser) {
    tableActions.push({
      /* TODO: hide: !rbacService.isRoleAllowed('AddAdminButton') */
      label: $t({ defaultMessage: 'Add Administrator' }),
      onClick: handleClickAdd
    })
  }

  // TODO: tooltip "'You cannot edit or delete yourself'"
  //        for prime admin user select himself/herself

  return (
    <Loader states={[
      { isLoading: isLoading || !userProfileData,
        isFetching: isFetching || isDeleteAdminUpdating || isDeleteAdminsUpdating
      }
    ]}>
      <UI.TableTitleWrapper direction='vertical'>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Local Administrators' })}
        </Subtitle>
      </UI.TableTitleWrapper>
      <Table
        columns={columns}
        dataSource={adminList}
        rowKey='id'
        rowActions={isPrimeAdminUser
          ? filterByAccess(rowActions)
          : undefined}
        rowSelection={{
          type: isPrimeAdminUser ? 'checkbox' : 'radio',
          getCheckboxProps: (record: Administrator) => ({
            // only prime-admin cannot edit/delete itself
            disabled: record.email === currentUserMail && isPrimeAdminUser,
            name: record.fullName

          })
        }}
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
