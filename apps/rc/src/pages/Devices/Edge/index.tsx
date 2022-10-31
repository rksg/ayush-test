import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  Table,
  TableProps,
  showActionModal } from '@acx-ui/components'
import { useDeleteEdgeMutation, useGetEdgeListQuery } from '@acx-ui/rc/services'
import { EdgeViewModel, useTableQuery }               from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink }     from '@acx-ui/react-router-dom'

const EdgesTable = () => {

  const defaultPayload = {
    fields: [
      'name',
      'status',
      'type',
      'model',
      'serialNumber',
      'ip',
      'ports',
      'venueId',
      'venueName',
      'edgeGroupId',
      'tags'
    ],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeListQuery,
    defaultPayload
  })
  const [deleteEdge, { isLoading: isDeleteEdgeUpdating }] = useDeleteEdgeMutation()

  const columns: TableProps<EdgeViewModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      tooltip: 'test',
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      render: (data, row) => {
        return (
          <TenantLink to={`/devices/edge/${row.serialNumber}/edge-details/overview`}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      filterable: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      key: 'serialNumber',
      dataIndex: 'serialNumber',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Ports' }),
      key: 'ports',
      dataIndex: 'ports',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venue',
      dataIndex: ['venueName'],
      sorter: true,
      filterable: true,
      render: (data, row) => {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Tags' }),
      key: 'tags',
      dataIndex: 'tags',
      sorter: true,
      filterable: true,
      render: (data) => {
        return `${data}`
      }
    }
  ]

  const rowActions: TableProps<EdgeViewModel>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/devices/edge/${selectedRows[0].serialNumber}/edit`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edges' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteEdge({ params: { serialNumber: rows[0].serialNumber } })
                .then(clearSelection) :
              deleteEdge({ payload: rows.map(item => item.serialNumber) })
                .then(clearSelection)
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Reboot' }),
      onClick: () => {
        // TODO TBD
      }
    }
  ]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteEdgeUpdating }
    ]}>
      <Table
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='serialNumber'
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
      />
    </Loader>
  )
}

const Edges = () => {

  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'SmartEdge' })}
        extra={
          <TenantLink to='/devices/edge/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          </TenantLink>
        }
      />
      <EdgesTable />
    </>
  )
}

export default Edges