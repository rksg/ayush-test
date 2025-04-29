import { createContext, ReactNode, useContext } from 'react'

import { Loader }                                                                                                                     from '@acx-ui/components'
import { useGetAvailableTunnelProfile }                                                                                               from '@acx-ui/edge/components'
import { Features }                                                                                                                   from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                                                                      from '@acx-ui/rc/components'
import { useGetEdgePinViewDataListQuery, useGetEdgeMvSdLanViewDataListQuery, useGetEdgeClusterListQuery, useGetEdgeFeatureSetsQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeMvSdLanViewData, IncompatibilityFeatures, PersonalIdentityNetworksViewData, TunnelProfileViewData }   from '@acx-ui/rc/utils'

export interface EdgeSdLanContextType {
  allSdLans: Pick<EdgeMvSdLanViewData, 'id' | 'venueId' | 'edgeClusterId' | 'guestEdgeClusterId'
   | 'tunneledWlans' | 'tunneledGuestWlans'>[]
  allPins: Pick<PersonalIdentityNetworksViewData, 'id' | 'venueId' | 'edgeClusterInfo'
   | 'tunneledWlans'>[]
  availableTunnelProfiles: TunnelProfileViewData[]
  associatedEdgeClusters?: EdgeClusterStatus[]
  requiredFwMap?: { [key: string]: string|undefined }
}

export const EdgeSdLanContext = createContext({} as EdgeSdLanContextType)

export function useEdgeSdLanContext () {
  return useContext(EdgeSdLanContext)
}

export function EdgeSdLanContextProvider (props: { children: ReactNode, serviceId?: string }) {
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

  const {
    isDataLoading,
    availableTunnelProfiles
  } = useGetAvailableTunnelProfile({ serviceIds: [props.serviceId] })

  const { allSdLans = [], isSdLansLoading } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } }, {
    selectFromResult: ({ data, isLoading }) => ({
      allSdLans: data?.data,
      isSdLansLoading: isLoading
    })
  })

  const { allPins = [], isPinsLoading } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id', 'tunnelProfileId', 'tunneledWlans'],
      pageSize: 10000
    } },{
    skip: !isEdgePinReady,
    selectFromResult: ({ data, isLoading }) => ({
      allPins: data?.data,
      isPinsLoading: isLoading
    })
  })

  const { associatedEdgeClusters, isAssociatedEdgeClustersLoading } = useGetEdgeClusterListQuery({
    payload: {
      fields: ['clusterId', 'hasCorePort', 'highAvailabilityMode'],
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
      isAssociatedEdgeClustersLoading: isLoading
    })
  })

  const { requiredFwMap } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [IncompatibilityFeatures.L2OGRE]
      } }
  }, {
    selectFromResult: ({ data }) => {
      return {
        requiredFwMap: {
          [IncompatibilityFeatures.L2OGRE]: data?.featureSets
            ?.find(item => item.featureName === IncompatibilityFeatures.L2OGRE)?.requiredFw
        }
      }
    }
  })

  const loadingStates = [{
    isLoading: isDataLoading || isSdLansLoading || isPinsLoading || isAssociatedEdgeClustersLoading
  }]

  return <EdgeSdLanContext.Provider value={{
    allSdLans,
    allPins,
    availableTunnelProfiles,
    associatedEdgeClusters,
    requiredFwMap
  }}>
    <Loader states={loadingStates}>
      {props.children}
    </Loader>
  </EdgeSdLanContext.Provider>
}