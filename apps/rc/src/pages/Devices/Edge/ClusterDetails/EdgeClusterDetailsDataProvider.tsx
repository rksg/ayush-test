import { createContext } from 'react'

import { Loader }                     from '@acx-ui/components'
import { useGetEdgeClusterListQuery } from '@acx-ui/rc/services'
import { EdgeClusterStatus }          from '@acx-ui/rc/utils'

export interface EdgeClusterDetailsDataContextType {
  clusterInfo?: EdgeClusterStatus
  isClusterLoading: boolean
}

export const EdgeClusterDetailsDataContext = createContext({} as EdgeClusterDetailsDataContextType)

type EdgeClusterDetailsDataProviderProps = React.PropsWithChildren<{
  clusterId?:string
}>

export const EdgeClusterDetailsDataProvider = (props:EdgeClusterDetailsDataProviderProps) => {
  const { clusterId, children } = props

  const payload = {
    fields: [
      'clusterId',
      'firmwareVersion',
      'name',
      'virtualIp',
      'venueId',
      'venueName',
      'clusterStatus',
      'haStatus',
      'edgeList',
      'highAvailabilityMode',
      'type',
      'deviceStatus'
    ],
    filters: { clusterId: [clusterId] } }

  const {
    data: clusterInfo,
    isLoading: isClusterLoading
  } = useGetEdgeClusterListQuery({ payload }, {
    skip: !clusterId,
    selectFromResult: ({ data, isLoading }) => ({ data: data?.data?.[0], isLoading })
  })

  return <EdgeClusterDetailsDataContext.Provider
    value={{
      clusterInfo,
      isClusterLoading
    }}
  >
    <Loader states={[{ isLoading: isClusterLoading }]}>
      {children}
    </Loader>
  </EdgeClusterDetailsDataContext.Provider>
}