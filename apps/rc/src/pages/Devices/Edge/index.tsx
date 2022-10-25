import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  Table,
  TableProps,
  showActionModal } from '@acx-ui/components'
import { EdgeViewModel }                          from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const EdgesTable = () => {

  // TODO will remove when api is ready
  const mockEdgeList: EdgeViewModel[] = [
    {
      name: 'Mock Edge 1',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000001',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    },
    {
      name: 'Mock Edge 2',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000002',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 3',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000003',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 4',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000004',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 5',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000005',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 6',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000006',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 7',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000007',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 8',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000008',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 9',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000009',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
    ,
    {
      name: 'Mock Edge 10',
      status: 'Operational',
      type: 'Virtual',
      model: '###',
      serialNumber: '0000000010',
      ip: '127.0.0.1',
      ports: '80',
      venue: {
        name: 'Mock Venue 1',
        id: 'mock_venue_1'
      },
      tags: ['Tag1', 'Tag2']
    }
  ]

  // TODO will remove when api is ready
  const mockPagination = {
    current: 1,
    pageSize: 10,
    total: 10
  }

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')

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
      dataIndex: ['venue', 'name'],
      sorter: true,
      filterable: true,
      render: (data, row) => {
        return (
          <TenantLink to={`/venues/${row.venue.id}/venue-details/overview`}>
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
            // TODO should wire up delete edge API
            clearSelection()
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
    <Loader>
      <Table
        columns={columns}
        dataSource={mockEdgeList}
        pagination={mockPagination}
        // TODO when api is ready will implement this onChange={tableQuery.handleTableChange}
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