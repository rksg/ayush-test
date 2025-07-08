import { Loader }                                 from '@acx-ui/components'
import { useGetEdgeSubInterfacesStatusListQuery } from '@acx-ui/rc/services'
import { EdgePortInfo }                           from '@acx-ui/rc/utils'
import { RequestPayload }                         from '@acx-ui/types'
import { useTableQuery }                          from '@acx-ui/utils'

import { SubInterfaceTable } from './SubInterfaceTable'

export const EdgeSubInterfacesTable = ({ serialNumber, ifName }:
   { serialNumber: string, ifName?: string }) => {
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
    filters: { serialNumber: [serialNumber] },
    searchTargetFields: ['interfaceName'],
    searchString: `${ifName}.`,
    sortField: 'sortIdx',
    sortOrder: 'ASC'
  }

  const tableQuery = useTableQuery<EdgePortInfo, RequestPayload<unknown>, unknown>({
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