import { useIntl } from 'react-intl'
import styled      from 'styled-components'

import { Loader, Tooltip, SummaryCard } from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  PersonalIdentityNetworkApiVersion,
  useApListQuery,
  useGetDpskQuery,
  useGetEdgeDhcpServiceQuery,
  useGetEdgePinByIdQuery,
  useGetEdgePinViewDataListQuery,
  useGetPersonaGroupByIdQuery,
  useGetTunnelProfileByIdQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getPolicyDetailsLink,
  getServiceDetailsLink,
  edgePinDefaultPayloadFields,
  transformDisplayNumber,
  MAX_DEVICE_PER_SEGMENT,
  DpskDetailsTabKey
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { noDataDisplay }         from '@acx-ui/utils'

import { EdgeServiceStatusLight } from '../EdgeServiceStatusLight'
import { defaultApPayload }       from '../PersonalIdentityNetworkDetailTableGroup/ApsTable'
import { useIsEdgeFeatureReady }  from '../useEdgeActions'

import * as UI from './styledComponents'

interface PersonalIdentitNetworkServiceInfoProps {
  pinId: string
  className?: string
}

export const PersonalIdentityNetworkServiceInfo = styled((
  props: PersonalIdentitNetworkServiceInfoProps
) => {
  const isEdgePinEnhanceReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isL2GreEnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  const { pinId } = props
  const { $t } = useIntl()
  const params = useParams()
  const { tenantId } = params

  const {
    pinViewData,
    isPinViewDataLoading
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: edgePinDefaultPayloadFields,
      filters: { id: [pinId] }
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        pinViewData: data?.data[0],
        isPinViewDataLoading: isLoading
      }
    }
  })
  const {
    data: pinData,
    isLoading: isPinDataLoading
  } = useGetEdgePinByIdQuery({
    params: { serviceId: pinId },
    customHeaders: isL2GreEnabled ? PersonalIdentityNetworkApiVersion.v1001 : undefined
  })

  const apListQuery = useApListQuery({
    payload: {
      ...defaultApPayload,
      filters: { venueId: [pinData?.venueId] }
    },
    enableRbac: isWifiRbacEnabled
  }, { skip: !pinData?.venueId })

  const { dhcpName, dhcpId, dhcpPools, isLoading: isDhcpLoading } = useGetEdgeDhcpServiceQuery(
    { params: { id: pinData?.edgeClusterInfo?.dhcpInfoId } },{
      skip: !pinData?.edgeClusterInfo,
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
    { params: { id: pinData?.vxlanTunnelProfileId } }, {
      skip: !pinData?.vxlanTunnelProfileId
    })

  const {
    data: personaGroupData,
    isLoading: isPersonaGroupLoading
  } = useGetPersonaGroupByIdQuery(
    { params: { groupId: pinViewData?.personaGroupId } },
    { skip: !pinViewData?.personaGroupId })

  const tunnelTooltipMsg = $t(
    {
      defaultMessage: `{tunnelNumber} tunnels using {tunnelName} tunnel
    profile under this Personal Identity Network.`
    },
    {
      tunnelNumber: pinViewData?.tunnelNumber || 0,
      tunnelName: tunnelData?.id === tenantId ? $t({ defaultMessage: 'Default' }): tunnelData?.name
    }
  )

  const {
    data: dpskData,
    isLoading: isDpskLoading
  } = useGetDpskQuery(
    { params: { serviceId: personaGroupData?.dpskPoolId } },
    { skip: !isEdgePinEnhanceReady || !personaGroupData?.dpskPoolId })

  const pinInfo = [
    {
      title: $t({ defaultMessage: 'Service Status' }),
      content: pinViewData?.serviceStatus || $t({ defaultMessage: 'Down' }),
      colSpan: 4
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      colSpan: 4,
      content: () => ((pinViewData?.edgeClusterInfo)
        ? <EdgeServiceStatusLight data={pinViewData.edgeAlarmSummary} />
        : noDataDisplay
      )
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      colSpan: 4,
      content: () => {
        return (
          <TenantLink
            to={`/venues/${pinViewData?.venueId}/venue-details/overview`}
          >
            {pinViewData?.venueName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Identity Group' }),
      colSpan: 4,
      content: () => (
        <TenantLink to={`users/identity-management/identity-group/${personaGroupData?.id}`}>
          {personaGroupData?.name}
        </TenantLink>
      )
    },
    ...(isEdgePinEnhanceReady? [{
      title: $t({ defaultMessage: 'DPSK Service' }),
      colSpan: 4,
      content: () => {
        return <Loader states={[{ isLoading: isDpskLoading }]}>
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.DPSK,
            oper: ServiceOperation.DETAIL,
            serviceId: dpskData?.id || '',
            activeTab: DpskDetailsTabKey.OVERVIEW
          })}
          >
            {dpskData?.name}
          </TenantLink>
        </Loader>
      }
    }]: []),
    {
      title: $t({ defaultMessage: 'Cluster' }),
      colSpan: 4,
      content: () => {
        const clusterInfo = pinViewData?.edgeClusterInfo
        return (
          <TenantLink
            to={`/devices/edge/cluster/${clusterInfo?.edgeClusterId}/edit/cluster-details`}
          >
            {clusterInfo?.edgeClusterName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Number of Segments' }),
      colSpan: 4,
      content: pinData?.edgeClusterInfo?.segments
    },
    {
      title: $t({ defaultMessage: 'Number of devices per segment' }),
      colSpan: 4,
      content: MAX_DEVICE_PER_SEGMENT
    },
    {
      title: $t({ defaultMessage: 'DHCP Service (Pool)' }),
      colSpan: 4,
      content: () => {
        if(dhcpName) {
          const dhcpPoolId = pinData?.edgeClusterInfo?.dhcpPoolId
          const dhcpPool = dhcpPools?.find(item => item.id === dhcpPoolId)
          return (
            <TenantLink to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: dhcpId!
            })}>
              {`${dhcpName} (${dhcpPool?.poolName})`}
            </TenantLink>
          )
        }
        return null
      }
    },
    {
      title: () => (
        <>
          <span className='text-align'>{$t({ defaultMessage: 'Tunnel Profile' })}</span>
          <Tooltip
            title={tunnelTooltipMsg}
            placement='bottom'
          >
            <UI.StyledQuestionMark />
          </Tooltip>
        </>
      ),
      colSpan: 4,
      content: () => (
        tunnelData &&
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: tunnelData.id!
          })}>
            {
              `${tunnelData.id === tenantId ? $t({ defaultMessage: 'Default' }): tunnelData.name}
              (${pinViewData?.tunnelNumber || 0})`
            }
          </TenantLink>
      )
    },
    ...(isEdgePinEnhanceReady ? [] : [{
      title: $t({ defaultMessage: 'Networks' }),
      content: transformDisplayNumber(pinViewData?.tunneledWlans?.length)
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      content: apListQuery.data?.totalCount
    },
    {
      title: $t({ defaultMessage: 'Dist. Switches' }),
      content: pinData?.distributionSwitchInfos.length
    },
    {
      title: $t({ defaultMessage: 'Access Switches' }),
      content: pinData?.accessSwitchInfos.length
    }])
  ]

  return (
    <Loader states={[{
      isFetching: isPinViewDataLoading || isPinDataLoading ||
      isDhcpLoading || isTunnelLoading || isPersonaGroupLoading,
      isLoading: false
    }]}>
      <SummaryCard className={props.className} data={pinInfo} />
    </Loader>
  )
})`${UI.textAlign}`
