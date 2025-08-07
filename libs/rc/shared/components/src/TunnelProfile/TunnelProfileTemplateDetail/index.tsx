import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'
import { useParams }         from 'react-router-dom'

import { Button, Card, Loader, PageHeader, SummaryCard } from '@acx-ui/components'
import { Features }                                      from '@acx-ui/feature-toggle'
import { useGetTunnelProfileTemplateViewDataListQuery }  from '@acx-ui/rc/services'
import {
  ageTimeUnitConversion,
  filterByAccessForServicePolicyMutation,
  generateConfigTemplateBreadcrumb,
  getNetworkSegmentTypeString,
  getTunnelTypeString,
  mtuRequestTimeoutUnitConversion,
  MtuTypeEnum,
  NetworkSegmentTypeEnum,
  PolicyOperation,
  PolicyType,
  transformDisplayOnOff,
  TunnelProfileViewData,
  TunnelTypeEnum,
  useIsEdgeFeatureReady,
  useTemplateAwarePolicyAllowedOperation
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import { PolicyConfigTemplateLinkSwitcher } from '../../configTemplates/ConfigTemplateLink'

import { NetworkTable }    from './NetworkTable'
import { InstancesMargin } from './styledComponents'

export const TunnelProfileTemplateDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeNatTraversalP1Ready = useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE)
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)
  const allowedOperationForEdit = useTemplateAwarePolicyAllowedOperation(
    PolicyType.TUNNEL_PROFILE, PolicyOperation.EDIT
  )

  const { tunnelProfileData, isLoading } = useGetTunnelProfileTemplateViewDataListQuery(
    {
      payload: {
        filters: { id: [params.policyId] }
      }
    },
    {
      selectFromResult: ({ data, isLoading }) => ({
        tunnelProfileData: data?.data?.[0] || {} as TunnelProfileViewData,
        isLoading
      })
    }
  )

  const tunnelInfo = [
    ...(isEdgeL2greReady ? [
      {
        title: $t({ defaultMessage: 'Tunnel Type' }),
        content: () => {
          return getTunnelTypeString($t, tunnelProfileData.tunnelType || TunnelTypeEnum.VXLAN_GPE)
        }
      },
      {
        title: $t({ defaultMessage: 'Destination' }),
        content: () => {
          return TunnelTypeEnum.VXLAN_GPE === tunnelProfileData.tunnelType ?
            `${tunnelProfileData.destinationEdgeClusterName || noDataDisplay}` :
            `${tunnelProfileData.destinationIpAddress || noDataDisplay}`
        }
      }
    ] : []),
    {
      title: $t({ defaultMessage: 'Network Segment Type' }),
      content: () => {
        // eslint-disable-next-line max-len
        return getNetworkSegmentTypeString($t, tunnelProfileData.type || NetworkSegmentTypeEnum.VXLAN)
      }
    },
    ...(isEdgeNatTraversalP1Ready ? [
      {
        title: $t({ defaultMessage: 'NAT-T Support' }),
        content: transformDisplayOnOff(!!tunnelProfileData.natTraversalEnabled)
      }
    ] : []),
    {
      title: $t({ defaultMessage: 'Gateway Path MTU Mode' }),
      content: MtuTypeEnum.AUTO === tunnelProfileData.mtuType ?
        $t({ defaultMessage: 'Auto' }) :
        `${$t({ defaultMessage: 'Manual' })} (${tunnelProfileData.mtuSize})`
    },
    {
      title: $t({ defaultMessage: 'PMTU Timeout' }),
      content: () => {
        if(!tunnelProfileData.mtuRequestTimeout) return noDataDisplay
        const result = mtuRequestTimeoutUnitConversion(tunnelProfileData.mtuRequestTimeout)
        return $t({ defaultMessage: '{value} {unit}' }, {
          value: result?.value,
          unit: result?.unit
        })
      }
    }, {
      title: $t({ defaultMessage: 'PMTU Retries' }),
      content: tunnelProfileData.mtuRequestRetry ?
        `${tunnelProfileData.mtuRequestRetry} ${$t({ defaultMessage: 'retries' })}` :
        noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Force Fragmentation' }),
      content: transformDisplayOnOff(tunnelProfileData.forceFragmentation)
    },
    {
      title: $t({ defaultMessage: 'Tunnel Idle Timeout' }),
      content: () => {
        if(!tunnelProfileData.ageTimeMinutes) return noDataDisplay
        const result = ageTimeUnitConversion(tunnelProfileData.ageTimeMinutes)
        return $t({ defaultMessage: '{value} {unit}' }, {
          value: result?.value,
          unit: result?.unit
        })
      }
    },
    {
      title: $t({ defaultMessage: 'Keep Alive Interval' }),
      content: tunnelProfileData.keepAliveInterval ?
        `${tunnelProfileData.keepAliveInterval} ${$t({ defaultMessage: 'seconds' })}` :
        noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Keep Alive Retries' }),
      content: tunnelProfileData.keepAliveRetry ?
        `${tunnelProfileData.keepAliveRetry} ${$t({ defaultMessage: 'retries' })}` :
        noDataDisplay
    }
  ]

  return <>
    <PageHeader
      title={tunnelProfileData.name}
      breadcrumb={generateConfigTemplateBreadcrumb()}
      extra={
        filterByAccessForServicePolicyMutation([
          <PolicyConfigTemplateLinkSwitcher
            rbacOpsIds={allowedOperationForEdit}
            type={PolicyType.TUNNEL_PROFILE}
            oper={PolicyOperation.EDIT}
            policyId={params.policyId!}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </PolicyConfigTemplateLinkSwitcher>
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
          <InstancesMargin>
            <Typography.Title level={2}>
              {$t(
                { defaultMessage: 'Instances ({count})' },
                { count: tunnelProfileData.networkIds?.length || 0 }
              )}
            </Typography.Title>
          </InstancesMargin>
          <NetworkTable networkIds={tunnelProfileData.networkIds || []} />
        </Card>
      </Space>
    </Loader>
  </>
}