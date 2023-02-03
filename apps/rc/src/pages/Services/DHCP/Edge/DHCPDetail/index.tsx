import { useEffect, useState } from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, Table, TableProps }                                         from '@acx-ui/components'
import { DhcpStats, getServiceDetailsLink, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                         from '@acx-ui/react-router-dom'

import { useMockData as useDHCPMoclData } from '../DHCPTable'
import { EdgeDhcpServiceStatusLight }     from '../EdgeDhcpStatusLight'

import * as UI from './styledComponents'

export const useMockData = () => {
  const [data, setData] = useState<DhcpStats[]>()
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    setData([
      {
        id: '1',
        edgeId: '1',
        edgeName: 'Edge-1',
        venueId: '1',
        venueName: 'Venue A',
        health: 'Good',
        successfulAllocations: 90,
        remainingIps: 23,
        droppedPackets: 93,
        pools: 3,
        relay: false,
        leaseTime: 24
      },
      {
        id: '2',
        edgeId: '2',
        edgeName: 'Edge-2',
        venueId: '1',
        venueName: 'Venue A',
        health: 'Good',
        successfulAllocations: 90,
        remainingIps: 23,
        droppedPackets: 93,
        pools: 3,
        relay: false,
        leaseTime: 24
      }
    ])
    setIsloading(false)
  }, [])

  return { isLoading, data, total: data?.length }
}

const EdgeDHCPDetail = () => {

  const { $t } = useIntl()
  const params = useParams()
  const { data, total, isLoading } = useMockData()
  const { data: dhcpData } = useDHCPMoclData()

  const columns: TableProps<DhcpStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edgeId',
      dataIndex: 'edgeId',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/devices/edge/${row.edgeId}/edge-details/overview`}>
            {row.edgeName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueId',
      dataIndex: 'venueId',
      render: function (data, row) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      key: 'health',
      dataIndex: 'health',
      render (data, row) {
        return <EdgeDhcpServiceStatusLight data={row.health} />
      }
    },
    {
      title: $t({ defaultMessage: '# of successful allocations' }),
      align: 'center',
      key: 'successfulAllocations',
      dataIndex: 'successfulAllocations'
    },
    {
      title: $t({ defaultMessage: '# of remaining IPs' }),
      align: 'center',
      key: 'remainingIps',
      dataIndex: 'remainingIps'
    },
    {
      title: $t({ defaultMessage: 'Dropped packets' }),
      align: 'center',
      key: 'droppedPackets',
      dataIndex: 'droppedPackets',
      render (data) {
        return `${data}%`
      }
    }
  ]

  const rowActions: TableProps<DhcpStats>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Restart' }),
      onClick: (selectedRows, clearSelection) => {
        // TODO API not ready
        clearSelection()
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={dhcpData?.find(item => item.id === params.serviceId)?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'DHCP for SmartEdge' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={[
          // eslint-disable-next-line max-len
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId! })}
            key='edit'>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[
        { isFetching: isLoading, isLoading: false }
      ]}>
        <Space direction='vertical' size={30}>
          <Card type='solid-bg'>
            <UI.InfoMargin>
              <GridRow>
                <GridCol col={{ span: 3 }}>
                  <Space direction='vertical' size={10}>
                    <Typography.Text>
                      {$t({ defaultMessage: 'Service Health' })}
                    </Typography.Text>
                    <Typography.Text>
                      <EdgeDhcpServiceStatusLight data={data && data[0]?.health} />
                    </Typography.Text>
                  </Space>
                </GridCol>
                <GridCol col={{ span: 3 }}>
                  <Space direction='vertical' size={10}>
                    <Typography.Text>
                      {$t({ defaultMessage: 'DHCP Relay' })}
                    </Typography.Text>
                    <Typography.Text>
                      {
                        data && data[0]?.relay ?
                          $t({ defaultMessage: 'ON' }) :
                          $t({ defaultMessage: 'OFF' })
                      }
                    </Typography.Text>
                  </Space>
                </GridCol>
                <GridCol col={{ span: 3 }}>
                  <Space direction='vertical' size={10}>
                    <Typography.Text>
                      {$t({ defaultMessage: 'DHCP Pools' })}
                    </Typography.Text>
                    <Typography.Text>
                      {data && data[0]?.pools}
                    </Typography.Text>
                  </Space>
                </GridCol>
                <GridCol col={{ span: 3 }}>
                  <Space direction='vertical' size={10}>
                    <Typography.Text>
                      {$t({ defaultMessage: 'Lease Time' })}
                    </Typography.Text>
                    <Typography.Text>
                      {`${data && data[0]?.leaseTime} hrs`}
                    </Typography.Text>
                  </Space>
                </GridCol>
              </GridRow>
            </UI.InfoMargin>
          </Card>
          <Card>
            <UI.InstancesMargin>
              <Typography.Title level={2}>
                {$t({ defaultMessage: 'Instances ({count})' },
                  { count: total })}
              </Typography.Title>
              <Table
                columns={columns}
                dataSource={data}
                rowKey='id'
                rowActions={rowActions}
                rowSelection={{ type: 'checkbox' }}
              />
            </UI.InstancesMargin>
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default EdgeDHCPDetail