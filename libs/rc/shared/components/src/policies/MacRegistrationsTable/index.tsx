import { useEffect, useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  doProfileDelete, getDisabledActionMessage,
  useDeleteMacRegistrationsMutation, useGetMacRegListQuery,
  useSearchPersonaListQuery,
  useUpdateMacRegistrationMutation,
  useUploadMacRegistrationMutation
} from '@acx-ui/rc/services'
import {
  FILTER,
  MacRegistration,
  MacRegistrationPool,
  returnExpirationString,
  SEARCH,
  toDateTimeString,
  filterByAccessForServicePolicyMutation, getScopeKeyByPolicy,
  PolicyType, PolicyOperation, IdentityDetailsLink, TableQuery
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'

import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../../ImportFileDrawer'
import { MacAddressDrawer }                                from '../MacRegistrationListForm/MacRegistrationListMacAddresses/MacAddressDrawer'

interface MacRegistrationTableProps {
  tableQuery: TableQuery<MacRegistration, RequestPayload, unknown>,
  policyId: string
}

export function MacRegistrationsTable (props: MacRegistrationTableProps) {
  const { $t } = useIntl()
  const { policyId, tableQuery } = props
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({ } as MacRegistration)
  const [ uploadCsvDrawerVisible, setUploadCsvDrawerVisible ] = useState(false)
  const [ uploadCsv, uploadCsvResult ] = useUploadMacRegistrationMutation()

  const macRegistrationListQuery = useGetMacRegListQuery({ params: { policyId } })

  const isIdentityRequired = useIsSplitOn(Features.MAC_REGISTRATION_REQUIRE_IDENTITY_GROUP_TOGGLE)

  const filter = {
    filterKey: 'macAddress',
    operation: 'cn',
    value: ''
  }

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

  const { data: identityList } = useSearchPersonaListQuery(
    { payload: { pageSize: 1000,
      ids: [...new Set(tableQuery.data?.data?.map(d => d.identityId))] } },
    { skip: !tableQuery.data || !isIdentityRequired })

  const rowActions: TableProps<MacRegistration>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows, clearSelection) => {
      setEditData(selectedRows[0])
      setVisible(true)
      setIsEditMode(true)
      clearSelection()
    },
    scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.EDIT)
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    disabled: ([selectedRow]) => !!selectedRow?.identityId,
    tooltip: (selectedRow) => getDisabledActionMessage(
      selectedRow,
      [{ fieldName: 'identityId', fieldText: $t({ defaultMessage: 'Identity' }) }],
      $t({ defaultMessage: 'delete' })),
    onClick: (selectedRows: MacRegistration[], clearSelection) => {
      doProfileDelete(
        selectedRows,
        $t({ defaultMessage: 'MAC Address' }),
        selectedRows[0].macAddress,
        isIdentityRequired ? [] :
          [{ fieldName: 'identityId', fieldText: $t({ defaultMessage: 'Identity' }) }],
        // eslint-disable-next-line max-len
        async () => deleteMacRegistrations({ params: { policyId, registrationId: selectedRows[0].id }, payload: selectedRows.map(p => p.id) })
          .then(() => {
            clearSelection()
          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })
      )
    },
    scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.DELETE)
  },
  {
    label: $t({ defaultMessage: 'Revoke' }),
    disabled: ([selectedRow]) => {
      if(selectedRow.revoked) {
        return true
      }
      else if(selectedRow.expirationDate) {
        return moment(selectedRow.expirationDate).isSameOrBefore(new Date())
      }
      return false
    },
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (rows, clearSelection) => {
      editMacRegistration(
        {
          params: { policyId, registrationId: rows[0].id },
          payload: { revoked: true }
        }).then(clearSelection)
    },
    scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.EDIT)
  },
  {
    label: $t({ defaultMessage: 'Unrevoke' }),
    disabled: ([selectedRow]) => !selectedRow.revoked,
    visible: (selectedRows) => selectedRows.length === 1,
    onClick: (rows, clearSelection) => {
      editMacRegistration(
        {
          params: { policyId, registrationId: rows[0].id },
          payload: { revoked: false }
        }).then(clearSelection)
    },
    scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.EDIT)
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
      title: isIdentityRequired
        ? $t({ defaultMessage: 'Identity' })
        : $t({ defaultMessage: 'Username' }),
      key: 'username',
      dataIndex: 'username',
      sorter: true,
      render: function (_, row) {
        if (isIdentityRequired) {
          const item = identityList?.data?.filter(data => data.id===row.identityId)[0]
          return (item ? <IdentityDetailsLink
            name={item.name}
            personaId={item.id}
            personaGroupId={item.groupId}
            revoked={item.revoked}
          /> : row.username)
        }
        return row.username
      }
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
    },
    {
      title: $t({ defaultMessage: 'Device Name' }),
      key: 'deviceName',
      dataIndex: 'deviceName'
    },
    {
      title: $t({ defaultMessage: 'Location' }),
      key: 'location',
      dataIndex: 'location'
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      dataOption: 'all',
      searchCriteriaList: [
        { ...(tableQuery.payload as { searchCriteriaList: { }[] })?.searchCriteriaList?.[0] },
        { ...filter, value: customSearch?.searchString ?? '' }
      ]
    }
    tableQuery.setPayload(payload)
  }

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteMacRegistrationsUpdating }
    ]}>
      <MacAddressDrawer
        visible={visible}
        policyId={policyId}
        setVisible={setVisible}
        isEdit={isEditMode}
        editData={isEditMode ? editData : undefined}
        // eslint-disable-next-line max-len
        expirationOfPool={returnExpirationString(macRegistrationListQuery.data ?? {} as MacRegistrationPool)}
        identityGroupId={macRegistrationListQuery?.data?.identityGroupId}
        defaultIdentityId={macRegistrationListQuery?.data?.identityId}
      />
      <ImportFileDrawer
        type={ImportFileDrawerType.DPSK}
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={512}
        acceptType={['csv']}
        templateLink={isIdentityRequired
          ? 'assets/templates/mac_registration_import_template_v2.csv'  // Change "Username" as "Identity Name"
          : 'assets/templates/mac_registration_import_template.csv'}
        visible={uploadCsvDrawerVisible}
        isLoading={uploadCsvResult.isLoading}
        importRequest={async (formData) => {
          try {
            // eslint-disable-next-line max-len
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
        settingsId={tableQuery.pagination.settingsId}
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={allowedRowActions}
        onFilterChange={handleFilterChange}
        rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
        actions={filterByAccessForServicePolicyMutation([{
          scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.CREATE),
          label: $t({ defaultMessage: 'Add MAC Address' }),
          onClick: () => {
            setIsEditMode(false)
            setVisible(true)
            setEditData({} as MacRegistration)
          }
        },
        {
          scopeKey: getScopeKeyByPolicy(PolicyType.MAC_REGISTRATION_LIST, PolicyOperation.CREATE),
          label: $t({ defaultMessage: 'Import From File' }),
          onClick: () => setUploadCsvDrawerVisible(true)
        }])}
      />
    </Loader>
  )
}
