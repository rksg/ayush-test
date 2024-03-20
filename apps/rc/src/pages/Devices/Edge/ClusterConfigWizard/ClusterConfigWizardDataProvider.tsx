import { createContext } from 'react'

import { Loader }                                                     from '@acx-ui/components'
import { useGetEdgeSdLanByEdgeOrClusterId }                           from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery, useGetEdgesPortStatusQuery }     from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeNodesPortsInfo, EdgeSdLanViewDataP2 } from '@acx-ui/rc/utils'

export interface ClusterConfigWizardContextType {
  clusterInfo?: EdgeClusterStatus
  portsStatus?: EdgeNodesPortsInfo
  edgeSdLanData?: EdgeSdLanViewDataP2
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
  // const { edgeSdLanData, isEdgeSdLanLoading, isEdgeSdLanFetching }
  // = useGetEdgeSdLanP2ViewDataListQuery(
  //   { payload: {
  //     filters: { edgeClusterId: [clusterInfo?.clusterId] },
  //     fields: ['id', 'edgeClusterId']
  //   } },
  //   {
  //     selectFromResult: ({ data, isLoading, isFetching }) => ({
  //       edgeSdLanData: data?.data?.[0],
  //       isEdgeSdLanLoading: isLoading,
  //       isEdgeSdLanFetching: isFetching
  //     })
  //   }
  // )

  return <ClusterConfigWizardContext.Provider value={{
    clusterInfo,
    portsStatus,
    edgeSdLanData,
    isLoading: isClusterInfoLoading || isPortStatusLoading || isEdgeSdLanLoading,
    isFetching: isClusterInfoFetching || isPortStatusFetching || isEdgeSdLanFetching
  }}>
    <Loader states={[{
      isLoading: isClusterInfoLoading || isPortStatusLoading || isEdgeSdLanLoading,
      isFetching: isClusterInfoFetching
    }]}
    >
      {props.children}
    </Loader>
  </ClusterConfigWizardContext.Provider>
}