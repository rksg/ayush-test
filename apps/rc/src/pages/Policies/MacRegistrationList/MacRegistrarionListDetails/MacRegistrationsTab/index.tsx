import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { CsvSize, ImportFileDrawer }                             from '@acx-ui/rc/components'
import {
  useDeleteMacRegistrationMutation,
  useMacRegistrationsQuery,
  useUpdateMacRegistrationMutation,
  useUploadMacRegistrationMutation
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
  const [ uploadCsvDrawerVisible, setUploadCsvDrawerVisible ] = useState(false)
  const [ uploadCsv, uploadCsvResult ] = useUploadMacRegistrationMutation()

  const tableQuery = useTableQuery({
    useQuery: useMacRegistrationsQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'macAddress',
      sortOrder: 'asc'
    }
  })

  useEffect(()=>{
    if (uploadCsvResult.isSuccess) {
      setUploadCsvDrawerVisible(false)
    }
  },[uploadCsvResult])

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
    onClick: ([{ macAddress, id }], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'MAC Address' }),
          entityValue: macAddress
        },
        onOk: () => {
          deleteMacRegistration({ params: { policyId, registrationId: id } }).unwrap()
            .then(() => {
              showToast({
                type: 'success',
                // eslint-disable-next-line max-len
                content: $t({ defaultMessage: 'MAC Address {macAddress} was deleted' }, { macAddress })
              })
              clearSelection()
            }).catch((error) => {
              showToast({
                type: 'error',
                content: error.data.message
              })
            })
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
        return $t({ defaultMessage: 'Active' })
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
        return toTimeString(row.createdDate)
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toastDetailErrorMessage = (error: any) => {
    const subMessages = error.data?.subErrors?.map((e: { message: string }) => e.message)
    showToast({
      type: 'error',
      content: error.data?.message ?? $t({ defaultMessage: 'An error occurred' }),
      link: subMessages && { onClick: () => { alert(subMessages.join('\n')) } }
    })
  }

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
      <ImportFileDrawer type='DPSK'
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        acceptType={['csv']}
        templateLink='assets/templates/mac_registration_import_template.csv'
        visible={uploadCsvDrawerVisible}
        isLoading={uploadCsvResult.isLoading}
        importRequest={async (formData) => {
          try {
            await uploadCsv({ params: { policyId }, payload: formData }).unwrap()
            setUploadCsvDrawerVisible(false)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            toastDetailErrorMessage(error)
          }
        }}
        onClose={() => setUploadCsvDrawerVisible(false)} />
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
        },
        {
          label: $t({ defaultMessage: 'Import From File' }),
          onClick: () => setUploadCsvDrawerVisible(true)
        }]}
      />
    </Loader>
  )
}
