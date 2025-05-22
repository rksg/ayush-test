import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, Loader, PageHeader, SummaryCard } from '@acx-ui/components'
import { Features }                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                         from '@acx-ui/rc/components'
import { useGetTunnelProfileViewDataListQuery }          from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  isDefaultTunnelProfile as getIsDefaultTunnelProfile,
  getNetworkSegmentTypeString,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  usePolicyListBreadcrumb,
  getScopeKeyByPolicy,
  getTunnelTypeString,
  mtuRequestTimeoutUnitConversion,
  MtuTypeEnum,
  NetworkSegmentTypeEnum,
  PolicyOperation,
  PolicyType,
  transformDisplayOnOff,
  TunnelProfileViewData,
  TunnelTypeEnum
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { noDataDisplay }         from '@acx-ui/utils'

import { ageTimeUnitConversion } from '../util'

import { NetworkTable } from './Networktable'
import * as UI          from './styledComponents'

const TunnelProfileDetail = () => {
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeVxLanKaReady = useIsEdgeFeatureReady(Features.EDGE_VXLAN_TUNNEL_KA_TOGGLE)
  const isEdgeNatTraversalP1Ready = useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE)
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const { $t } = useIntl()
  const params = useParams()

  const getTunnelProfilePayload = {
    filters: { id: [params.policyId] }
  }
  const { tunnelProfileData, isLoading } = useGetTunnelProfileViewDataListQuery(
    { payload: getTunnelProfilePayload },
    {
      selectFromResult: ({ data, isLoading }) => ({
        tunnelProfileData: data?.data?.[0] || {} as TunnelProfileViewData,
        isLoading
      })
    }
  )

  const isDefaultTunnelProfile = getIsDefaultTunnelProfile(tunnelProfileData)

  const tunnelInfo = [
    ...(isEdgeL2greReady ? [{
      title: $t({ defaultMessage: 'Tunnel Type' }),
      content: () => {
        return getTunnelTypeString($t, tunnelProfileData.tunnelType || TunnelTypeEnum.VXLAN_GPE)
      }
    }] : []),
    ...(isEdgeL2greReady ? [{
      title: $t({ defaultMessage: 'Destination' }),
      content: () => {
        return TunnelTypeEnum.VXLAN_GPE === tunnelProfileData.tunnelType ?
          `${tunnelProfileData.destinationEdgeClusterName || noDataDisplay}` :
          `${tunnelProfileData.destinationIpAddress || noDataDisplay}`
      }
    }] : []),
    ...(isEdgeVxLanKaReady && (isEdgeSdLanReady || isEdgeSdLanHaReady) ? [{
      title: $t({ defaultMessage: 'Network Segment Type' }),
      content: () => {
        // eslint-disable-next-line max-len
        return getNetworkSegmentTypeString($t, tunnelProfileData.type || NetworkSegmentTypeEnum.VXLAN,
          isEdgeVxLanKaReady)
      }
    }] : []),
    ...(isEdgeNatTraversalP1Ready ? [
      {
        title: $t({ defaultMessage: 'NAT-T Support' }),
        content: transformDisplayOnOff(!!tunnelProfileData.natTraversalEnabled)
      }] : []),
    {
      title: $t({ defaultMessage: 'Gateway Path MTU Mode' }),
      content: MtuTypeEnum.AUTO === tunnelProfileData.mtuType ?
        $t({ defaultMessage: 'Auto' }) :
        `${$t({ defaultMessage: 'Manual' })} (${tunnelProfileData.mtuSize})`
    },
    ...(isEdgeVxLanKaReady ? [
      {
        title: $t({ defaultMessage: 'PMTU Timeout' }),
        content: () => {
          if(!tunnelProfileData.mtuRequestTimeout) return
          const result = mtuRequestTimeoutUnitConversion(tunnelProfileData.mtuRequestTimeout)
          return $t({ defaultMessage: '{value} {unit}' }, {
            value: result?.value,
            unit: result?.unit
          })
        }
      }, {
        title: $t({ defaultMessage: 'PMTU Retries' }),
        content: `${tunnelProfileData.mtuRequestRetry ?? ''} ${$t({ defaultMessage: 'retries' })}`
      }] : []),
    {
      title: $t({ defaultMessage: 'Force Fragmentation' }),
      content: tunnelProfileData.forceFragmentation ?
        $t({ defaultMessage: 'ON' }) :
        $t({ defaultMessage: 'OFF' })
    },
    {
      title: $t({ defaultMessage: 'Tunnel Idle Timeout' }),
      content: () => {
        if(!tunnelProfileData.ageTimeMinutes) return
        const result = ageTimeUnitConversion(tunnelProfileData.ageTimeMinutes)
        return $t({ defaultMessage: '{value} {unit}' }, {
          value: result?.value,
          unit: result?.unit
        })
      }
    },
    ...(!isEdgeVxLanKaReady && (isEdgeSdLanReady || isEdgeSdLanHaReady) ? [{
      title: $t({ defaultMessage: 'Tunnel Type' }),
      content: () => {
        // eslint-disable-next-line max-len
        return getNetworkSegmentTypeString($t, tunnelProfileData.type || NetworkSegmentTypeEnum.VXLAN)
      }
    }] : []),
    ...(isEdgeVxLanKaReady ? [
      {
        title: $t({ defaultMessage: 'Keep Alive Interval' }),
        content: `${tunnelProfileData.keepAliveInterval ?? ''}
        ${$t({ defaultMessage: 'seconds' })}`
      },
      {
        title: $t({ defaultMessage: 'Keep Alive Reties' }),
        content: `${tunnelProfileData.keepAliveRetry ?? ''} ${$t({ defaultMessage: 'retries' })}`
      }] : [])
  ]

  return (
    <>
      <PageHeader
        title={tunnelProfileData.name}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.TUNNEL_PROFILE)}
        extra={
          filterByAccessForServicePolicyMutation([
            <TenantLink
              scopeKey={getScopeKeyByPolicy(PolicyType.TUNNEL_PROFILE, PolicyOperation.EDIT)}
              // eslint-disable-next-line max-len
              rbacOpsIds={getPolicyAllowedOperation(PolicyType.TUNNEL_PROFILE, PolicyOperation.EDIT)}
              to={getPolicyDetailsLink({
                type: PolicyType.TUNNEL_PROFILE,
                oper: PolicyOperation.EDIT,
                policyId: params.policyId as string
              })}>
              <Button key={'configure'} type={'primary'} disabled={isDefaultTunnelProfile}>
                {$t({ defaultMessage: 'Configure' })}
              </Button></TenantLink>
          ])
        }
      />
      <Loader states={[
        {
          isFetching: isLoading,
          isLoading: false
        }
      ]}>
        <Space direction='vertical' size={30}>
          <SummaryCard data={tunnelInfo} colPerRow={6} />
          <Card>
            <UI.InstancesMargin>
              <Typography.Title level={2}>
                {$t(
                  { defaultMessage: 'Instances ({count})' },
                  { count: tunnelProfileData.networkIds?.length || 0 }
                )}
              </Typography.Title>
            </UI.InstancesMargin>
            <NetworkTable networkIds={tunnelProfileData.networkIds || []} />
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default TunnelProfileDetail
