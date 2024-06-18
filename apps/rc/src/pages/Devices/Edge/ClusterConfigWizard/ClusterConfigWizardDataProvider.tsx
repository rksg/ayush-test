import { createContext } from 'react'

import { Loader }                                                                                        from '@acx-ui/components'
import { useGetEdgeSdLanByEdgeOrClusterId }                                                              from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery, useGetEdgeClusterNetworkSettingsQuery, useGetEdgesPortStatusQuery } from '@acx-ui/rc/services'
import { ClusterNetworkSettings, EdgeClusterStatus, EdgeNodesPortsInfo, EdgeSdLanViewDataP2 }            from '@acx-ui/rc/utils'


export interface ClusterConfigWizardContextType {
  clusterInfo?: EdgeClusterStatus
  portsStatus?: EdgeNodesPortsInfo
  edgeSdLanData?: EdgeSdLanViewDataP2
  clusterNetworkSettings?: ClusterNetworkSettings
  isLoading: boolean
  isFetching: boolean
}

export const ClusterConfigWizardContext = createContext({
} as ClusterConfigWizardContextType)

type ClusterConfigWizardDataProviderProps = React.PropsWithChildren<{
  clusterId?:string
}>

export const ClusterConfigWizardDataProvider = (props: ClusterConfigWizardDataProviderProps) => {
  const { clusterId } = props
  const { clusterInfo, isClusterInfoLoading, isClusterInfoFetching } = useGetEdgeClusterListQuery({
    payload: {
      fields: [
        'name',
        'clusterId',
        'haStatus',
        'edgeList',
        'venueId',
        'venueName'
      ],
      filters: { clusterId: [clusterId] },
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 1
    }
  }, {
    skip: !Boolean(clusterId),
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      clusterInfo: data?.data[0],
      isClusterInfoLoading: isLoading,
      isClusterInfoFetching: isFetching
    })
  })

  const {
    data: portsStatus,
    isLoading: isPortStatusLoading,
    isFetching: isPortStatusFetching } = useGetEdgesPortStatusQuery({
    payload: {
      edgeIds: clusterInfo?.edgeList?.map(node => node.serialNumber)
    }
  }, {
    skip: !Boolean(clusterInfo?.edgeList?.length)
  })

  const {
    edgeSdLanData,
    isLoading: isEdgeSdLanLoading,
    isFetching: isEdgeSdLanFetching
  } = useGetEdgeSdLanByEdgeOrClusterId(clusterInfo?.clusterId)

  const {
    data: clusterNetworkSettings,
    isLoading: isClusterNetworkSettingsLoading,
    isFetching: isClusterNetworkSettingsFetching
  } = useGetEdgeClusterNetworkSettingsQuery({
    params: {
      venueId: clusterInfo?.venueId,
      clusterId: clusterInfo?.clusterId
    }
  },{
    skip: !Boolean(clusterInfo)
  })

  const isLoading = isClusterInfoLoading || isPortStatusLoading || isEdgeSdLanLoading ||
    isClusterNetworkSettingsLoading
  const isFetching = isClusterInfoFetching || isPortStatusFetching || isEdgeSdLanFetching ||
    isClusterNetworkSettingsFetching

  return <ClusterConfigWizardContext.Provider value={{
    clusterInfo,
    portsStatus,
    edgeSdLanData,
    clusterNetworkSettings,
    isLoading,
    isFetching
  }}>
    <Loader states={[{
      isLoading,
      isFetching
    }]}
    >
      {props.children}
    </Loader>
  </ClusterConfigWizardContext.Provider>
}