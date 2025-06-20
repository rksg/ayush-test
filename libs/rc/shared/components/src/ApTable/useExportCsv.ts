import { omit } from 'lodash'

import { Filter }                    from '@acx-ui/components'
import { useDownloadApsCSVMutation } from '@acx-ui/rc/services'
import { TableQuery }                from '@acx-ui/rc/utils'
import { RequestPayload }            from '@acx-ui/types'
import { useTenantId }               from '@acx-ui/utils'

export function useExportCsv<T> (
  tableQuery: TableQuery<T, RequestPayload<unknown>, unknown>
) {
  const tenantId = useTenantId()
  const [ downloadCsv ] = useDownloadApsCSVMutation()

  const payload = {
    fields: tableQuery.payload?.fields,
    filters: omit(tableQuery?.payload?.filters as Filter, ['fromTime', 'toTime']),
    searchString: tableQuery.payload?.searchString as string,
    searchTargetFields: tableQuery.payload?.searchTargetFields as string[],
    sortField: tableQuery.sorter?.sortField,
    sortOrder: tableQuery.sorter?.sortOrder,
    page: 1,
    pageSize: 10000 // The export API of RBAC version changes to query all
  }

  return {
    exportCsv: () => downloadCsv({
      payload,
      params: { tenantId }
    }),
    disabled: !((tableQuery.data?.data ?? []).length > 0)
  }
}
