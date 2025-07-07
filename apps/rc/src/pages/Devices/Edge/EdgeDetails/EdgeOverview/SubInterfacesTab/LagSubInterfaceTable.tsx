import { Loader }                                    from '@acx-ui/components'
import { useGetEdgeLagSubInterfacesStatusListQuery } from '@acx-ui/rc/services'
import { EdgePortInfo }                              from '@acx-ui/rc/utils'
import { RequestPayload }                            from '@acx-ui/types'
import { useTableQuery }                             from '@acx-ui/utils'

import { SubInterfaceTable } from './SubInterfaceTable'

export const LagSubInterfaceTable = ({ serialNumber, lagId }:
   { serialNumber: string, lagId: number }) => {
  const settingsId = 'edge-sub-interfaces-table'
  const defaultPayload = {
    fields: [
      'status','portType','subnet','ip','ipMode','vlan', 'mac'
    ],
    filters: { lagId: [lagId] }
  }

  // eslint-disable-next-line max-len
  const tableQuery = useTableQuery<EdgePortInfo, RequestPayload<unknown>, unknown>({
    useQuery: useGetEdgeLagSubInterfacesStatusListQuery,
    apiParams: { serialNumber },
    defaultPayload: defaultPayload,
    pagination: { settingsId }
  })


  return (
    <Loader states={[tableQuery]}>
      <SubInterfaceTable tableQuery={tableQuery} settingsId={settingsId} />
    </Loader>
  )
}