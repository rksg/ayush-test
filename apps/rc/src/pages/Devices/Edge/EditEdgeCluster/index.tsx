import { useEffect, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, Tabs }                                                                                                             from '@acx-ui/components'
import { Features }                                                                                                                             from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                                                                                from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery, useGetEdgeClusterNetworkSettingsQuery, useGetEdgeClusterQuery }                                            from '@acx-ui/rc/services'
import { ClusterHighAvailabilityModeEnum, CommonOperation, Device, EdgeLag, EdgePort, EdgeStatusEnum, getUrl, validateEdgeClusterLevelGateway } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                                                        from '@acx-ui/react-router-dom'

import { ClusterDetails }     from './ClusterDetails'
import { ClusterInterface }   from './ClusterInterface'
import { HaSettings }         from './HaSettings'
import { EdgeNetworkControl } from './NetworkControl'
import { VirtualIp }          from './VirtualIp'


const EditEdgeCluster = () => {
  const { $t } = useIntl()
  const { activeTab, clusterId } = useParams()
  const navigate = useNavigate()
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeHaAaReady = useIsEdgeFeatureReady(Features.EDGE_HA_AA_TOGGLE)
  const isEdgeQosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)
  const [hasGateway, setHasGateway] = useState(false)
  const basePath = useTenantLink(getUrl({
    feature: Device.EdgeCluster,
    oper: CommonOperation.Edit,
    params: { id: clusterId }
  }))
  const {
    currentClusterStatus,
    isClusterStatusLoading,
    isAllNodesNeverContactedCloud = true
  } = useGetEdgeClusterListQuery({ payload: {
    filters: { clusterId: [clusterId], isCluster: [true] }
  } },{
    selectFromResult: ({ data, isLoading }) => {
      const currentClusterStatus = data?.data[0]
      return {
        currentClusterStatus,
        isClusterStatusLoading: isLoading,
        isAllNodesNeverContactedCloud: currentClusterStatus?.edgeList?.length ===
        currentClusterStatus?.edgeList?.filter(item =>
          item.deviceStatus === EdgeStatusEnum.NEVER_CONTACTED_CLOUD).length
      }
    }
  })
  const { data: currentCluster, isLoading: isClusterLoading } = useGetEdgeClusterQuery({
    params: {
      venueId: currentClusterStatus?.venueId,
      clusterId: clusterId
    }
  }, {
    skip: !currentClusterStatus?.venueId
  })

  const {
    data: networkSettings,
    isLoading: isClusterNetworkSettingsLoading
  } = useGetEdgeClusterNetworkSettingsQuery({
    params: {
      venueId: currentClusterStatus?.venueId,
      clusterId: clusterId
    }
  }, {
    skip: !currentClusterStatus?.venueId
  })

  useEffect(() => {
    if(!networkSettings?.portSettings) return
    const validateGateway = async () => {

      // eslint-disable-next-line max-len
      const allPorts: EdgePort[] = networkSettings.portSettings?.flat().flatMap(setting => setting.ports) ?? []
      // eslint-disable-next-line max-len
      const allLags: EdgeLag[] = networkSettings.lagSettings?.flat().flatMap(setting => setting.lags) ?? []
      try {
        await validateEdgeClusterLevelGateway(
          allPorts,
          allLags,
          currentClusterStatus?.edgeList ?? [],
          isDualWanEnabled
        )
        setHasGateway(true)
      } catch (error) {
        setHasGateway(false)
      }
    }
    validateGateway()
  }, [networkSettings])

  const isAaCluster = isEdgeHaAaReady &&
    currentClusterStatus?.highAvailabilityMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE
  const basicTabs = {
    'cluster-details': {
      title: $t({ defaultMessage: 'Cluster Details' }),
      disabled: false,
      content: <ClusterDetails
        currentClusterStatus={currentClusterStatus}
      />
    },
    ...(isAaCluster? {
      'ha-settings': {
        title: $t({ defaultMessage: 'HA Settings' }),
        disabled: isAllNodesNeverContactedCloud,
        content: <HaSettings
          currentClusterStatus={currentClusterStatus}
        />
      }
    } : {
      'virtual-ip': {
        title: $t({ defaultMessage: 'Virtual IP' }),
        disabled: isAllNodesNeverContactedCloud,
        content: <VirtualIp
          currentClusterStatus={currentClusterStatus}
          currentVipConfig={currentCluster?.virtualIpSettings}
        />
      }
    }),
    'cluster-interface': {
      title: $t({ defaultMessage: 'Cluster Interface' }),
      disabled: isAllNodesNeverContactedCloud || !hasGateway,
      content: <ClusterInterface
        currentClusterStatus={currentClusterStatus}
        currentVipConfig={currentCluster?.virtualIpSettings}
      />
    }
  }

  const clusterTabs = !isEdgeDhcpHaReady && !isEdgeQosEnabled
    ? basicTabs
    : Object.assign(basicTabs, { networkControl: {
      title: $t({ defaultMessage: 'Network Control' }),
      disabled: isAllNodesNeverContactedCloud,
      content: <EdgeNetworkControl currentClusterStatus={currentClusterStatus} />
    } })

  const onTabChange = (finalTabs: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${finalTabs}`
    })
  }

  return (
    // eslint-disable-next-line max-len
    <Loader states={[{ isLoading: isClusterStatusLoading || isClusterLoading || isClusterNetworkSettingsLoading }]}>
      <PageHeader
        title={$t({ defaultMessage: 'Configure {name}' }, { name: currentClusterStatus?.name })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'RUCKUS Edges' }), link: '/devices/edge' }
        ]}
        footer={
          <Tabs onChange={onTabChange} activeKey={activeTab}>
            {
              Object.entries(clusterTabs).map(([k, v]) =>
                (
                  <Tabs.TabPane
                    tab={v.title}
                    key={k}
                    disabled={v.disabled}
                  />
                ))
            }
          </Tabs>
        }
      />
      {clusterTabs[activeTab as keyof typeof clusterTabs]?.content}
    </Loader>
  )
}

export default EditEdgeCluster