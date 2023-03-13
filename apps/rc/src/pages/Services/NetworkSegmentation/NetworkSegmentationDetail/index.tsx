import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, Tabs }                                                     from '@acx-ui/components'
import { useGetEdgeDhcpServiceQuery, useGetEdgeListQuery, useGetNetworkSegmentationStatsListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation, ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import * as UI                   from './styledComponents'
import { AccessSwitchesTable }   from './Table/AccessSwitchesTable'
import { ApsTable }              from './Table/ApsTable'
import { AssignedSegmentsTable } from './Table/AssignedSegmentsTable'
import { DistSwitchesTable }     from './Table/DistSwitchesTable'

const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}
const edgeOptionsDefaultPayload = {
  fields: ['name', 'serialNumber'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}


const NetworkSegmentationDetail = () => {

  const { $t } = useIntl()
  const params = useParams()

  const tabs = {
    aps: {
      title: $t({ defaultMessage: 'APs (0)' }),
      content: <ApsTable />
    },
    distSwitches: {
      title: $t({ defaultMessage: 'Dist. Switches (0)' }),
      content: <DistSwitchesTable />
    },
    accessSwitches: {
      title: $t({ defaultMessage: 'Access Switches (0)' }),
      content: <AccessSwitchesTable />
    },
    assignedSegments: {
      title: $t({ defaultMessage: 'Assigned Segments (0)' }),
      content: <AssignedSegmentsTable />
    }
  }

  const getNetworkSegmentationPayload = {
    fields: [
      'id',
      'name',
      'tags',
      'networkIds',
      'venueInfos',
      'edgeInfos'
    ],
    filters: { id: [params.serviceId] },
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const {
    networkSegmentationStats,
    isLoading
  } = useGetNetworkSegmentationStatsListQuery({
    payload: getNetworkSegmentationPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        networkSegmentationStats: data?.data[0],
        isLoading
      }
    }
  })

  // TODO if nsg es index is refactored, remove below scope
  /*Temp*/
  const { venueOptions, isLoading: isVenueOptionsLoading } = useVenuesListQuery(
    { params: params, payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
          isLoading
        }
      }
    })
  const { edgeOptions, isLoading: isEdgeOptionsLoading } = useGetEdgeListQuery(
    { params, payload: edgeOptionsDefaultPayload },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          edgeOptions: data?.data.map(item => ({ label: item.name, value: item.serialNumber })),
          isLoading
        }
      }
    })
  const { dhcpName, dhcpId, dhcpPools, isLoading: isDhcpLoading } = useGetEdgeDhcpServiceQuery(
    { params: { id: networkSegmentationStats?.edgeInfos[0].dhcpInfoId } },{
      skip: !!!networkSegmentationStats?.edgeInfos[0],
      selectFromResult: ({ data, isLoading }) => {
        return {
          dhcpName: data?.serviceName,
          dhcpId: data?.id,
          dhcpPools: data?.dhcpPools,
          isLoading
        }
      }
    })
  /*Temp*/

  const infoFields = [
    {
      title: $t({ defaultMessage: 'Service Status' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      content: () => {
        const venue = venueOptions?.find(item =>
          item.value === networkSegmentationStats?.venueInfos[0]?.venueId)
        if(venue) {
          return (
            <TenantLink to={`/venues/${venue.value}/venue-details/overview`}>
              {venue.label}
            </TenantLink>
          )
        }
        return null
      }
    },
    {
      title: $t({ defaultMessage: 'Persona Group' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: () => {
        const edge = edgeOptions?.find(item =>
          item.value === networkSegmentationStats?.edgeInfos[0]?.edgeId)
        if(edge) {
          return (
            <TenantLink to={`/devices/edge/${edge.value}/edge-details/overview`}>
              {edge.label}
            </TenantLink>
          )
        }
        return null
      }
    },
    {
      title: $t({ defaultMessage: 'Number of Segments' }),
      content: () => (networkSegmentationStats?.edgeInfos[0]?.segments)
    },
    {
      title: $t({ defaultMessage: 'Number of devices per segment' }),
      content: () => (networkSegmentationStats?.edgeInfos[0]?.devices)
    },
    {
      title: $t({ defaultMessage: 'DHCP Service (Pool)' }),
      content: () => {
        if(dhcpName) {
          const dhcpPoolId = networkSegmentationStats?.edgeInfos[0]?.dhcpPoolId
          const dhcpPool = dhcpPools?.find(item => item.id === dhcpPoolId)
          return (
            <TenantLink to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: dhcpId!
            })}>
              {`${dhcpName}(${dhcpPool?.poolName})`}
            </TenantLink>
          )
        }
        return null
      }
    },
    {
      title: $t({ defaultMessage: 'Tunnel' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      content: () => (networkSegmentationStats?.networkIds?.length)
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'Dist. Switches' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'Access Switches' }),
      content: () => (<></>)
    }
  ]

  return (
    <>
      <PageHeader
        title={networkSegmentationStats && networkSegmentationStats.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Network Segmentation' }),
            link: getServiceRoutePath({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={[
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId! })}
            key='edit'>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Loader states={[
        {
          isFetching: isLoading || isVenueOptionsLoading || isEdgeOptionsLoading || isDhcpLoading,
          isLoading: false
        }
      ]}>
        <Space direction='vertical' size={30}>
          <Card type='solid-bg'>
            <UI.InfoMargin>
              <GridRow>
                {infoFields.map(item =>
                  (<GridCol col={{ span: 3 }} key={item.title}>
                    <Space direction='vertical' size={10}>
                      <Typography.Text>
                        {item.title}
                      </Typography.Text>
                      <Typography.Text>
                        {item.content()}
                      </Typography.Text>
                    </Space>
                  </GridCol>)
                )}
              </GridRow>
            </UI.InfoMargin>
          </Card>
          <Card>
            <UI.InstancesMargin>
              <Typography.Title level={2}>
                {$t({ defaultMessage: 'Instances' })}
              </Typography.Title>
              <Tabs
                type='third'
              >
                {Object.keys(tabs)
                  .map((key) =>
                    <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
                      {tabs[key as keyof typeof tabs].content}
                    </Tabs.TabPane>)}
              </Tabs>
            </UI.InstancesMargin>
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default NetworkSegmentationDetail