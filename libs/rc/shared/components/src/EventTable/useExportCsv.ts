import _      from 'lodash'
import moment from 'moment-timezone'

import { Filter }                                           from '@acx-ui/components'
import { useDownloadEventsCSVMutation }                     from '@acx-ui/rc/services'
import { TableQuery }                                       from '@acx-ui/rc/utils'
import { RequestPayload }                                   from '@acx-ui/types'
import { useUserProfileContext }                            from '@acx-ui/user'
import { DateRangeFilter, computeRangeFilter, useTenantId } from '@acx-ui/utils'

export function useExportCsv<T> (
  tableQuery: TableQuery<T, RequestPayload<unknown>, unknown>
) {
  const { data: userProfileData } = useUserProfileContext()
  const filters = _.get(tableQuery?.payload, 'filters', {}) as { dateFilter: DateRangeFilter }
  const [ downloadCsv ] = useDownloadEventsCSVMutation()
  const tenantId = useTenantId()!

  return {
    exportCsv: () => {
      const eventsPeriodForExport = computeRangeFilter(
        { dateFilter: filters.dateFilter },
        ['fromTime', 'toTime']
      ) as { fromTime: string, toTime: string }
      const payload = {
        clientDateFormat: userProfileData!.dateFormat.replace('mm', 'MM'),
        clientTimeZone: moment.tz.guess(),
        detailLevel: userProfileData!.detailLevel,
        eventsPeriodForExport: eventsPeriodForExport,
        filters: _.omit(tableQuery?.payload?.filters as Filter, ['dateFilter']),
        isSupport: userProfileData!.support,
        searchString: tableQuery.payload?.searchString as string,
        searchTargetFields: tableQuery.payload?.searchTargetFields as string[],
        sortField: tableQuery.sorter?.sortField,
        sortOrder: tableQuery.sorter?.sortOrder,
        tenantId: tenantId
      }

      return downloadCsv(payload)
    },
    disabled: !((tableQuery.data?.data ?? []).length > 0)
  }
}
