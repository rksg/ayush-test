import { createContext } from 'react'

import { Loader }                     from '@acx-ui/components'
import { useGetEdgeClusterListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus }          from '@acx-ui/rc/utils'

export interface ClusterConfigWizardContextType {
  clusterInfo?: EdgeClusterStatus
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
        'edgeList'
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

  return <ClusterConfigWizardContext.Provider value={{
    clusterInfo
  }}>
    <Loader states={[{
      isLoading: isClusterInfoLoading,
      isFetching: isClusterInfoFetching
    }]}
    >
      {props.children}
    </Loader>
  </ClusterConfigWizardContext.Provider>
}