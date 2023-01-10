import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps }          from '@acx-ui/components'
import {
  useDeleteMacRegistrationMutation,
  useMacRegistrationsQuery, useUpdateMacRegistrationMutation
} from '@acx-ui/rc/services'
import { MacRegistration, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                      from '@acx-ui/react-router-dom'

import { MacAddressDrawer } from '../../MacRegistrationListForm/MacRegistrationListMacAddresses/MacAddressDrawer'
import { toTimeString }     from '../../MacRegistrationListUtils'

export function MacRegistrationsTab () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({ } as MacRegistration)

  const tableQuery = useTableQuery({
    useQuery: useMacRegistrationsQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'macAddress',
      sortOrder: 'asc'
    }
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
          entityName: $t({ defaultMessage: 'MAC Addresses' }),
          entityValue: rows.length === 1 ? rows[0].macAddress : undefined,
          numOfEntities: rows.length
        },
        onOk: () => {
          // eslint-disable-next-line max-len
          deleteMacRegistration({ params: { policyId, registrationId: rows[0].id } })
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
          params: { policyId, registrationId: rows[0].id },
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
          params: { policyId, registrationId: rows[0].id },
          payload: { revoked: false }
        }).then(clearSelection)
    }
  }]

  const columns: TableProps<MacRegistration>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'macAddress',
      dataIndex: 'macAddress',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      render: function (data, row) {
        if (row.revoked) {
          return $t({ defaultMessage: 'Revoked' })
        }
        if (row.expirationDate) {
          // eslint-disable-next-line max-len
          return row.expirationDate < new Date().toISOString() ? $t({ defaultMessage: 'Expired' }) : $t({ defaultMessage: 'Active' })
        }
        return 'Unknown'
      }
    },
    {
      title: $t({ defaultMessage: 'Username' }),
      key: 'username',
      dataIndex: 'username',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'E-Mail' }),
      key: 'email',
      dataIndex: 'email'
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
        // eslint-disable-next-line max-len
        return row.expirationDate ? toTimeString(row.expirationDate) : $t({ defaultMessage: 'Never expires (Same as list)' })
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
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
        actions={[{
          label: $t({ defaultMessage: 'Add MAC Address' }),
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
