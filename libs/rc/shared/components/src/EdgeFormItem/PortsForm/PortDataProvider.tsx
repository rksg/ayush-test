import { createContext } from 'react'

import { Loader }                                                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { useGetEdgeLagListQuery, useGetEdgesPortStatusQuery, useGetPortConfigQuery } from '@acx-ui/rc/services'
import { EdgeLag, EdgePort, EdgePortInfo }                                           from '@acx-ui/rc/utils'

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
export const EdgePortsDataContextProvider = (props:EdgePortsDataContextProviderProps) => {
  const { serialNumber } = props
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)

  const {
    data: portData, isFetching: isPortFetching
  } = useGetPortConfigQuery({
    payload: { edgeIds: [serialNumber] }
  })

  const {
    data: portStatus, isFetching: isPortStatusFetching
  } = useGetEdgesPortStatusQuery({
    payload: { edgeIds: [serialNumber] }
  })

  const { lagData, isLagFetching } = useGetEdgeLagListQuery({
    params: { serialNumber },
    payload: {
      page: 1,
      pageSize: 10
    }
  },{
    skip: !isEdgeLagEnabled,
    selectFromResult ({ data, isFetching }) {
      return {
        lagData: data?.data,
        isLagFetching: isFetching
      }
    }
  })

  const isFetching = isPortFetching || isPortStatusFetching || isLagFetching

  return <EdgePortsDataContext.Provider value={{
    portData: portData?.ports ?? [],
    portStatus: portStatus?.[serialNumber] ?? [],
    lagData: lagData ?? [],
    isFetching
  }}>
    <Loader states={[{ isLoading: isFetching }]}>
      {props.children}
    </Loader>
  </EdgePortsDataContext.Provider>
}