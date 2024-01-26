import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useDeleteDnsRecordMutation,
  useGetDNSRecordsQuery
} from '@acx-ui/rc/services'
import {
  DNSRecord,
  FILTER,
  SEARCH,
  useTableQuery
} from '@acx-ui/rc/utils'

import { DNSRecordDrawer } from './DNSRecordDrawer'


export function DNSRecordsTab () {
  const { $t } = useIntl()

  const settingsId = 'dns-table'
  const { gatewayId } = useParams()

  const [drawerState, setDrawerState] = useState<{
    isEdit: boolean,
    visible: boolean,
    id?: string
  }>({
    isEdit: false,
    visible: false
  })

  const rwgPayload = {
    fields: [
      'check-all',
      'name',
      'id'
    ],
    searchTargetFields: ['name'],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const tableQuery = useTableQuery({
    useQuery: useGetDNSRecordsQuery,
    apiParams: {
      gatewayId: gatewayId as string
    },
    defaultPayload: rwgPayload,
    search: {
      searchTargetFields: rwgPayload.searchTargetFields as string[]
    },
    pagination: { settingsId }
  })

  const [deleteDnsRecords] = useDeleteDnsRecordMutation()

  const actions: TableProps<DNSRecord>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add DNS Record' }),
      onClick: () => setDrawerState({ isEdit: false, visible: true, id: undefined })
    }
  ]

  const rowActions: TableProps<DNSRecord>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedItems => selectedItems.length <= 1),
      onClick: (rows, clearSelection) => {
        setDrawerState({ id: rows[0].id, isEdit: true, visible: true })
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {
        setDrawerState({ isEdit: false, visible: false })
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'DNS Record' }),
            entityValue: selectedItems[0].name,
            numOfEntities: selectedItems.length
          },
          onOk: () => {
            deleteDnsRecords({ params: { gatewayId, dnsRecordId: selectedItems[0].id } })
              .then(() => clearSelection())
          }
        })
      }
    }
  ]

  const columns: TableProps<DNSRecord>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      fixed: 'left',
      searchable: true,
      render: function (_, row, __, highlightFn) {
        return highlightFn(row.name)
      }
    },
    {
      key: 'host',
      title: $t({ defaultMessage: 'Host' }),
      dataIndex: 'host',
      searchable: false
    },
    {
      key: 'dataType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'dataType',
      searchable: false
    },
    {
      key: 'data',
      title: $t({ defaultMessage: 'Data' }),
      dataIndex: 'data',
      searchable: false
    },
    {
      key: 'ttl',
      title: $t({ defaultMessage: 'TTL' }),
      dataIndex: 'ttl',
      searchable: false
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = { ...tableQuery.payload, filters: { name: customSearch?.searchString ?? '' } }
    tableQuery.setPayload(payload)
  }

  return (
    <Loader
      states={[
        tableQuery,
        { isFetching: tableQuery.isFetching, isLoading: false }
      ]}
    >
      <Table
        rowKey='id'
        settingsId={settingsId}
        columns={columns}
        onFilterChange={handleFilterChange}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'radio' }}
      />
      <DNSRecordDrawer
        visible={drawerState.visible}
        isEdit={drawerState.isEdit}
        dnsRecordId={drawerState.id}
        onClose={() => setDrawerState({ isEdit: false, visible: false })}
      />
    </Loader>
  )
}
