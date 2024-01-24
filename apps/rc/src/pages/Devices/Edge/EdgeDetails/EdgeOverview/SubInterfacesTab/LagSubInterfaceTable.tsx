import { Loader }                                       from '@acx-ui/components'
import { useGetEdgeLagSubInterfacesStatusListQuery }    from '@acx-ui/rc/services'
import { EdgeLagStatus, EdgePortStatus, useTableQuery } from '@acx-ui/rc/utils'
import { RequestPayload }                               from '@acx-ui/types'

import { SubInterfaceTable } from './SubInterfaceTable'

export const LagSubInterfaceTable = ({ serialNumber, lagId }:
   { serialNumber: string, lagId: number }) => {

  const defaultPayload = {
    fields: [
      'status','portType','subnet','ip','ipMode','vlan'
    ],
    filters: { lagId: [lagId] }
  }

  // eslint-disable-next-line max-len
  const tableQuery = useTableQuery<EdgePortStatus | EdgeLagStatus, RequestPayload<unknown>, unknown>({
    useQuery: useGetEdgeLagSubInterfacesStatusListQuery,
    apiParams: { serialNumber },
    defaultPayload: defaultPayload
  })


  return (
    <Loader states={[tableQuery]}>
      <SubInterfaceTable tableQuery={tableQuery} />
    </Loader>
  )
}
