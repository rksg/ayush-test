import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, showToast, Table, TableProps }            from '@acx-ui/components'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteMacRegistrationsMutation, useGetMacRegListQuery,
  useSearchMacRegistrationsQuery,
  useUpdateMacRegistrationMutation,
  useUploadMacRegistrationMutation
} from '@acx-ui/rc/services'
import { FILTER, MacRegistration, MacRegistrationPool, SEARCH, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                                                           from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                                           from '@acx-ui/user'

import { MacAddressDrawer }                         from '../../MacRegistrationListForm/MacRegistrationListMacAddresses/MacAddressDrawer'
import { returnExpirationString, toDateTimeString } from '../../MacRegistrationListUtils'

export function MacRegistrationsTab () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({ } as MacRegistration)
  const [ uploadCsvDrawerVisible, setUploadCsvDrawerVisible ] = useState(false)
  const [ uploadCsv, uploadCsvResult ] = useUploadMacRegistrationMutation()

  const macRegistrationListQuery = useGetMacRegListQuery({ params: { policyId } })

  const sorter = {
    sortField: 'macAddress',
    sortOrder: 'ASC'
  }

  const filter = {
    filterKey: 'macAddress',
    operation: 'cn',
    value: ''
  }

  const tableQuery = useTableQuery({
    useQuery: useSearchMacRegistrationsQuery,
    sorter,
    defaultPayload: {
      sorter,
      dataOption: 'all',
      searchCriteriaList: [
        { ...filter }
      ]
    }
  })

  useEffect(()=>{
    if (uploadCsvResult.isSuccess) {
      setUploadCsvDrawerVisible(false)
    }
  },[uploadCsvResult])

  const [
    deleteMacRegistrations,
    { isLoading: isDeleteMacRegistrationsUpdating }
  ] = useDeleteMacRegistrationsMutation()

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
    onClick: (selectedRows: MacRegistration[], clearSelection) => {
      doProfileDelete(
        selectedRows,
        $t({ defaultMessage: 'MAC Address' }),
        selectedRows[0].macAddress,
        [
          { fieldName: 'identityId', fieldText: $t({ defaultMessage: 'Identity' }) }
        ],
        // eslint-disable-next-line max-len
        async () => deleteMacRegistrations({ params: { policyId, registrationId: selectedRows[0].id }, payload: selectedRows.map(p => p.id) })
          .then(() => {
            const macAddress = selectedRows.map(row => row.macAddress).join(', ')
            if(selectedRows.length > 1) {
              showToast({
                type: 'success',
                content: $t(
                  { defaultMessage: 'MAC Address {macAddress} were deleted' },
                  { macAddress }
                )
              })
            } else {
              showToast({
                type: 'success',
                content: $t(
                  { defaultMessage: 'MAC Address {macAddress} was deleted' },
                  { macAddress }
                )
              })
            }
            clearSelection()
          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })
      )
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
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'revoked',
      sorter: true,
      render: function (_, row) {
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
      dataIndex: 'email',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Registration Date' }),
      key: 'registrationDate',
      dataIndex: 'createdDate',
      sorter: true,
      render: function (_, row) {
        return toDateTimeString(row.createdDate)
      }
    },
    {
      title: $t({ defaultMessage: 'Expiration Date' }),
      key: 'expirationDate',
      dataIndex: 'expirationDate',
      sorter: true,
      render: function (_, row) {
        return row.expirationDate ? toDateTimeString(row.expirationDate) :
          $t({ defaultMessage: 'Never Expire' })
      }
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      dataOption: 'all',
      searchCriteriaList: [
        { ...filter, value: customSearch?.searchString ?? '' }
      ]
    }
    tableQuery.setPayload(payload)
  }

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteMacRegistrationsUpdating }
    ]}>
      <MacAddressDrawer
        visible={visible}
        setVisible={setVisible}
        isEdit={isEditMode}
        editData={isEditMode ? editData : undefined}
        // eslint-disable-next-line max-len
        expirationOfPool={returnExpirationString(macRegistrationListQuery.data ?? {} as MacRegistrationPool)}
      />
      <ImportFileDrawer
        type={ImportFileDrawerType.DPSK}
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
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
        }}
        onClose={() => setUploadCsvDrawerVisible(false)} />
      <Table
        enableApiFilter
        settingsId='mac-regs-table'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        onFilterChange={handleFilterChange}
        rowSelection={hasAccess() && { type: 'checkbox' }}
        actions={filterByAccess([{
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
        }])}
      />
    </Loader>
  )
}
