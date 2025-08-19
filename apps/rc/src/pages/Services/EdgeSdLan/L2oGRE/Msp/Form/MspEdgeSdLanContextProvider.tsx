import { createContext, ReactNode, useContext } from 'react'

import { Loader }                               from '@acx-ui/components'
import { useGetAvailableTunnelTemplate }        from '@acx-ui/edge/components'
import {
  useGetEdgeClusterListQuery,
  useGetVenuesTemplateListSkipRecRewriteQuery
} from '@acx-ui/rc/services'
import { EdgeClusterStatus, TunnelProfileViewData, Venue } from '@acx-ui/rc/utils'

export interface MspEdgeSdLanContextType {
  availableTunnelTemplates: TunnelProfileViewData[]
  associatedEdgeClusters?: EdgeClusterStatus[]
  allVenueTemplates?: Venue[]
}

export const MspEdgeSdLanContext = createContext({} as MspEdgeSdLanContextType)

export const useMspEdgeSdLanContext = () => {
  return useContext(MspEdgeSdLanContext)
}

export const MspEdgeSdLanContextProvider = (props: { children: ReactNode, serviceId?: string }) => {
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

  const {
    allVenueTemplates,
    isVenueTemplatesLoading
  } = useGetVenuesTemplateListSkipRecRewriteQuery({
    payload: {
      fields: ['name', 'country', 'city', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data, isLoading }) => ({
      isVenueTemplatesLoading: isLoading,
      allVenueTemplates: data?.data
    })
  })

  const loadingStates = [{
    isLoading: isDataLoading || isAssociatedEdgeClustersLoading || isVenueTemplatesLoading
  }]

  return <MspEdgeSdLanContext.Provider value={{
    availableTunnelTemplates,
    associatedEdgeClusters,
    allVenueTemplates
  }}>
    <Loader states={loadingStates}>
      {props.children}
    </Loader>
  </MspEdgeSdLanContext.Provider>
}