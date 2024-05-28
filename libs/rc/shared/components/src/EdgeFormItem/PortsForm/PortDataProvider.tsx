import { createContext } from 'react'

import { Loader }                                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                         from '@acx-ui/feature-toggle'
import { useGetEdgeLagListQuery, useGetEdgeListQuery, useGetEdgesPortStatusQuery, useGetPortConfigQuery } from '@acx-ui/rc/services'
import { EdgeLag, EdgePort, EdgePortInfo }                                                                from '@acx-ui/rc/utils'

export interface EdgePortsDataContextType {
  portData: EdgePort[]
  portStatus: EdgePortInfo[]
  lagData?: EdgeLag[]
  isFetching: boolean
}

export const EdgePortsDataContext = createContext({
  portData: [] as EdgePort[],
  portStatus: [] as EdgePortInfo[],
  isFetching: true
} as EdgePortsDataContextType)

type EdgePortsDataContextProviderProps = React.PropsWithChildren<{
  serialNumber:string
}>

// TODO: this will be deprecated after SD-LAN P1 deprecated
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
    data: portData,
    isLoading: isPortLoading,
    isFetching: isPortFetching
  } = useGetPortConfigQuery({
    params: { serialNumber }
  })

  const {
    data: portStatus,
    isLoading: isPortStatusLoading,
    isFetching: isPortStatusFetching
  } = useGetEdgesPortStatusQuery({
    payload: { edgeIds: [serialNumber] }
  })

  const { lagData, isLagLoading, isLagFetching } = useGetEdgeLagListQuery({
    params: { venueId, edgeClusterId, serialNumber },
    payload: {
      page: 1,
      pageSize: 10
    }
  },{
    skip: !isEdgeLagEnabled || !venueId || !edgeClusterId,
    selectFromResult ({ data, isLoading, isFetching }) {
      return {
        lagData: data?.data,
        isLagLoading: isLoading,
        isLagFetching: isFetching
      }
    }
  })

  const isLoading = isPortLoading || isPortStatusLoading || isLagLoading
  const isFetching = isPortFetching || isPortStatusFetching || isLagFetching

  return <EdgePortsDataContext.Provider value={{
    portData: portData?.ports ?? [],
    portStatus: portStatus?.[serialNumber] ?? [],
    lagData: lagData ?? [],
    isFetching
  }}>
    <Loader states={[{ isLoading, isFetching }]}>
      {props.children}
    </Loader>
  </EdgePortsDataContext.Provider>
}
