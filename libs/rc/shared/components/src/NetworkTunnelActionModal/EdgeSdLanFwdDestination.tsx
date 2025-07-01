import { useMemo } from 'react'

import { Form, Select }      from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { transToOptions, useGetAvailableTunnelProfile } from '@acx-ui/edge/components'
import { InformationSolid }                             from '@acx-ui/icons'
import { useGetEdgeClusterListQuery }                   from '@acx-ui/rc/services'
import {
  isEdgeMatchedRequiredFirmware, TunnelProfileViewData,
  NetworkTypeEnum, TunnelTypeEnum, getServiceRoutePath, ServiceOperation,
  ServiceType, useHelpPageLink, EdgeMvSdLanViewData,
  NetworkSegmentTypeEnum,
  MtuTypeEnum
} from '@acx-ui/rc/utils'

import { messageMappings } from './messageMappings'
import * as UI             from './styledComponents'

interface EdgeSdLanFwdDestinationProps {
  venueSdLan?: EdgeMvSdLanViewData
  networkType: NetworkTypeEnum
  hasVlanPool: boolean
  requiredFw?: string
  disabled?: boolean
}
export const EdgeSdLanFwdDestination = (props: EdgeSdLanFwdDestinationProps) => {
  const { $t } = useIntl()
  const { venueSdLan, networkType, hasVlanPool, requiredFw, disabled = false } = props
  const form = Form.useFormInstance()

  const activatedForwardingTunnelProfileIds = venueSdLan?.tunneledWlans
    ?.map(item => item.forwardingTunnelProfileId)
    ?.filter((id): id is string => typeof id === 'string') || []

  const {
    isDataLoading: isTunnelProfilesLoading,
    // eslint-disable-next-line max-len
    availableTunnelProfiles
  } = useGetAvailableTunnelProfile({ serviceIds: venueSdLan?.id ? [venueSdLan.id] : [undefined] })

  const { associatedEdgeClusters, isEdgeClustersLoading } = useGetEdgeClusterListQuery({
    payload: {
      fields: ['clusterId', 'hasCorePort', 'edgeList'],
      filters: {
        clusterId: availableTunnelProfiles?.map(profile =>
          profile.destinationEdgeClusterId).filter(Boolean)
      },
      pageSize: 10000
    }
  }, {
    skip: !availableTunnelProfiles?.length,
    selectFromResult: ({ data, isLoading }) => ({
      associatedEdgeClusters: data?.data,
      isEdgeClustersLoading: isLoading
    })
  })

  const addSdLanPageLink = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.CREATE
  })
  const helpUrl = useHelpPageLink(addSdLanPageLink)

  const tunnelProfileOptions = useMemo(() => [
    {
      label: $t({ defaultMessage: 'Core Port' }),
      value: ''
    },
    ...transToOptions(
      (availableTunnelProfiles || []).filter(item => item.id !== venueSdLan?.tunnelProfileId),
      activatedForwardingTunnelProfileIds
    )
  ], [availableTunnelProfiles, isTunnelProfilesLoading])

  const isLowerSdLanEdgeFw = (): boolean => {
    const targetCluster = associatedEdgeClusters
      ?.find(item => item.clusterId === venueSdLan?.edgeClusterId)
    return !isEdgeMatchedRequiredFirmware(requiredFw, targetCluster?.edgeList)
  }

  const getFilteredTunnelProfileOptions = (
    tunnelProfileOptions: DefaultOptionType[],
    availableTunnelProfiles: TunnelProfileViewData[]
  ) => {
    const isCaptivePortal = networkType === NetworkTypeEnum.CAPTIVEPORTAL
    const isLower = isLowerSdLanEdgeFw()
    return tunnelProfileOptions
      .map(item => {
        if(item.value) {
          const profile = availableTunnelProfiles.find(profile => profile.id === item.value)

          // Skip none VLAN_VXLAN tunnel profile options
          if(profile?.type !== NetworkSegmentTypeEnum.VLAN_VXLAN) {
            return null
          }

          // Skip VXLAN-GPE options for non-CAPTIVEPORTAL networks
          if (!isCaptivePortal && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
            return null
          }

          // Skip VXLAN-GPE options for captive portal networks with non-manual MTU or NAT traversal enabled
          // eslint-disable-next-line max-len
          if(isCaptivePortal && (profile?.mtuType !== MtuTypeEnum.MANUAL || profile.natTraversalEnabled)) {
            return null
          }

          if(isLower && profile?.tunnelType === TunnelTypeEnum.L2GRE) {
            return null
          }

          // Disable VXLAN-GPE options for vlan pooling networks
          if (hasVlanPool && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
            return {
              ...item,
              disabled: true,
              title: $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
            }
          }
        }

        return item
      })
      .filter((item): item is DefaultOptionType => item !== null)
  }

  const checkCorePortConfigured = (tunnelProfileId: string) => {
    const targetTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
      tunnelProfile.id === tunnelProfileId)
    // eslint-disable-next-line max-len
    if(TunnelTypeEnum.VXLAN_GPE !== targetTunnelProfile?.tunnelType) {
      return Promise.resolve()
    }
    const associatedEdgeCluster = associatedEdgeClusters?.find((cluster) =>
      cluster.clusterId === targetTunnelProfile?.destinationEdgeClusterId)

    if (associatedEdgeCluster?.hasCorePort) {
      return Promise.resolve()
    } else {
      return Promise.reject(<UI.ClusterSelectorHelper>
        <InformationSolid />
        {$t(messageMappings.setting_cluster_helper, {
          infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
            {$t({ defaultMessage: 'See more information' })}
          </a>
        })}
      </UI.ClusterSelectorHelper>)
    }
  }

  const onChangeTunnel = (value:string) => {
    form.setFieldValue(['sdLan', 'forwardingTunnelType'],
      availableTunnelProfiles?.find(item => item.id === value)?.tunnelType ?? '')
  }

  return <Form.Item
    name={['sdLan', 'forwardingTunnelProfileId']}
    label={$t({ defaultMessage: 'Forwarding Destination' })}
    initialValue={''}
    rules={[
      { validator: (_, value) => checkCorePortConfigured(value) }
    ]}
    children={<Select
      style={{ width: '220px' }}
      // eslint-disable-next-line max-len
      options={getFilteredTunnelProfileOptions(tunnelProfileOptions, availableTunnelProfiles)}
      onChange={onChangeTunnel}
      disabled={disabled || (isTunnelProfilesLoading && isEdgeClustersLoading)}
    />}
  />
}