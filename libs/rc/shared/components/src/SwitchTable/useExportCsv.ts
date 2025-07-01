import _ from 'lodash'

import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { useDownloadSwitchsCSVMutation } from '@acx-ui/rc/services'
import { TableQuery }                    from '@acx-ui/rc/utils'
import type { Filter, RequestPayload }   from '@acx-ui/types'
import { useTenantId }                   from '@acx-ui/utils'

export function useExportCsv<T> (
  tableQuery: TableQuery<T, RequestPayload<unknown>, unknown>
) {
  const [ downloadCsv ] = useDownloadSwitchsCSVMutation()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const payload = {
    fields: tableQuery.payload?.fields,
    filters: _.omit(tableQuery?.payload?.filters as Filter, ['fromTime', 'toTime']),
    searchString: tableQuery.payload?.searchString as string,
    searchTargetFields: tableQuery.payload?.searchTargetFields as string[],
    sortField: tableQuery.sorter?.sortField,
    sortOrder: tableQuery.sorter?.sortOrder,
    tenantId: useTenantId()!
  }

  return {
    exportCsv: () => downloadCsv({ payload, enableRbac: isSwitchRbacEnabled }),
    disabled: !((tableQuery.data?.data ?? []).length > 0)
  }
}
