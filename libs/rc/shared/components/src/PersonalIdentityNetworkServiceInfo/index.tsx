import { useIntl } from 'react-intl'
import styled      from 'styled-components'

import { Loader, Tooltip, SummaryCard } from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  useApListQuery,
  useGetEdgeClusterListQuery,
  useGetEdgeDhcpServiceQuery,
  useGetNetworkSegmentationGroupByIdQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useGetPersonaGroupByIdQuery,
  useGetTunnelProfileByIdQuery
} from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, ServiceOperation, ServiceType, getPolicyDetailsLink, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                   from '@acx-ui/react-router-dom'
import { noDataDisplay }                                                                                           from '@acx-ui/utils'

import { EdgeServiceStatusLight } from '../EdgeServiceStatusLight'
import { defaultApPayload }       from '../PersonalIdentityNetworkDetailTableGroup/ApsTable'

import * as UI from './styledComponents'

interface PersonalIdentitNetworkServiceInfoProps {
  nsgId: string
  className?: string
}

export const PersonalIdentityNetworkServiceInfo = styled((
  props: PersonalIdentitNetworkServiceInfoProps
) => {

  const { nsgId } = props
  const { $t } = useIntl()
  const params = useParams()
  const { tenantId } = params
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const {
    nsgViewData,
    isNsgViewDataLoading
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { id: [nsgId] }
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        nsgViewData: data?.data[0],
        isNsgViewDataLoading: isLoading
      }
    }
  })
  const {
    data: nsgData,
    isLoading: isNsgDataLoading
  } = useGetNetworkSegmentationGroupByIdQuery({
    params: { serviceId: nsgId }
  })
  const apListQuery = useApListQuery({
    payload: {
      ...defaultApPayload,
      filters: { venueId: [nsgViewData?.venueInfos[0]?.venueId] }
    },
    enableRbac: isWifiRbacEnabled
  }, { skip: !!!nsgViewData?.venueInfos[0]?.venueId })

  // TODO if nsg es index is refactored, remove below scope
  /*Temp*/
  const { clusterName } = useGetEdgeClusterListQuery(
    { params, payload: {
      fields: ['name', 'clusterId'],
      pageSize: 1,
      filters: { clusterId: [nsgViewData?.edgeClusterInfos[0].edgeClusterId] }
    } },
    {
      skip: !Boolean(nsgViewData?.edgeClusterInfos[0].edgeClusterId),
      selectFromResult: ({ data }) => {
        return {
          clusterName: data?.data[0]?.name
        }
      }
    })
  const { dhcpName, dhcpId, dhcpPools, isLoading: isDhcpLoading } = useGetEdgeDhcpServiceQuery(
    { params: { id: nsgViewData?.edgeClusterInfos[0].dhcpInfoId } },{
      skip: !!!nsgViewData?.edgeClusterInfos[0],
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
    profile under this Personal Identity Network.`
    },
    {
      tunnelNumber: nsgViewData?.tunnelNumber || 0,
      tunnelName: tunnelData?.id === tenantId ? $t({ defaultMessage: 'Default' }): tunnelData?.name
    }
  )

  const nsgInfo = [
    {
      title: $t({ defaultMessage: 'Service Status' }),
      content: nsgViewData?.serviceStatus || $t({ defaultMessage: 'Down' })
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: () => ((nsgViewData?.edgeClusterInfos?.length)
        ? <EdgeServiceStatusLight data={nsgViewData.edgeAlarmSummary} />
        : noDataDisplay
      )
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      content: () => {
        const venueInfo = nsgViewData?.venueInfos?.[0]
        return (
          <TenantLink
            to={`/venues/${venueInfo?.venueId}/venue-details/overview`}
          >
            {venueInfo?.venueName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Identity Group' }),
      content: () => (
        <TenantLink to={`users/identity-management/identity-group/${personaGroupData?.id}`}>
          {personaGroupData?.name}
        </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: () => {
        const edgeInfo = nsgViewData?.edgeClusterInfos?.[0]
        return (
          <TenantLink
            to={`/devices/edge/${edgeInfo?.edgeClusterId}/details/overview`}
          >
            {clusterName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Number of Segments' }),
      content: nsgViewData?.edgeClusterInfos[0]?.segments
    },
    {
      title: $t({ defaultMessage: 'Number of devices per segment' }),
      content: nsgViewData?.edgeClusterInfos[0]?.devices
    },
    {
      title: $t({ defaultMessage: 'DHCP Service (Pool)' }),
      content: () => {
        if(dhcpName) {
          const dhcpPoolId = nsgViewData?.edgeClusterInfos[0]?.dhcpPoolId
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
          <span className='text-align'>{$t({ defaultMessage: 'Tunnel' })}</span>
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
              (${nsgViewData?.tunnelNumber || 0})`
            }
          </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      content: nsgViewData?.networkIds?.length
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      content: apListQuery.data?.totalCount
    },
    {
      title: $t({ defaultMessage: 'Dist. Switches' }),
      content: nsgData?.distributionSwitchInfos.length
    },
    {
      title: $t({ defaultMessage: 'Access Switches' }),
      content: nsgData?.accessSwitchInfos.length
    }
  ]

  return (
    <Loader states={[{
      isFetching: isNsgViewDataLoading || isNsgDataLoading ||
      isDhcpLoading || isTunnelLoading || isPersonaGroupLoading,
      isLoading: false
    }]}>
      <SummaryCard className={props.className} data={nsgInfo} />
    </Loader>
  )
})`${UI.textAlign}`
