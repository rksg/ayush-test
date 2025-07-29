import { createContext, ReactNode, useContext } from 'react'

import { Loader }                                   from '@acx-ui/components'
import { useGetAvailableTunnelTemplate }            from '@acx-ui/edge/components'
import { useGetEdgeClusterListQuery }               from '@acx-ui/rc/services'
import { EdgeClusterStatus, TunnelProfileViewData } from '@acx-ui/rc/utils'

export interface EdgeMspSdLanContextType {
  availableTunnelTemplates: TunnelProfileViewData[]
  associatedEdgeClusters?: EdgeClusterStatus[]
}

export const EdgeMspSdLanContext = createContext({} as EdgeMspSdLanContextType)

export const useEdgeMspSdLanContext = () => {
  return useContext(EdgeMspSdLanContext)
}

export const EdgeMspSdLanContextProvider = (props: { children: ReactNode, serviceId?: string }) => {
  const {
    availableTunnelTemplates,
    isDataLoading
  } = useGetAvailableTunnelTemplate({ serviceIds: [props.serviceId] })

  const { associatedEdgeClusters, isAssociatedEdgeClustersLoading } = useGetEdgeClusterListQuery({
    payload: {
      fields: ['clusterId', 'hasCorePort', 'highAvailabilityMode', 'edgeList'],
      filters: {
        clusterId: availableTunnelTemplates?.map(profile =>
          profile.destinationEdgeClusterId).filter(Boolean)
      },
      pageSize: 10000
    }
  }, {
    skip: !availableTunnelTemplates?.length,
    selectFromResult: ({ data, isLoading }) => ({
      associatedEdgeClusters: data?.data,
      isAssociatedEdgeClustersLoading: isLoading
    })
  })

  const loadingStates = [{
    isLoading: isDataLoading || isAssociatedEdgeClustersLoading
  }]

  return <EdgeMspSdLanContext.Provider value={{
    availableTunnelTemplates,
    associatedEdgeClusters
  }}>
    <Loader states={loadingStates}>
      {props.children}
    </Loader>
  </EdgeMspSdLanContext.Provider>
}