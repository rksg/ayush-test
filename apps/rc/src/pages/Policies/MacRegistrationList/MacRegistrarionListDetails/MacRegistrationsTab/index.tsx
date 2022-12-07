import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps }          from '@acx-ui/components'
import {
  useDeleteMacRegistrationMutation,
  useMacRegistrationsQuery, useUpdateMacRegistrationMutation
} from '@acx-ui/rc/services'
import { MacRegistration, useMacRegListTableQuery } from '@acx-ui/rc/utils'
import { useParams }                                from '@acx-ui/react-router-dom'

import { MacAddressDrawer } from '../../MacRegistrationListForm/MacRegistrationListMacAddresses/MacAddressDrawer'
import { toTimeString }     from '../../MacRegistrationListUtils'

export function MacRegistrationsTab () {
  const { $t } = useIntl()
  const { macRegistrationListId } = useParams()
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({ } as MacRegistration)

  const tableQuery = useMacRegListTableQuery({
    useQuery: useMacRegistrationsQuery,
    defaultPayload: {}
  })

  const [
    deleteMacRegistration,
    { isLoading: isDeleteMacRegistrationUpdating }
  ] = useDeleteMacRegistrationMutation()

  const [editMacRegistration] = useUpdateMacRegistrationMutation()

  const rowActions: TableProps<MacRegistration>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows, clearSelection) => {
      setEditData(selectedRows[0])
      setVisible(true)
      setIsEditMode(true)
      clearSelection()
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Mac Addresses' }),
          entityValue: rows.length === 1 ? rows[0].macAddress : undefined,
          numOfEntities: rows.length,
          confirmationText: 'Delete'
        },
        onOk: () => {
          // eslint-disable-next-line max-len
          deleteMacRegistration({ params: { macRegistrationListId, registrationId: rows[0].id } })
            .then(clearSelection)
        }
      })
    }
  },
  {
    label: $t({ defaultMessage: 'Revoke' }),
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (rows, clearSelection) => {
      editMacRegistration(
        {
          params: { macRegistrationListId, registrationId: rows[0].id },
          payload: { revoked: true }
        }).then(clearSelection)
    }
  },
  {
    label: $t({ defaultMessage: 'Unrevoke' }),
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (rows, clearSelection) => {
      editMacRegistration(
        {
          params: { macRegistrationListId, registrationId: rows[0].id },
          payload: { revoked: false }
        }).then(clearSelection)
    }
  }]

  const columns: TableProps<MacRegistration>['columns'] = [
    {
      title: $t({ defaultMessage: 'Mac Address' }),
      key: 'macAddress',
      dataIndex: 'macAddress',
      sorter: true,
      render: function (data, row) {
        return row.macAddress
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      render: function (data, row) {
        if (row.revoked) {
          return 'Revoked'
        } else {
          if (row.expirationDate) {
            return row.expirationDate < new Date().toISOString() ? 'Expired' : 'Active'
          }
          return 'unknown'
        }
      }
    },
    {
      title: $t({ defaultMessage: 'Username' }),
      key: 'username',
      dataIndex: 'username',
      sorter: true,
      render: function (data, row) {
        return row.username
      }
    },
    {
      title: $t({ defaultMessage: 'E-Mail' }),
      key: 'email',
      dataIndex: 'email',
      render: function (data, row) {
        return row.email
      }
    },
    {
      title: $t({ defaultMessage: 'Registration Date' }),
      key: 'registrationDate',
      dataIndex: 'registrationDate',
      render: function (data, row) {
        return toTimeString(row.createDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      key: 'expirationDate',
      dataIndex: 'expirationDate',
      sorter: true,
      render: function (data, row) {
        return toTimeString(row.expirationDate)
      }
    }
  ]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteMacRegistrationUpdating }
    ]}>
      <MacAddressDrawer
        visible={visible}
        setVisible={setVisible}
        isEdit={isEditMode}
        editData={isEditMode ? editData : undefined}
      />
      <Table
        columns={columns}
        dataSource={tableQuery.data?.content}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
        actions={[{
          label: 'Add Mac Address',
          onClick: () => {
            setIsEditMode(false)
            setVisible(true)
            setEditData({} as MacRegistration)
          }
        }]}
      />
    </Loader>
  )
}
