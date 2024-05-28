import { createContext } from 'react'

import { useEdgeBySerialNumberQuery } from '@acx-ui/rc/services'
import { EdgeStatus }                 from '@acx-ui/rc/utils'

export interface EdgeDetailsDataContextType {
  currentEdgeStatus?: EdgeStatus
  isEdgeStatusLoading: boolean
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
      'description'
    ],
    filters: { serialNumber: [serialNumber] } }

  const {
    data: currentEdgeStatus,
    isLoading: isEdgeStatusLoading
  } = useEdgeBySerialNumberQuery({
    params: { serialNumber },
    payload: edgeStatusPayload
  }, { skip: !serialNumber })

  return <EdgeDetailsDataContext.Provider
    value={{
      currentEdgeStatus,
      isEdgeStatusLoading
    }}
  >
    {children}
  </EdgeDetailsDataContext.Provider>
}