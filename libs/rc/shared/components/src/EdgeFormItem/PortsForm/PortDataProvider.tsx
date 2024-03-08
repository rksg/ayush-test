import { createContext } from 'react'

import { Loader }                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn }                                                         from '@acx-ui/feature-toggle'
import { useGetEdgeLagListQuery, useGetEdgeListQuery, useGetEdgePortListWithStatusQuery } from '@acx-ui/rc/services'
import { appendIsLagPortOnPortConfig, EdgeLag, EdgePortWithStatus }                       from '@acx-ui/rc/utils'

export interface EdgePortsDataContextType {
  portData: EdgePortWithStatus[] | undefined
  lagData?: EdgeLag[]
  isLoading: boolean
  isFetching: boolean
}

export const EdgePortsDataContext = createContext({
  portData: [] as EdgePortWithStatus[],
  isLoading: true,
  isFetching: false
} as EdgePortsDataContextType)

type EdgePortsDataContextProviderProps = React.PropsWithChildren<{
  serialNumber:string
}>
export const EdgePortsDataContextProvider = (props:EdgePortsDataContextProviderProps) => {
  const { serialNumber } = props
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)

  const { venueId, edgeClusterId } = useGetEdgeListQuery(
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
      skip: !!!serialNumber || !isEdgeLagEnabled,
      selectFromResult: ({ data }) => ({
        venueId: data?.data[0].venueId,
        edgeClusterId: data?.data[0].clusterId
      })
    }
  )

  const {
    data: portsWithStatusData,
    isLoading: isPortStatusLoading,
    isFetching: isPortStatusFetching
  } = useGetEdgePortListWithStatusQuery({
    params: { serialNumber },
    payload: {
      fields: ['port_id','ip'],
      filters: { serialNumber: [serialNumber] }
    }
  })

  const { lagData = [], isLagLoading, isLagFetching } = useGetEdgeLagListQuery({
    params: { venueId, edgeClusterId, serialNumber },
    payload: {
      page: 1,
      pageSize: 10
    }
  },{
    skip: !isEdgeLagEnabled,
    selectFromResult ({ data, isLoading, isFetching }) {
      return {
        lagData: data?.data,
        isLagLoading: isLoading,
        isLagFetching: isFetching
      }
    }
  })

  const portDataWitIsLag = appendIsLagPortOnPortConfig(portsWithStatusData, lagData)
  const isLoading = isPortStatusLoading || isLagLoading
  const isFetching = isPortStatusFetching || isLagFetching

  return <EdgePortsDataContext.Provider value={{
    portData: portDataWitIsLag,
    lagData: lagData,
    isLoading,
    isFetching
  }}>
    <Loader states={[{
      isLoading: isLoading,
      isFetching: isFetching }]}
    >
      {props.children}
    </Loader>
  </EdgePortsDataContext.Provider>
}
