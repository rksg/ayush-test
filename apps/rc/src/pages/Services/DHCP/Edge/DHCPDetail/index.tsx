
import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, Table, TableProps }                                         from '@acx-ui/components'
import { useGetDhcpStatsQuery }                                                                                          from '@acx-ui/rc/services'
import { DhcpStats, getServiceDetailsLink, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                         from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                                                from '@acx-ui/user'

import { EdgeDhcpServiceStatusLight } from '../EdgeDhcpStatusLight'

import * as UI from './styledComponents'

const EdgeDHCPDetail = () => {

  const { $t } = useIntl()
  const params = useParams()
  const getDhcpStatsPayload = {
    fields: [
      'serviceName',
      'dhcpRelay',
      'dhcpPoolNum',
      'dhcpPoolNum',
      'leaseTime'
    ],
    filters: { id: [params.serviceId] }
  }
  const { data: dhcpStats, isLoading } = useGetDhcpStatsQuery({
    params,
    payload: getDhcpStatsPayload
  })

  const columns: TableProps<DhcpStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edgeId',
      dataIndex: 'edgeId',
      sorter: true,
      defaultSortOrder: 'ascend'
      // render: function (data, row) {
      //   return (
      //     <TenantLink to={`/devices/edge/${row.edgeId}/edge-details/overview`}>
      //       {row.edgeName}
      //     </TenantLink>
      //   )
      // }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueId',
      dataIndex: 'venueId'
      // render: function (data, row) {
      //   return (
      //     <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
      //       {row.venueName}
      //     </TenantLink>
      //   )
      // }
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      key: 'health',
      dataIndex: 'health'
      // render (data, row) {
      //   return <EdgeDhcpServiceStatusLight data={row.health} />
      // }
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
      dataIndex: 'droppedPackets'
      // render (data) {
      //   return `${data}%`
      // }
    }
  ]

  // const rowActions: TableProps<DhcpStats>['rowActions'] = [
  //   {
  //     label: $t({ defaultMessage: 'Restart' }),
  //     onClick: (selectedRows, clearSelection) => {
  //       // TODO API not ready
  //       clearSelection()
  //     }
  //   }
  // ]

  return (
    <>
      <PageHeader
        title={dhcpStats && dhcpStats.data[0]?.serviceName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'DHCP for SmartEdge' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.EDGE_DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
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
                      <EdgeDhcpServiceStatusLight
                        data={dhcpStats?.data && dhcpStats?.data[0]?.health}
                      />
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
                        dhcpStats?.data &&
                        (dhcpStats?.data[0]?.dhcpRelay === 'true' ?
                          $t({ defaultMessage: 'ON' }) :
                          $t({ defaultMessage: 'OFF' }))}
                    </Typography.Text>
                  </Space>
                </GridCol>
                <GridCol col={{ span: 3 }}>
                  <Space direction='vertical' size={10}>
                    <Typography.Text>
                      {$t({ defaultMessage: 'DHCP Pools' })}
                    </Typography.Text>
                    <Typography.Text>
                      {dhcpStats?.data && dhcpStats?.data[0]?.dhcpPoolNum}
                    </Typography.Text>
                  </Space>
                </GridCol>
                <GridCol col={{ span: 3 }}>
                  <Space direction='vertical' size={10}>
                    <Typography.Text>
                      {$t({ defaultMessage: 'Lease Time' })}
                    </Typography.Text>
                    <Typography.Text>
                      {dhcpStats?.data && (dhcpStats?.data[0]?.leaseTime)}
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
                  { count: 0 })}
              </Typography.Title>
              <Table
                columns={columns}
                rowKey='id'
                // rowActions={filterByAccess(rowActions)}
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
