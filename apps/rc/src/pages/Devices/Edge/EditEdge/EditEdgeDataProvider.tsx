import { createContext } from 'react'

import { Loader }                           from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { useGetEdgeSdLanByEdgeOrClusterId } from '@acx-ui/rc/components'
import {
  useGetDnsServersQuery,
  useGetEdgeClusterListQuery,
  useGetEdgeClusterQuery,
  useGetEdgeFeatureSetsQuery,
  useGetEdgeLagListQuery,
  useGetEdgeLagsStatusListQuery,
  useGetEdgeListQuery,
  useGetEdgeQuery,
  useGetEdgesPortStatusQuery,
  useGetPortConfigQuery,
  useGetStaticRoutesQuery
} from '@acx-ui/rc/services'
import {
  EdgeCluster,
  EdgeClusterStatus,
  EdgeDnsServers,
  EdgeGeneralSetting,
  EdgeLag,
  EdgeLagStatus,
  EdgePort,
  EdgePortInfo,
  EdgeSdLanViewDataP2,
  EdgeStaticRouteConfig,
  EdgeStatusEnum,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'
import { compareVersions } from '@acx-ui/utils'

export interface EditEdgeDataContextType {
  generalSettings?: EdgeGeneralSetting
  clusterInfo?: EdgeClusterStatus
  portData: EdgePort[]
  portStatus: EdgePortInfo[]
  lagData: EdgeLag[]
  lagStatus: EdgeLagStatus[]
  dnsServersData?: EdgeDnsServers
  staticRouteData?: EdgeStaticRouteConfig
  clusterConfig?: EdgeCluster
  edgeSdLanData?: EdgeSdLanViewDataP2
  isSupportAccessPort?: boolean
  isClusterFormed: boolean
  isGeneralSettingsLoading: boolean
  isGeneralSettingsFetching: boolean
  isClusterInfoLoading: boolean
  isClusterInfoFetching: boolean
  isPortDataLoading: boolean
  isPortDataFetching: boolean
  isPortStatusLoading: boolean
  isPortStatusFetching: boolean
  isLagDataLoading: boolean
  isLagDataFetching: boolean
  isLagStatusLoading: boolean
  isLagStatusFetching: boolean
  isDnsServersDataLoading: boolean
  isDnsServersDataFetching: boolean
  isStaticRouteDataLoading: boolean
  isStaticRouteDataFetching: boolean
  isClusterConfigLoading: boolean
  isClusterConfigFetching: boolean
  isLoading: boolean
  isFetching: boolean
}

export const EditEdgeDataContext = createContext({
  portData: [] as EdgePort[],
  portStatus: [] as EdgePortInfo[],
  isFetching: true
} as EditEdgeDataContextType)

type EditEdgeDataProviderProps = React.PropsWithChildren<{
  serialNumber:string
}>
export const EditEdgeDataProvider = (props:EditEdgeDataProviderProps) => {
  const { serialNumber } = props
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)

  const { clusterId, venueId } = useGetEdgeListQuery(
    { payload: {
      fields: [
        'name',
        'serialNumber',
        'venueId',
        'clusterId'
      ],
      filters: { serialNumber: [serialNumber] }
    } },
    {
      skip: !serialNumber,
      selectFromResult: ({ data }) => ({
        clusterId: data?.data[0].clusterId,
        venueId: data?.data[0].venueId
      })
    }
  )

  const {
    generalSettings,
    isGeneralSettingsLoading,
    isGeneralSettingsFetching
  } = useGetEdgeQuery({
    params: {
      edgeClusterId: clusterId,
      venueId,
      serialNumber
    }
  }, {
    skip: !serialNumber || !venueId || !clusterId,
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      generalSettings: {
        venueId: venueId,
        clusterId: clusterId,
        serialNumber: serialNumber,
        ...data
      } as EdgeGeneralSetting,
      isGeneralSettingsLoading: isLoading,
      isGeneralSettingsFetching: isFetching,
      ...data
    })
  })

  const {
    clusterInfo,
    isClusterInfoLoading,
    isClusterInfoFetching
  } = useGetEdgeClusterListQuery({
    payload: {
      fields: [
        'name',
        'clusterId',
        'haStatus',
        'edgeList',
        'venueId',
        'venueName',
        'highAvailabilityMode'
      ],
      filters: { clusterId: [clusterId] },
      pageSize: 1
    }
  }, {
    skip: !clusterId,
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      clusterInfo: data?.data[0],
      isClusterInfoLoading: isLoading,
      isClusterInfoFetching: isFetching
    })
  })

  const {
    data: portData,
    isLoading: isPortDataLoading,
    isFetching: isPortDataFetching
  } = useGetPortConfigQuery({
    params: {
      venueId: clusterInfo?.venueId,
      edgeClusterId: clusterInfo?.clusterId,
      serialNumber
    }
  }, {
    skip: !serialNumber || !clusterInfo?.venueId || !clusterInfo?.clusterId
  })

  const {
    data: portStatus,
    isLoading: isPortStatusLoading,
    isFetching: isPortStatusFetching
  } = useGetEdgesPortStatusQuery({
    payload: { edgeIds: [serialNumber] }
  }, {
    skip: !serialNumber
  })

  const { lagData, isLagDataLoading, isLagDataFetching } = useGetEdgeLagListQuery({
    params: {
      venueId: clusterInfo?.venueId,
      edgeClusterId: clusterInfo?.clusterId,
      serialNumber },
    payload: {
      page: 1,
      pageSize: 10
    }
  },{
    skip: !isEdgeLagEnabled || !clusterInfo?.venueId || !clusterInfo?.clusterId,
    selectFromResult ({ data, isLoading, isFetching }) {
      return {
        lagData: data?.data,
        isLagDataLoading: isLoading,
        isLagDataFetching: isFetching
      }
    }
  })

  const { lagStatus, isLagStatusLoading, isLagStatusFetching } = useGetEdgeLagsStatusListQuery({
    params: { serialNumber },
    payload: {
      sortField: 'lagId',
      sortOrder: 'ASC'
    }
  },{
    skip: !isEdgeLagEnabled || !serialNumber,
    selectFromResult ({ data, isLoading, isFetching }) {
      return {
        lagStatus: data?.data,
        isLagStatusLoading: isLoading,
        isLagStatusFetching: isFetching
      }
    }
  })

  const {
    data: dnsServersData,
    isLoading: isDnsServersDataLoading,
    isFetching: isDnsServersDataFetching
  } = useGetDnsServersQuery({
    params: {
      venueId: clusterInfo?.venueId,
      edgeClusterId: clusterInfo?.clusterId,
      serialNumber
    }
  }, {
    skip: !serialNumber || !clusterInfo?.venueId || !clusterInfo?.clusterId
  })

  const {
    data: staticRouteData,
    isLoading: isStaticRouteDataLoading,
    isFetching: isStaticRouteDataFetching
  }= useGetStaticRoutesQuery({
    params: {
      venueId: clusterInfo?.venueId,
      edgeClusterId: clusterInfo?.clusterId,
      serialNumber
    }
  }, {
    skip: !serialNumber || !clusterInfo?.venueId || !clusterInfo?.clusterId
  })

  const {
    data: clusterConfig,
    isLoading: isClusterConfigLoading,
    isFetching: isClusterConfigFetching
  } = useGetEdgeClusterQuery({
    params: { venueId: clusterInfo?.venueId, clusterId: clusterInfo?.clusterId }
  }, { skip: !Boolean(clusterInfo?.clusterId) || !Boolean(clusterInfo?.venueId) })

  const isClusterFormed = !!clusterInfo?.edgeList &&
    clusterInfo.edgeList.filter(item =>
      item.deviceStatus !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD).length > 1

  const {
    edgeSdLanData,
    isLoading: isEdgeSdLanLoading,
    isFetching: isEdgeSdLanFetching
  } = useGetEdgeSdLanByEdgeOrClusterId(clusterId)

  const { requiredFwMap } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [IncompatibilityFeatures.CORE_ACCESS_SEPARATION]
      } }
  }, {
    selectFromResult: ({ data }) => {
      return {
        requiredFwMap: {
          [IncompatibilityFeatures.CORE_ACCESS_SEPARATION]: data?.featureSets
            ?.find(item =>
              item.featureName === IncompatibilityFeatures.CORE_ACCESS_SEPARATION)?.requiredFw
        }
      }
    }
  })

  const isSupportAccessPort = clusterInfo?.edgeList?.every(
    // eslint-disable-next-line max-len
    edge => compareVersions(edge.firmwareVersion, requiredFwMap[IncompatibilityFeatures.CORE_ACCESS_SEPARATION]) > -1
  )

  const isLoading = isPortDataLoading || isPortStatusLoading || isLagDataLoading ||
    isClusterInfoLoading || isLagStatusLoading || isGeneralSettingsLoading ||
    isDnsServersDataLoading || isStaticRouteDataLoading || isClusterConfigLoading ||
    isEdgeSdLanLoading
  const isFetching = isPortDataFetching || isPortStatusFetching || isLagDataFetching ||
    isClusterInfoFetching || isLagStatusFetching || isGeneralSettingsFetching ||
    isDnsServersDataFetching || isStaticRouteDataFetching || isClusterConfigFetching ||
    isEdgeSdLanFetching

  return <EditEdgeDataContext.Provider value={{
    generalSettings,
    clusterInfo,
    portData: portData?.ports ?? [],
    portStatus: portStatus?.[serialNumber] ?? [],
    lagData: lagData ?? [],
    lagStatus: lagStatus ?? [],
    dnsServersData,
    staticRouteData,
    clusterConfig,
    isClusterFormed,
    edgeSdLanData,
    isSupportAccessPort,
    isGeneralSettingsLoading,
    isGeneralSettingsFetching,
    isClusterInfoLoading,
    isClusterInfoFetching,
    isPortDataLoading,
    isPortDataFetching,
    isPortStatusLoading,
    isPortStatusFetching,
    isLagDataLoading,
    isLagDataFetching,
    isLagStatusLoading,
    isLagStatusFetching,
    isDnsServersDataLoading,
    isDnsServersDataFetching,
    isStaticRouteDataLoading,
    isStaticRouteDataFetching,
    isClusterConfigLoading,
    isClusterConfigFetching,
    isLoading,
    isFetching
  }}>
    <Loader states={[{ isLoading, isFetching: false }]}>
      {props.children}
    </Loader>
  </EditEdgeDataContext.Provider>
}