import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetAdminListQuery,
  useDeleteAdminMutation,
  useDeleteAdminsMutation
} from '@acx-ui/rc/services'
import {  useTableQuery, Administrator } from '@acx-ui/rc/utils'

import AddAdministratorDialog from '../AddAdministratorDialog'

interface AdministratorsTableProps {
  currentUserMail: string | undefined;
  isPrimeAdminUser: boolean;
  isMspEc: boolean;
}

// const defaultPayload = {
//   fields: [
//     'fullName',
//     'email',
//     'role'
//   ],
//   filters: {},
//   sortField: 'fullName',
//   sortOrder: 'ASC'
// }

const AdministratorsTable = (props: AdministratorsTableProps) => {
  const { $t } = useIntl()
  const { isPrimeAdminUser, isMspEc } = props
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Administrator>({} as Administrator)

  const tableQuery = useTableQuery<Administrator>({
    useQuery: useGetAdminListQuery,
    defaultPayload: {}
  })

  const [deleteAdmin, { isLoading: isDeleteAdminUpdating }] = useDeleteAdminMutation()
  const [deleteAdmins, { isLoading: isDeleteAdminsUpdating }] = useDeleteAdminsMutation()

  const handleClickAddAdmin = () => {
    setShowDialog(true)
  }

  const columns: TableProps<Administrator>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'id',
      dataIndex: 'id',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => {
        return row.fullName
      }
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      key: 'email',
      dataIndex: 'email',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      key: 'roleDsc',
      dataIndex: 'roleDsc',
      sorter: true
    }
  ]

  const rowActions: TableProps<Administrator>['rowActions'] = [
    {
      visible: (selectedRows) => {
        // TODO: cannot edit themselves
        const canVisible = selectedRows.length === 1
        return canVisible
      },
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        // show edit dialog
        setEditMode(true)
        setEditData(selectedRows[0])
        handleClickAddAdmin()
      }
    },
    {
      visible: (selectedRows) => {
        // TODO: disable to delete themselves
        // TODO: cannot delete all prime_admin
        const canVisible = true
        return canVisible
      },
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Administrators' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteAdmin({ params: { serialNumber: rows[0].id } })
                .then(clearSelection) :
              deleteAdmins({ payload: rows.map(item => item.id) })
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
      onClick: handleClickAddAdmin
    })
  }

  const isOnboardedMsp = false // judge from getMspProfile data
  return (
    <>
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteAdminUpdating || isDeleteAdminsUpdating }
      ]}>
        <Table
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={isPrimeAdminUser ? rowActions : undefined}
          rowSelection={{ type: isPrimeAdminUser ? 'checkbox' : 'radio' }}
          actions={tableActions}
        />
      </Loader>

      <AddAdministratorDialog
        visible={showDialog}
        setVisible={setShowDialog}
        editMode={editMode}
        editData={editData}
        editNameOnly={true}
        isMspEc={isMspEc}
        isOnboardedMsp={isOnboardedMsp}
      />
    </>
  )
}

export default AdministratorsTable