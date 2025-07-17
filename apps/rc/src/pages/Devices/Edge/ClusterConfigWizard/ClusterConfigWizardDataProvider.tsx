import { createContext } from 'react'

import { FormInstance } from 'antd'

import { Loader }                     from '@acx-ui/components'
import { useGetEdgeSdLanByClusterId } from '@acx-ui/rc/components'
import {
  useGetEdgeClusterListQuery,
  useGetEdgeClusterNetworkSettingsQuery,
  useGetEdgeClusterSubInterfaceSettingsQuery,
  useGetEdgeFeatureSetsQuery,
  useGetEdgesPortStatusQuery
} from '@acx-ui/rc/services'
import {
  ClusterNetworkSettings,
  ClusterSubInterfaceSettings,
  doEdgeNetworkInterfacesDryRun,
  EdgeClusterStatus,
  EdgeLag,
  EdgeMvSdLanViewData,
  EdgeNodesPortsInfo,
  EdgePort,
  EdgeSerialNumber,
  getMergedLagTableDataFromLagForm,
  IncompatibilityFeatures,
  SubInterface
} from '@acx-ui/rc/utils'
import { compareVersions } from '@acx-ui/utils'

export interface ClusterConfigWizardContextType {
  clusterInfo?: EdgeClusterStatus
  portsStatus?: EdgeNodesPortsInfo
  lagsStatus?: EdgeNodesPortsInfo
  edgeSdLanData?: EdgeMvSdLanViewData
  clusterNetworkSettings?: ClusterNetworkSettings
  clusterSubInterfaceSettings? : ClusterSubInterfaceSettings
  isSupportAccessPort?: boolean
  requiredFwMap?: Record<string, string | undefined>
  isLoading: boolean
  isFetching: boolean

  getDryRunResult: (edgeId: EdgeSerialNumber, lag: EdgeLag) => {
    lags: EdgeLag[],
    ports: EdgePort[],
    subInterfaces: SubInterface[]
  }
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
        'venueName',
        'highAvailabilityMode'
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
      edgeIds: clusterInfo?.edgeList?.map(node => node.serialNumber),
      includeLags: true
    }
  }, {
    skip: !Boolean(clusterInfo?.edgeList?.length)
  })

  const {
    edgeSdLanData,
    isLoading: isEdgeSdLanLoading,
    isFetching: isEdgeSdLanFetching
  } = useGetEdgeSdLanByClusterId(clusterInfo?.clusterId)

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

  const {
    data: clusterSubInterfaceSettings,
    isLoading: isClusterSubInterfaceSettingsLoading,
    isFetching: isClusterSubInterfaceSettingsFetching
  } = useGetEdgeClusterSubInterfaceSettingsQuery({
    params: {
      venueId: clusterInfo?.venueId,
      clusterId: clusterInfo?.clusterId
    }
  },{
    skip: !Boolean(clusterInfo)
  })

  const { requiredFwMap } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        // eslint-disable-next-line max-len
        featureNames: [IncompatibilityFeatures.CORE_ACCESS_SEPARATION, IncompatibilityFeatures.DUAL_WAN]
      } }
  }, {
    selectFromResult: ({ data }) => {
      return {
        requiredFwMap: {
          [IncompatibilityFeatures.CORE_ACCESS_SEPARATION]: data?.featureSets
            ?.find(item =>
              item.featureName === IncompatibilityFeatures.CORE_ACCESS_SEPARATION)?.requiredFw,
          [IncompatibilityFeatures.DUAL_WAN]: data?.featureSets
            ?.find(item =>
              item.featureName === IncompatibilityFeatures.DUAL_WAN)?.requiredFw
        }
      }
    }
  })

  const isSupportAccessPort = clusterInfo?.edgeList?.every(
    // eslint-disable-next-line max-len
    edge => compareVersions(edge.firmwareVersion, requiredFwMap[IncompatibilityFeatures.CORE_ACCESS_SEPARATION]) > -1
  )

  const getDryRunResult = (formRef: FormInstance, edgeId: EdgeSerialNumber, lag: EdgeLag) => {
    // form data
    // eslint-disable-next-line max-len
    const existingPorts = clusterNetworkSettings?.portSettings?.find(l => l.serialNumber === edgeId)?.ports
    // eslint-disable-next-line max-len
    const existingLags = clusterNetworkSettings?.lagSettings?.find(l => l.serialNumber === edgeId)?.lags
    // eslint-disable-next-line max-len
    const existingSubInterfaces = clusterNetworkSettings?.subInterfaceSettings?.find(l => l.serialNumber === edgeId)

    if(!existingPorts || !existingLags || !existingSubInterfaces) {
      return clusterNetworkSettings
    }

    // merge lag into existingLag
    const updatedLagList = getMergedLagTableDataFromLagForm(existingLags, lag)
    const dryRunSubInterfaces = existingSubInterfaces.ports.flatMap(p => p.subInterfaces)
      .concat(existingSubInterfaces.lags.flatMap(l => l.subInterfaces)) as SubInterface[]

    return doEdgeNetworkInterfacesDryRun(updatedLagList, existingPorts, dryRunSubInterfaces)
  }

  const isLoading = isClusterInfoLoading || isPortStatusLoading || isEdgeSdLanLoading ||
    isClusterNetworkSettingsLoading || isClusterSubInterfaceSettingsLoading
  const isFetching = isClusterInfoFetching || isPortStatusFetching || isEdgeSdLanFetching ||
    isClusterNetworkSettingsFetching || isClusterSubInterfaceSettingsFetching

  return <ClusterConfigWizardContext.Provider value={{
    clusterInfo,
    portsStatus: portsStatus ? Object.fromEntries(
      Object.entries(portsStatus).map(([serial, ports]) => [
        serial,
        ports.filter(portInfo => !portInfo.isLag)
      ])
    ) : undefined,
    lagsStatus: portsStatus ? Object.fromEntries(
      Object.entries(portsStatus).map(([serial, ports]) => [
        serial,
        ports.filter(portInfo => portInfo.isLag)
      ])
    ) : undefined,
    edgeSdLanData,
    clusterNetworkSettings,
    clusterSubInterfaceSettings,
    requiredFwMap,
    isSupportAccessPort,
    isLoading,
    isFetching,

    getDryRunResult
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