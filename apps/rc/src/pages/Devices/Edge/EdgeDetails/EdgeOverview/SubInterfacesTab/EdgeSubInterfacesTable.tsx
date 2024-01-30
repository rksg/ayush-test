import { Loader }                                       from '@acx-ui/components'
import { useGetEdgeSubInterfacesStatusListQuery }       from '@acx-ui/rc/services'
import { EdgeLagStatus, EdgePortStatus, useTableQuery } from '@acx-ui/rc/utils'
import { RequestPayload }                               from '@acx-ui/types'

import { SubInterfaceTable } from './SubInterfaceTable'

export const EdgeSubInterfacesTable = ({ serialNumber, portMac }:
   { serialNumber: string, portMac: string }) => {
  const settingsId = 'edge-sub-interfaces-table'
  const defaultPayload = {
    fields: [
      'sortIdx',
      'mac',
      'name',
      'type',
      'status',
      'ip',
      'subnet',
      'vlan',
      'serialNumber',
      'ipMode',
      'interfaceName'
    ],
    filters: { serialNumber: [serialNumber], mac: [portMac] },
    sortField: 'sortIdx',
    sortOrder: 'ASC'
  }

  // eslint-disable-next-line max-len
  const tableQuery = useTableQuery<EdgePortStatus | EdgeLagStatus, RequestPayload<unknown>, unknown>({
    useQuery: useGetEdgeSubInterfacesStatusListQuery,
    defaultPayload: defaultPayload,
    sorter: {
      sortField: 'sortIdx',
      sortOrder: 'ASC'
    },
    pagination: { settingsId }
  })

  return (
    <Loader states={[tableQuery]}>
      <SubInterfaceTable tableQuery={tableQuery} settingsId={settingsId} />
    </Loader>
  )
}
