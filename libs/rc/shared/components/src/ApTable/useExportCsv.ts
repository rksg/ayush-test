import _ from 'lodash'

import { Filter }                    from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { useDownloadApsCSVMutation } from '@acx-ui/rc/services'
import { TableQuery }                from '@acx-ui/rc/utils'
import { RequestPayload }            from '@acx-ui/types'
import { useTenantId }               from '@acx-ui/utils'

export function useExportCsv<T> (
  tableQuery: TableQuery<T, RequestPayload<unknown>, unknown>
) {
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const tenantId = useTenantId()
  const [ downloadCsv ] = useDownloadApsCSVMutation()

  const payload = {
    fields: tableQuery.payload?.fields,
    filters: _.omit(tableQuery?.payload?.filters as Filter, ['fromTime', 'toTime']),
    searchString: tableQuery.payload?.searchString as string,
    searchTargetFields: tableQuery.payload?.searchTargetFields as string[],
    sortField: tableQuery.sorter?.sortField,
    sortOrder: tableQuery.sorter?.sortOrder,
    ...(isUseWifiRbacApi ? {
      page: 1,
      pageSize: 10000 // The export API of RBAC version changes to query all
    } : {})

  }

  return {
    exportCsv: () => downloadCsv({
      payload,
      params: { tenantId },
      enableRbac: isUseWifiRbacApi
    }),
    disabled: !((tableQuery.data?.data ?? []).length > 0)
  }
}
