import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Button, Card, Loader, PageHeader, SpaceWrapper, SummaryCard, Tabs } from '@acx-ui/components'
import { EdgeServiceStatusLight }                                            from '@acx-ui/rc/components'
import { useGetEdgeMvSdLanViewDataListQuery }                                from '@acx-ui/rc/services'
import {
  EdgeMvSdLanViewData,
  filterByAccessForServicePolicyMutation,
  getPolicyDetailsLink,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  isEdgeWlanTemplate,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  useServiceListBreadcrumb
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { VenueTable, VenueTableDataType } from '../../EdgeSdLanDetail/VenueTable'
import { CompatibilityCheck }             from '../../shared/CompatibilityCheck'
import * as UI                            from '../../styledComponents'

import { VenueTemplateTable, VenueTemplateTableDataType } from './VenueTemplateTable'

const defaultSdLanPayload = {
  fields: [
    'id', 'name',
    'edgeClusterId', 'edgeClusterName',
    'tunnelProfileId', 'tunnelProfileName',
    'isGuestTunnelEnabled',
    'guestEdgeClusterId', 'guestEdgeClusterName',
    'guestTunnelProfileId', 'guestTunnelProfileName',
    'edgeAlarmSummary',
    'vlans', 'vlanNum', 'vxlanTunnelNum',
    'guestVlanNum', 'guestVxlanTunnelNum', 'guestVlans',
    'tunneledWlans',
    'tunneledGuestWlans',
    'edgeClusterTunnelInfo',
    'guestEdgeClusterTunnelInfo'
  ]
}

export const EdgeSdLanDetail = () => {
  const { $t } = useIntl()
  const params = useParams()

  const { edgeSdLanData, isLoading, isFetching } = useGetEdgeMvSdLanViewDataListQuery(
    { payload: {
      ...defaultSdLanPayload,
      filters: { id: [params.serviceId] }
    } },
    {
      pollingInterval: 5 * 60 * 1000,
      selectFromResult: ({ data, isLoading, isFetching, isUninitialized }) => ({
        edgeSdLanData: data?.data?.[0],
        isLoading: isUninitialized || isLoading,
        isFetching
      })
    }
  )

  const isDMZEnabled = edgeSdLanData?.isGuestTunnelEnabled
  const venueTableData = getVenueTableData(edgeSdLanData)
  const venueTemplateTableData = getVenueTemplateTableData(edgeSdLanData)

  const sdLanInfo = [
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: () => (
        <EdgeServiceStatusLight
          data={edgeSdLanData?.edgeAlarmSummary ? [edgeSdLanData.edgeAlarmSummary] : []}
        />
      )
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' }),
      colSpan: 4,
      content: () => (
        <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.TUNNEL_PROFILE,
          oper: PolicyOperation.DETAIL,
          policyId: edgeSdLanData?.tunnelProfileId!
        })}>
          {edgeSdLanData?.tunnelProfileName}
        </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Destination RUCKUS Edge cluster' }),
      colSpan: 4,
      content: () => (
        // eslint-disable-next-line max-len
        <TenantLink to={`devices/edge/cluster/${edgeSdLanData?.edgeClusterId}/edit/cluster-details`}>
          {edgeSdLanData?.edgeClusterName}
        </TenantLink>
      )
    },
    ...(isDMZEnabled ? [
      {
        title: $t({ defaultMessage: 'Tunnel Profile (Cluster to DMZ)' }),
        colSpan: 4,
        content: () => (
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: edgeSdLanData?.guestTunnelProfileId!
          })}>
            {edgeSdLanData?.guestTunnelProfileName}
          </TenantLink>
        )
      },
      {
        title: $t({ defaultMessage: 'DMZ Cluster' }),
        colSpan: 4,
        content: () => (
          // eslint-disable-next-line max-len
          <TenantLink to={`devices/edge/cluster/${edgeSdLanData?.guestEdgeClusterId}/edit/cluster-details`}>
            {edgeSdLanData?.guestEdgeClusterName}
          </TenantLink>
        )
      }
    ] : []),
    {
      title: $t({ defaultMessage: 'Apply Service To…' }),
      colSpan: 4,
      content: () => {
        const result = []
        if(edgeSdLanData?.tunnelProfileId) {
          result.push($t({ defaultMessage: 'My account' }))
        }
        if(edgeSdLanData?.tunnelTemplateId) {
          result.push($t({ defaultMessage: 'My customers' }))
        }
        return result.join(', ')
      }
    }
  ]

  return <>
    <PageHeader
      title={edgeSdLanData?.name}
      breadcrumb={useServiceListBreadcrumb(ServiceType.EDGE_SD_LAN)}
      extra={filterByAccessForServicePolicyMutation([
        <TenantLink
          scopeKey={getScopeKeyByService(ServiceType.EDGE_SD_LAN, ServiceOperation.EDIT)}
          rbacOpsIds={getServiceAllowedOperation(ServiceType.EDGE_SD_LAN, ServiceOperation.EDIT)}
          to={getServiceDetailsLink({
            type: ServiceType.EDGE_SD_LAN,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
          <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
        </TenantLink>
      ])}
    />
    <Loader states={[{
      isLoading: isLoading,
      isFetching: isFetching
    }]}>
      {
        !!params.serviceId && <Row>
          <Col span={24}>
            <CompatibilityCheck
              serviceId={params.serviceId}
            />
          </Col>
        </Row>
      }
      <SpaceWrapper fullWidth direction='vertical' size={30}>
        <SummaryCard data={sdLanInfo} />
        <Card>
          <UI.InstancesContainer>
            <UI.InstancesTitle level={2}>
              {$t({ defaultMessage: 'Instances' })}
            </UI.InstancesTitle>
          </UI.InstancesContainer>
          <Tabs type='third'>
            <Tabs.TabPane
              tab={$t(
                { defaultMessage: '<VenuePlural></VenuePlural> ({count})' },
                { count: venueTableData?.length ?? 0 }
              )}
              key='venues'
            >
              <VenueTable sdLanVenueData={venueTableData} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={$t(
                { defaultMessage: '<VenueSingular></VenueSingular> Templates ({count})' },
                { count: venueTemplateTableData?.length ?? 0 }
              )}
              key='venueTemplates'
            >
              <VenueTemplateTable data={venueTemplateTableData} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </SpaceWrapper>
    </Loader>
  </>
}

const getVenueTableData = (sdLanData?: EdgeMvSdLanViewData): VenueTableDataType[] => {
  let wlans =sdLanData?.tunneledWlans ?? []
  const result = [] as VenueTableDataType[]
  wlans.forEach(wlan => {
    if(isEdgeWlanTemplate(wlan.wlanId)) return
    const target = result.find(item => item.venueId === wlan.venueId)
    if(target) {
      target.selectedNetworks.push({
        networkId: wlan.networkId,
        networkName: wlan.networkName
      })
    } else {
      result.push({
        venueId: wlan.venueId,
        venueName: wlan.venueName,
        selectedNetworks: [{
          networkId: wlan.networkId,
          networkName: wlan.networkName
        }]
      } as VenueTableDataType)
    }
  })
  return result
}

const getVenueTemplateTableData = (sdLanData?: EdgeMvSdLanViewData) => {
  let wlans =sdLanData?.tunneledWlans ?? []
  const result = [] as VenueTemplateTableDataType[]
  wlans.forEach(wlan => {
    if(!isEdgeWlanTemplate(wlan.wlanId)) return
    const target = result.find(item => item.venueId === wlan.venueId)
    if(target) {
      target.selectedNetworks.push({
        networkId: wlan.networkId,
        networkName: wlan.networkName
      })
    } else {
      result.push({
        venueId: wlan.venueId,
        venueName: wlan.venueName,
        customerCount: sdLanData?.ecTenantIds?.length ?? 0,
        selectedNetworks: [{
          networkId: wlan.networkId,
          networkName: wlan.networkName
        }]
      } as VenueTemplateTableDataType)
    }
  })
  return result
}