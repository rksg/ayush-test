import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps }                                                from '@acx-ui/components'
import { DhcpStats, getServiceDetailsLink, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink }                                                                        from '@acx-ui/react-router-dom'

import { EdgeDHCPServiceStatusLight } from '../EdgeDHCPStatusLight'

export const useMockData = () => {
  const [data, setData] = useState<DhcpStats[]>()
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    setData([
      {
        id: '1',
        name: 'DHCP-1',
        pools: 3,
        edges: 3,
        venues: 3,
        health: 'Good',
        updateAvailable: false,
        serviceVersion: 'v100.10.10',
        tags: ['Tag1', 'Tag2']
      },
      {
        id: '2',
        name: 'DHCP-2',
        pools: 4,
        edges: 3,
        venues: 3,
        health: 'Unknown',
        updateAvailable: true,
        serviceVersion: 'v200.10.10',
        tags: []
      }
    ])
    setIsloading(false)
  }, [])

  return { isLoading, data, total: data?.length }
}

const EdgeDHCPTable = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const { data, total, isLoading } = useMockData()

  const columns: TableProps<DhcpStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
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
      key: 'pools',
      dataIndex: 'pools'
    },
    {
      title: $t({ defaultMessage: 'SmartEdges' }),
      align: 'center',
      key: 'edges',
      dataIndex: 'edges'
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      align: 'center',
      key: 'venues',
      dataIndex: 'venues'
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'health',
      dataIndex: 'health',
      render (data, row) {
        return <EdgeDHCPServiceStatusLight data={row.health} />
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
        return row.tags.join(',')
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
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            // TODO API not ready
            clearSelection()
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
            { count: total })
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
        { isFetching: isLoading, isLoading: false }
      ]}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey='id'
          rowActions={rowActions}
          rowSelection={{ type: 'checkbox' }}
        />
      </Loader>
    </>
  )
}

export default EdgeDHCPTable