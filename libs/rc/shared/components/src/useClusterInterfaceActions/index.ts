import { useIntl } from 'react-intl'

import { showActionModal }                     from '@acx-ui/components'
import {
  useGetAllInterfacesByTypeQuery,
  useLazyGetEdgeLagListQuery,
  useLazyGetPortConfigQuery,
  usePatchEdgeClusterNetworkSettingsMutation
} from '@acx-ui/rc/services'
import {
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgeIpModeEnum,
  EdgeLag,
  EdgePortInfo,
  EdgePortTypeEnum,
  EdgePortWithStatus
} from '@acx-ui/rc/utils'

export interface ClusterInterfaceInfo {
  nodeName: string
  serialNumber: string
  interfaceName?: string
  ipMode?: EdgeIpModeEnum
  ip?: string
  subnet?: string
}

export const useClusterInterfaceActions = (currentClusterStatus?: EdgeClusterStatus) => {
  const venueId = currentClusterStatus?.venueId
  const clusterId = currentClusterStatus?.clusterId
  const edgeNodeList = currentClusterStatus?.edgeList
  const { $t } = useIntl()
  const [getPortConfig] = useLazyGetPortConfigQuery()
  const [getEdgeLagList] = useLazyGetEdgeLagListQuery()
  const [updateNetworkConfig] = usePatchEdgeClusterNetworkSettingsMutation()
  const {
    data: allInterfaceData,
    isLoading: isInterfaceDataLoading,
    isFetching: isInterfaceDataFetching
  } = useGetAllInterfacesByTypeQuery({
    payload: {
      edgeIds: edgeNodeList?.map(item => item.serialNumber),
      portType: [EdgePortTypeEnum.CLUSTER, EdgePortTypeEnum.LAN, EdgePortTypeEnum.UNCONFIGURED]
    }
  },{
    skip: !Boolean(edgeNodeList) || edgeNodeList?.length === 0
  })

  const updateClusterInterface = async (
    data: ClusterInterfaceInfo[],
    callback?: () => void
  ) => {
    if(isDataChanged(data)) {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Change Cluster Interface' }),
        content: $t({
          defaultMessage: `Are you sure you want to change the cluster interface to
          different port/LAG? The currently used port/LAG as the cluster interface
          will be disabled.`
        }),
        okText: $t({ defaultMessage: 'Change' }),
        onOk: async () => {
          await excuteUpdate(data)
          callback?.()
        }
      })
    } else {
      await excuteUpdate(data)
      callback?.()
    }
  }

  const getOldInterfaceConfig = (serialNumber: string) => {
    return allInterfaceData?.[serialNumber]?.find(
      interfaceData => interfaceData.portType === EdgePortTypeEnum.CLUSTER &&
      interfaceData.portEnabled
    )
  }

  const isDataChanged = (data: ClusterInterfaceInfo[]) => {
    for(let interfaceData of data) {
      const oldInterfaceData = getOldInterfaceConfig(interfaceData.serialNumber)
      if(oldInterfaceData !== undefined
        && oldInterfaceData?.portName !== interfaceData.interfaceName) {
        return true
      }
    }
    return false
  }

  const excuteUpdate = async (data: ClusterInterfaceInfo[]) => {
    const payload = {} as ClusterNetworkSettings
    for(let interfaceData of data) {
      const oldInterfaceData = getOldInterfaceConfig(interfaceData.serialNumber)
      if(
        oldInterfaceData &&
        oldInterfaceData?.portName.charAt(0) !== interfaceData.interfaceName?.charAt(0)
      ) {
        if(oldInterfaceData?.portName.toLocaleLowerCase()?.includes('lag')) {
          payload.lagSettings = await organizeToLagSetting(interfaceData, payload, oldInterfaceData)
        } else {
          payload.portSettings = await organizeToPortSetting(
            interfaceData,
            payload,
            oldInterfaceData
          )
        }
      }
      if(interfaceData.interfaceName?.toLocaleLowerCase()?.includes('lag')) {
        payload.lagSettings = await organizeToLagSetting(interfaceData, payload, oldInterfaceData)
      } else {
        payload.portSettings = await organizeToPortSetting(
          interfaceData,
          payload,
          oldInterfaceData
        )
      }
    }

    try {
      await updateNetworkConfig({
        params: {
          venueId: currentClusterStatus?.venueId,
          clusterId: currentClusterStatus?.clusterId
        },
        payload
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const organizeToLagSetting = async (
    newInterfaceData: ClusterInterfaceInfo,
    payload: ClusterNetworkSettings,
    oldInterfaceData?: EdgePortInfo
  ) => {
    const lagData = await getEdgeLagList({
      params: {
        venueId: currentClusterStatus?.venueId,
        edgeClusterId: currentClusterStatus?.clusterId,
        serialNumber: newInterfaceData.serialNumber },
      payload: { page: 1, pageSize: 20 }
    })
    let lags = lagData.data?.data
    lags = lags?.map(item => {
      const lagName = `lag${item.id}`
      let portType = item.portType
      let ipMode = item.ipMode
      let ip = item.ip
      let subnet = item.subnet
      let lagEnabled = item.lagEnabled
      if(lagName === newInterfaceData.interfaceName?.toLocaleLowerCase()) {
        const currentIpMode = newInterfaceData.ipMode
        portType = EdgePortTypeEnum.CLUSTER
        ipMode = currentIpMode ?? EdgeIpModeEnum.STATIC
        ip = currentIpMode === EdgeIpModeEnum.DHCP ? '' : (newInterfaceData.ip ?? '')
        subnet = currentIpMode === EdgeIpModeEnum.DHCP ? '' : (newInterfaceData.subnet ?? '')
        lagEnabled = true
      } else if(lagName === oldInterfaceData?.portName.toLocaleLowerCase()) {
        lagEnabled = false
      }
      return {
        ...item,
        portType,
        ipMode,
        ip,
        subnet,
        lagEnabled
      }
    }) as EdgeLag[]
    return [
      ...(payload.lagSettings ?? []),
      {
        serialNumber: newInterfaceData.serialNumber,
        lags
      }
    ]
  }

  const organizeToPortSetting = async (
    newInterfaceData: ClusterInterfaceInfo,
    payload: ClusterNetworkSettings,
    oldInterfaceData?: EdgePortInfo
  ) => {
    const portData = await getPortConfig({
      params: {
        venueId: venueId,
        edgeClusterId: clusterId,
        serialNumber: newInterfaceData.serialNumber
      }
    })
    let ports: EdgePortWithStatus[] = portData.data?.ports as EdgePortWithStatus[]
    ports = ports?.map(item =>{
      let portType = item.portType
      let ipMode = item.ipMode
      let ip = item.ip
      let subnet = item.subnet
      let enabled = item.enabled
      if(item.interfaceName === newInterfaceData.interfaceName) {
        const currentIpMode = newInterfaceData.ipMode
        portType = EdgePortTypeEnum.CLUSTER
        ipMode = currentIpMode ?? EdgeIpModeEnum.STATIC
        ip = currentIpMode === EdgeIpModeEnum.DHCP ? '' : (newInterfaceData.ip ?? '')
        subnet = currentIpMode === EdgeIpModeEnum.DHCP ? '' : (newInterfaceData.subnet ?? '')
        enabled = true
      } else if(item.interfaceName === oldInterfaceData?.portName) {
        enabled = false
      }

      return {
        ...item,
        portType,
        ipMode,
        ip,
        subnet,
        enabled
      }
    })
    return [
      ...(payload.portSettings ?? []),
      {
        serialNumber: newInterfaceData.serialNumber,
        ports
      }
    ]
  }

  return {
    allInterfaceData,
    isInterfaceDataLoading,
    isInterfaceDataFetching,
    updateClusterInterface
  }
}
