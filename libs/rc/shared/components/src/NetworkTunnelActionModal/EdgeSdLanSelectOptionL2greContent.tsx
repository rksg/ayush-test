import { useMemo } from 'react'

import { Form, Row, Select, Typography } from 'antd'
import { DefaultOptionType }             from 'antd/es/cascader'
import { useIntl }                       from 'react-intl'

import { transToOptions, useGetAvailableTunnelProfile }           from '@acx-ui/edge/components'
import { InformationSolid }                                       from '@acx-ui/icons'
import { useGetEdgeClusterListQuery, useGetEdgeFeatureSetsQuery } from '@acx-ui/rc/services'
import {
  EdgeMvSdLanViewData,
  IncompatibilityFeatures,
  NetworkTypeEnum,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  TunnelProfileViewData,
  TunnelTypeEnum,
  getPolicyDetailsLink,
  getServiceDetailsLink,
  getServiceRoutePath,
  useHelpPageLink
} from '@acx-ui/rc/utils'
import { TenantLink }      from '@acx-ui/react-router-dom'
import { compareVersions } from '@acx-ui/utils'

import { messageMappings } from './messageMappings'
import * as UI             from './styledComponents'

interface EdgeSdLanContentProps {
  venueSdLan: EdgeMvSdLanViewData | undefined
  networkType: NetworkTypeEnum
  hasVlanPool: boolean
}

export const EdgeSdLanSelectOptionL2greContent = (props: EdgeSdLanContentProps) => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const {
    venueSdLan,
    networkType,
    hasVlanPool
  } = props

  const addSdLanPageLink = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.CREATE
  })
  const helpUrl = useHelpPageLink(addSdLanPageLink)

  const isVenueSdLanExist = !!venueSdLan

  const linkToSdLanDetail = venueSdLan?.id ? getServiceDetailsLink({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.DETAIL,
    serviceId: venueSdLan?.id
  }) : undefined

  const linkToTunnelProfileDetail = venueSdLan?.tunnelProfileId ? getPolicyDetailsLink({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.DETAIL,
    policyId: venueSdLan?.tunnelProfileId!
  }) : undefined

  const sdlanName = (isVenueSdLanExist && linkToSdLanDetail)
    ? <TenantLink to={linkToSdLanDetail}>{venueSdLan?.name}</TenantLink>
    : ''

  const tunnelProfileName = (isVenueSdLanExist && linkToTunnelProfileDetail)
    ? <TenantLink to={linkToTunnelProfileDetail}>{venueSdLan?.tunnelProfileName}</TenantLink>
    : ''

  const { requiredFw, isFeatureSetsLoading } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [IncompatibilityFeatures.L2OGRE]
      }
    } }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === IncompatibilityFeatures.L2OGRE)?.requiredFw,
        isFeatureSetsLoading: isLoading
      }
    }
  })

  const activatedForwardingTunnelProfileIds = venueSdLan?.tunneledWlans
    ?.map(item => item.forwardingTunnelProfileId)
    ?.filter((id): id is string => typeof id === 'string') || []

  const { isDataLoading: isTunnelProfilesLoading,
    // eslint-disable-next-line max-len
    availableTunnelProfiles } = useGetAvailableTunnelProfile({ serviceIds: venueSdLan?.id ? [venueSdLan.id] : [undefined] })

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

  const isLowerSdlanEdgeFw = (): boolean => {
    const targetCluster = associatedEdgeClusters
      ?.find(item => item.clusterId === venueSdLan?.edgeClusterId)
    return targetCluster?.edgeList?.some(
      edge => compareVersions(edge?.firmwareVersion, requiredFw) < 0
    ) ?? false
  }

  const getFilteredTunnelProfileOptions = (
    tunnelProfileOptions: DefaultOptionType[],
    availableTunnelProfiles: TunnelProfileViewData[]
  ) => {
    const isCaptivePortal = networkType === NetworkTypeEnum.CAPTIVEPORTAL
    const isLower = isLowerSdlanEdgeFw()
    return tunnelProfileOptions
      .map(item => {
        const profile = availableTunnelProfiles.find(profile => profile.id === item.value)

        // Skip VXLAN-GPE options for non-CAPTIVEPORTAL networks
        if (!isCaptivePortal && profile?.tunnelType === TunnelTypeEnum.VXLAN_GPE) {
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

        return item
      })
      .filter((item): item is DefaultOptionType => item !== null)
  }

  const onChangeTunnel = (value:string) => {
    form.setFieldValue(['sdLan', 'forwardingTunnelType'],
      availableTunnelProfiles?.find(item => item.id === value)?.tunnelType ?? '')
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

  return <Row><Form.Item noStyle >
    <Typography.Text style={{ color: 'inherit' }}>
      {
        isVenueSdLanExist
        // eslint-disable-next-line max-len
          ? (<div className={'ant-form-item-label'}><label>{$t({ defaultMessage: 'Tunnel the traffic to a central location' })}</label><br /><br />
            <Row>
              <Form.Item
                label={$t({ defaultMessage: 'Service Name' })}>
                <div>
                  {sdlanName}
                </div>
              </Form.Item></Row>
            <Row>
              <Form.Item
                label={$t({ defaultMessage: 'Tunnel Profile' })}>
                <div >
                  {tunnelProfileName}
                </div>
              </Form.Item></Row>
            <Row>
              <Form.Item
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
                  disabled={isTunnelProfilesLoading && isEdgeClustersLoading
                    && isFeatureSetsLoading}
                />}
              />
            </Row>
          </div>)
        // eslint-disable-next-line max-len
          : (<div className={'ant-form-item-label'}><label>{$t({ defaultMessage: 'Tunnel the traffic to a central location. {infoLink}' }, {
            infoLink: <a href={helpUrl} target='_blank' rel='noreferrer'>
              {$t({ defaultMessage: 'See more information' })}
            </a>
          })}</label></div>)
      }
    </Typography.Text>
  </Form.Item></Row>
}