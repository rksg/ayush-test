import { createContext } from 'react'

import { Loader }                                                                                                                                                                                                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                                                                                                     from '@acx-ui/feature-toggle'
import { useGetDnsServersQuery, useGetEdgeClusterListQuery, useGetEdgeLagListQuery, useGetEdgeLagsStatusListQuery, useGetEdgeListQuery, useGetEdgeQuery, useGetEdgesPortStatusQuery, useGetPortConfigQuery, useGetStaticRoutesQuery } from '@acx-ui/rc/services'
import {
  EdgeClusterStatus,
  EdgeDnsServers,
  EdgeGeneralSetting,
  EdgeLag,
  EdgeLagStatus,
  EdgePort,
  EdgePortInfo,
  EdgeStaticRouteConfig,
  EdgeStatusEnum
} from '@acx-ui/rc/utils'

export interface EditEdgeDataContextType {
  generalSettings?: EdgeGeneralSetting
  clusterInfo?: EdgeClusterStatus
  portData: EdgePort[]
  portStatus: EdgePortInfo[]
  lagData: EdgeLag[]
  lagStatus: EdgeLagStatus[]
  dnsServersData?: EdgeDnsServers
  staticRouteData?: EdgeStaticRouteConfig
  isCluster: boolean
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

  const { clusterId } = useGetEdgeListQuery(
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
        clusterId: data?.data[0].clusterId
      })
    }
  )

  const {
    data: generalSettings,
    isLoading: isGeneralSettingsLoading,
    isFetching: isGeneralSettingsFetching
  } = useGetEdgeQuery({
    params: { serialNumber }
  }, {
    skip: !serialNumber
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
        'venueName'
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
    params: { serialNumber }
  }, {
    skip: !serialNumber
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
      serialNumber
    }
  }, {
    skip: !serialNumber
  })

  const {
    data: staticRouteData,
    isLoading: isStaticRouteDataLoading,
    isFetching: isStaticRouteDataFetching
  }= useGetStaticRoutesQuery({
    params: {
      serialNumber
    }
  }, {
    skip: !serialNumber
  })

  const isCluster = !!clusterInfo?.edgeList &&
    clusterInfo.edgeList.filter(item =>
      item.deviceStatus !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD).length > 1

  const isLoading = isPortDataLoading || isPortStatusLoading || isLagDataLoading ||
    isClusterInfoLoading || isLagStatusLoading || isGeneralSettingsLoading ||
    isDnsServersDataLoading || isStaticRouteDataLoading
  const isFetching = isPortDataFetching || isPortStatusFetching || isLagDataFetching ||
    isClusterInfoFetching || isLagStatusFetching || isGeneralSettingsFetching ||
    isDnsServersDataFetching || isStaticRouteDataFetching

  return <EditEdgeDataContext.Provider value={{
    generalSettings,
    clusterInfo,
    portData: portData?.ports ?? [],
    portStatus: portStatus?.[serialNumber] ?? [],
    lagData: lagData ?? [],
    lagStatus: lagStatus ?? [],
    dnsServersData,
    staticRouteData,
    isCluster,
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
    isLoading,
    isFetching
  }}>
    <Loader states={[{ isLoading, isFetching: false }]}>
      {props.children}
    </Loader>
  </EditEdgeDataContext.Provider>
}