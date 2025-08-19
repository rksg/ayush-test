import { useMemo } from 'react'

import { Features }                      from '@acx-ui/feature-toggle'
import {
  useGetEdgeClusterListQuery,
  useGetTunnelProfileTemplateViewDataListSkipRecRewriteQuery,
  useGetTunnelProfileViewDataListQuery
} from '@acx-ui/rc/services'
import { useIsEdgeFeatureReady } from '@acx-ui/rc/utils'

interface useGetAvailableEdgeClusterDataProps {
  isTemplate?: boolean
  currentBoundEdgeClusterId?: string
}

export const useGetAvailableEdgeClusterData = (props: useGetAvailableEdgeClusterDataProps) => {
  const {
    isTemplate,
    currentBoundEdgeClusterId
  } = props

  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  const {
    clusterData,
    clusterIds,
    isLoading: isClusterOptsLoading
  } = useGetEdgeClusterListQuery(
    {
      payload: {
        fields: [
          'name',
          'venueId',
          'clusterId',
          'firmwareVersion',
          'highAvailabilityMode'
        ],
        sortField: 'name',
        sortOrder: 'ASC',
        pageSize: 10000
      }
    },
    {
      skip: !isEdgeL2greReady,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterData: data?.data,
          clusterIds: data?.data?.map(item => item.clusterId),
          isLoading
        }
      }
    })

  const tunnelQueryPayload = {
    payload: {
      fields: [
        'id',
        'destinationEdgeClusterId'
      ],
      filters: {
        destinationEdgeClusterId: clusterIds ?? []
      }
    }
  }

  const {
    invalidEdgeClusterIds,
    isLoading: isTunnelProfileLoading
  } = useGetTunnelProfileViewDataListQuery(
    { payload: tunnelQueryPayload },
    {
      skip: isTemplate || !!!clusterIds?.length,
      selectFromResult: ({ data, isLoading }) => {
        return {
          invalidEdgeClusterIds: data?.data?.map(item => item.destinationEdgeClusterId),
          isLoading
        }
      }
    }
  )

  const {
    invalidEdgeClusterIds: invalidEdgeClusterIdsForTemplate,
    isLoading: isTunnelProfileTemplateLoading
  } = useGetTunnelProfileTemplateViewDataListSkipRecRewriteQuery(
    { payload: tunnelQueryPayload },
    {
      skip: !isTemplate || !!!clusterIds?.length,
      selectFromResult: ({ data, isLoading }) => {
        return {
          invalidEdgeClusterIds: data?.data?.map(item => item.destinationEdgeClusterId),
          isLoading
        }
      }
    }
  )

  const availableClusterData = useMemo(() => {
    if (!clusterData?.length) {
      return []
    }

    const invalidClusterIds = isTemplate
      ? invalidEdgeClusterIdsForTemplate
      : invalidEdgeClusterIds

    return clusterData
      .filter(item =>
        !invalidClusterIds?.includes(item.clusterId) ||
        item.clusterId === currentBoundEdgeClusterId
      )
  }, [
    clusterData,
    isTemplate,
    invalidEdgeClusterIds,
    invalidEdgeClusterIdsForTemplate,
    currentBoundEdgeClusterId
  ])

  const isLoading = isClusterOptsLoading || isTunnelProfileLoading ||
    isTunnelProfileTemplateLoading

  return {
    availableClusterData,
    isLoading
  }
}