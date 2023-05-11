import React, { useEffect, useState } from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'
import styled                from 'styled-components'

import { Button, Card, GridCol, GridRow, Loader, PageHeader, Tabs, Tooltip } from '@acx-ui/components'
import {
  useApListQuery,
  useGetEdgeDhcpServiceQuery,
  useGetEdgeListQuery,
  useGetNetworkSegmentationGroupByIdQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useGetPersonaGroupByIdQuery,
  useGetTunnelProfileByIdQuery,
  useSearchPersonaListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  Persona,
  PolicyOperation,
  PolicyType,
  RequestPayload,
  ServiceOperation, ServiceType, useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useParams } from '@acx-ui/react-router-dom'

import { PersonaGroupLink }  from '../../../Users/Persona/LinkHelper'
import { AccessSwitchTable } from '../NetworkSegmentationForm/AccessSwitchForm/AccessSwitchTable'

import * as UI                        from './styledComponents'
import { ApsTable, defaultApPayload } from './Table/ApsTable'
import { AssignedSegmentsTable }      from './Table/AssignedSegmentsTable'
import { DistSwitchesTable }          from './Table/DistSwitchesTable'

const venueOptionsDefaultPayload = {
  fields: ['name', 'id']
}
const edgeOptionsDefaultPayload = {
  fields: ['name', 'serialNumber']
}

const NetworkSegmentationDetail = styled(({ className }) => {

  const { $t } = useIntl()
  const params = useParams()
  const { tenantId } = params
  const location = useLocation()
  const [isApPayloadReady,setIsApPayloadReady] = useState(false)
  const [isPersonaPayloadReady,setIsPersonaPayloadReady] = useState(false)

  const {
    data: nsgData,
    isLoading: isNsgDataLoading
  } = useGetNetworkSegmentationGroupByIdQuery({ params })
  const {
    nsgViewData,
    isNsgViewDataLoading
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { id: [params.serviceId] }
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        nsgViewData: data?.data[0],
        isNsgViewDataLoading: isLoading
      }
    }
  })

  const apListTableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultApPayload,
      filters: { venueId: [''] }
    },option: { skip: !isApPayloadReady }
  })

  const personaListQuery = useTableQuery<Persona, RequestPayload<unknown>, unknown>({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: ''
    },option: { skip: !isPersonaPayloadReady }
  })

  useEffect(() => {
    apListTableQuery.setPayload({
      ...defaultApPayload,
      filters: { venueId: [nsgViewData?.venueInfos[0]?.venueId??''] }
    })
    personaListQuery.setPayload({
      keyword: '',
      groupId: nsgViewData?.venueInfos[0]?.personaGroupId??''
    })
  }, [nsgViewData])

  useEffect(() => {
    if(apListTableQuery?.payload?.filters?.venueId?.length > 0) {
      setIsApPayloadReady(true)
    }
  }, [apListTableQuery.payload.filters])

  useEffect(() => {
    if(personaListQuery?.payload?.groupId) {
      setIsPersonaPayloadReady(true)
    }
  }, [personaListQuery.payload.groupId])

  const tabs = {
    aps: {
      title: $t({ defaultMessage: 'APs ({num})' },
        { num: apListTableQuery?.data?.data?.length??0 }),
      content: <ApsTable tableQuery={apListTableQuery}/>
    },
    distSwitches: {
      title: $t({ defaultMessage: 'Dist. Switches ({num})' },
        { num: nsgData?.distributionSwitchInfos.length }),
      content: <DistSwitchesTable dataSource={nsgData?.distributionSwitchInfos} />
    },
    accessSwitches: {
      title: $t({ defaultMessage: 'Access Switches ({num})' },
        { num: nsgData?.accessSwitchInfos.length }),
      content: <AccessSwitchTable
        dataSource={nsgData?.accessSwitchInfos}
        distributionSwitchInfos={nsgData?.distributionSwitchInfos} />
    },
    assignedSegments: {
      title: $t({ defaultMessage: 'Assigned Segments ({num})' },
        { num: personaListQuery?.data?.data?.length??0 }),
      content: <AssignedSegmentsTable tableQuery={personaListQuery}/>
    }
  }

  // TODO if nsg es index is refactored, remove below scope
  /*Temp*/
  const { venueData, isLoading: isVenueOptionsLoading } = useVenuesListQuery(
    {
      params,
      payload: {
        ...venueOptionsDefaultPayload,
        filters: { id: [nsgViewData?.venueInfos[0].venueId] }
      }
    }, {
      skip: !!!nsgViewData?.venueInfos[0],
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueData: data?.data[0],
          isLoading
        }
      }
    })
  const { edgeData, isLoading: isEdgeOptionsLoading } = useGetEdgeListQuery(
    {
      params,
      payload: {
        ...edgeOptionsDefaultPayload,
        filters: { serialNumber: [nsgViewData?.edgeInfos[0].edgeId] }
      }
    },
    {
      skip: !!!nsgViewData?.edgeInfos[0],
      selectFromResult: ({ data, isLoading }) => {
        return {
          edgeData: data?.data[0],
          isLoading
        }
      }
    })
  const { dhcpName, dhcpId, dhcpPools, isLoading: isDhcpLoading } = useGetEdgeDhcpServiceQuery(
    { params: { id: nsgViewData?.edgeInfos[0].dhcpInfoId } },{
      skip: !!!nsgViewData?.edgeInfos[0],
      selectFromResult: ({ data, isLoading }) => {
        return {
          dhcpName: data?.serviceName,
          dhcpId: data?.id,
          dhcpPools: data?.dhcpPools,
          isLoading
        }
      }
    })
  const{ data: tunnelData, isLoading: isTunnelLoading } = useGetTunnelProfileByIdQuery(
    { params: { id: nsgViewData?.vxlanTunnelProfileId } }, {
      skip: !!!nsgViewData?.vxlanTunnelProfileId
    }
  )
  const {
    data: personaGroupData,
    isLoading: isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: nsgViewData?.venueInfos[0].personaGroupId } },
    { skip: !!!nsgViewData?.venueInfos[0] }
  )
  /*Temp*/

  const tunnelTooltipMsg = $t(
    {
      defaultMessage: `{tunnelNumber} tunnels using {tunnelName} tunnel
    profile under this Network Segmentation.`
    },
    {
      tunnelNumber: nsgViewData?.tunnelNumber,
      tunnelName: tunnelData?.id === tenantId ? $t({ defaultMessage: 'Default' }): tunnelData?.name
    }
  )

  const infoFields = [
    {
      title: $t({ defaultMessage: 'Service Status' }),
      content: () => (nsgViewData?.serviceStatus)
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: () => (<></>)
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      content: () => {
        if(venueData) {
          return (
            <TenantLink to={`/venues/${venueData.id}/venue-details/overview`}>
              {venueData.name}
            </TenantLink>
          )
        }
        return null
      }
    },
    {
      title: $t({ defaultMessage: 'Persona Group' }),
      content: () => (<PersonaGroupLink
        name={personaGroupData?.name}
        personaGroupId={personaGroupData?.id}
      />)
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: () => {
        if(edgeData) {
          return (
            <TenantLink to={`/devices/edge/${edgeData.serialNumber}/edge-details/overview`}>
              {edgeData.name}
            </TenantLink>
          )
        }
        return null
      }
    },
    {
      title: $t({ defaultMessage: 'Number of Segments' }),
      content: () => (nsgViewData?.edgeInfos[0]?.segments)
    },
    {
      title: $t({ defaultMessage: 'Number of devices per segment' }),
      content: () => (nsgViewData?.edgeInfos[0]?.devices)
    },
    {
      title: $t({ defaultMessage: 'DHCP Service (Pool)' }),
      content: () => {
        if(dhcpName) {
          const dhcpPoolId = nsgViewData?.edgeInfos[0]?.dhcpPoolId
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
      title: () => (
        <>
          <span className='text-align-1'>{$t({ defaultMessage: 'Tunnel' })}</span>
          <Tooltip
            title={tunnelTooltipMsg}
            placement='bottom'
          >
            <UI.StyledQuestionMark />
          </Tooltip>
        </>
      ),
      content: () => (
        tunnelData &&
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: tunnelData.id!
          })}>
            {
              `${tunnelData.id === tenantId ? $t({ defaultMessage: 'Default' }): tunnelData.name}
              (${nsgViewData?.tunnelNumber})`
            }
          </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      content: () => (nsgViewData?.networkIds?.length)
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      content: () => (apListTableQuery?.data?.totalCount)
    },
    {
      title: $t({ defaultMessage: 'Dist. Switches' }),
      content: () => (nsgData?.distributionSwitchInfos.length)
    },
    {
      title: $t({ defaultMessage: 'Access Switches' }),
      content: () => (nsgData?.accessSwitchInfos.length)
    }
  ]

  return (
    <>
      <PageHeader
        title={nsgViewData && nsgViewData.name}
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
          <TenantLink state={{ from: location }}
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
          isFetching: (isNsgDataLoading || isNsgViewDataLoading || isVenueOptionsLoading
            || isEdgeOptionsLoading || isDhcpLoading || isTunnelLoading || isPersonaGroupLoading),
          isLoading: false
        }
      ]}>
        <Space direction='vertical' size={30}>
          <Card type='solid-bg'>
            <UI.InfoMargin>
              <GridRow className={className}>
                {infoFields.map((item, index) =>
                  (<GridCol col={{ span: 3 }} key={index}>
                    <Space direction='vertical' size={10}>
                      <Typography.Text>
                        {typeof item.title === 'string' ? item.title : item.title()}
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
})`${UI.textAlign}`

export default NetworkSegmentationDetail
