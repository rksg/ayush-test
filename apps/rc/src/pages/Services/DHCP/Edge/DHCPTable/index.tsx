
import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps }                                                               from '@acx-ui/components'
import { useDeleteEdgeDhcpServicesMutation, useGetDhcpStatsQuery }                                                                      from '@acx-ui/rc/services'
import { DhcpStats, getServiceDetailsLink, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink }                                                                                       from '@acx-ui/react-router-dom'

import { EdgeDhcpServiceStatusLight } from '../EdgeDhcpStatusLight'

const EdgeDhcpTable = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const getDhcpStatsPayload = {
    fields: [
      'id',
      'serviceName',
      'dhcpPoolNum',
      'edgeNum',
      'venueNum',
      'health',
      'updateAvailable',
      'serviceVersion',
      'tags'
    ],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const tableQuery = useTableQuery({
    useQuery: useGetDhcpStatsQuery,
    defaultPayload: getDhcpStatsPayload
  })
  const [deleteDhcp, { isLoading: isDeleteDhcpUpdating }] = useDeleteEdgeDhcpServicesMutation()

  const columns: TableProps<DhcpStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'serviceName',
      dataIndex: 'serviceName',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      align: 'center',
      key: 'dhcpPoolNum',
      dataIndex: 'dhcpPoolNum'
    },
    {
      title: $t({ defaultMessage: 'SmartEdges' }),
      align: 'center',
      key: 'edgeNum',
      dataIndex: 'edgeNum'
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      align: 'center',
      key: 'venueNum',
      dataIndex: 'venueNum'
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'health',
      dataIndex: 'health',
      render (data, row) {
        return <EdgeDhcpServiceStatusLight data={row.health} />
      }
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      align: 'center',
      key: 'updateAvailable',
      dataIndex: 'updateAvailable',
      render (data, row) {
        return row.updateAvailable ? $t({ defaultMessage: 'Yes' }) : $t({ defaultMessage: 'No' })
      }
    },
    {
      title: $t({ defaultMessage: 'Service Version' }),
      align: 'center',
      key: 'serviceVersion',
      dataIndex: 'serviceVersion'
    },
    {
      title: $t({ defaultMessage: 'Tags' }),
      key: 'tags',
      dataIndex: 'tags',
      render (data, row) {
        return row.tags?.join(',')
      }
    }
  ]

  const rowActions: TableProps<DhcpStats>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/${getServiceDetailsLink({
            type: ServiceType.EDGE_DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: selectedRows[0].id!
          })}`
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
            entityName: $t({ defaultMessage: 'DHCP' }),
            entityValue: rows.length === 1 ? rows[0].serviceName : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteDhcp({ params: { id: rows[0].id } })
                .then(clearSelection) :
              deleteDhcp({ payload: rows.map(item => item.id) })
                .then(clearSelection)
          }
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Service Update' }),
          content: rows.length === 1 ?
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Are you sure you want to update this service to the latest version immediately?' }) :
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Are you sure you want to update these services to the latest version immediately?' }),
          onOk: () => {
            // TODO API not ready
            clearSelection()
          }
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'DHCP for SmartEdge ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={[
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.CREATE })} key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add DHCP Service' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteDhcpUpdating }
      ]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'checkbox' }}
        />
      </Loader>
    </>
  )
}

export default EdgeDhcpTable