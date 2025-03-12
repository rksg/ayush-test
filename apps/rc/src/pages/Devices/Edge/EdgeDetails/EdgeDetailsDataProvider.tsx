import { createContext } from 'react'

import { Loader }                                             from '@acx-ui/components'
import { useEdgeBySerialNumberQuery, useGetEdgeClusterQuery } from '@acx-ui/rc/services'
import { EdgeCluster, EdgeStatus }                            from '@acx-ui/rc/utils'

export interface EdgeDetailsDataContextType {
  currentEdgeStatus?: EdgeStatus
  currentCluster?: EdgeCluster
  isEdgeStatusLoading: boolean
  isClusterLoading: boolean
}

export const EdgeDetailsDataContext = createContext({} as EdgeDetailsDataContextType)

type EdgeDetailsDataProviderProps = React.PropsWithChildren<{
  serialNumber?:string
}>

export const EdgeDetailsDataProvider = (props:EdgeDetailsDataProviderProps) => {
  const { serialNumber, children } = props

  const edgeStatusPayload = {
    fields: [
      'name',
      'venueId',
      'clusterId',
      'venueName',
      'type',
      'serialNumber',
      'ports',
      'ip',
      'model',
      'firmwareVersion',
      'deviceStatus',
      'deviceSeverity',
      'venueId',
      'tags',
      'cpuCores',
      'cpuUsedPercentage',
      'memoryUsedKb',
      'memoryTotalKb',
      'diskUsedKb',
      'diskTotalKb',
      'description',
      'isHqosEnabled',
      'haStatus',
      'isArpTerminationEnabled'
    ],
    filters: { serialNumber: [serialNumber] } }

  const {
    data: currentEdgeStatus,
    isLoading: isEdgeStatusLoading
  } = useEdgeBySerialNumberQuery({
    params: { serialNumber },
    payload: edgeStatusPayload
  }, { skip: !serialNumber })

  const { data: currentCluster, isLoading: isClusterLoading } = useGetEdgeClusterQuery({
    params: { venueId: currentEdgeStatus?.venueId, clusterId: currentEdgeStatus?.clusterId }
  }, { skip: !Boolean(currentEdgeStatus?.clusterId) || !Boolean(currentEdgeStatus?.venueId) })

  return <EdgeDetailsDataContext.Provider
    value={{
      currentEdgeStatus,
      currentCluster,
      isEdgeStatusLoading,
      isClusterLoading
    }}
  >
    <Loader states={[{ isLoading: isEdgeStatusLoading || isClusterLoading }]}>
      {children}
    </Loader>
  </EdgeDetailsDataContext.Provider>
}