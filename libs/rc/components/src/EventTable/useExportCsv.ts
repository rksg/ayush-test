import _      from 'lodash'
import moment from 'moment-timezone'

import { Filter }                                            from '@acx-ui/components'
import { EventsExportPayload, useDownloadEventsCSVMutation } from '@acx-ui/rc/services'
import { RequestPayload, TableQuery }                        from '@acx-ui/rc/utils'
import { useUserProfileContext }                             from '@acx-ui/user'
import { useDateFilter, useTenantId }                        from '@acx-ui/utils'

export function useExportCsv<T> (
  tableQuery: TableQuery<T, RequestPayload<unknown>, unknown>,
  fields: EventsExportPayload['fields']
) {
  const { data: userProfileData } = useUserProfileContext()
  const { startDate, endDate } = useDateFilter()
  const [ downloadCsv ] = useDownloadEventsCSVMutation()

  const payload = {
    clientDateFormat: userProfileData.dateFormat.replace('mm', 'MM'),
    clientTimeZone: moment.tz.guess(),
    detailLevel: userProfileData.detailLevel,
    eventsPeriodForExport: {
      fromTime: moment.utc(startDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      toTime: moment.utc(endDate).format('YYYY-MM-DDTHH:mm:ss[Z]')
    },
    fields,
    filters: _.omit(tableQuery?.payload?.filters as Filter, ['fromTime', 'toTime']),
    isSupport: userProfileData.support,
    searchString: tableQuery.payload?.searchString as string,
    searchTargetFields: tableQuery.payload?.searchTargetFields as string[],
    sortField: tableQuery.sorter?.sortField,
    sortOrder: tableQuery.sorter?.sortOrder,
    tenantId: useTenantId()!
  }

  return {
    exportCsv: () => downloadCsv(payload),
    disabled: !((tableQuery.data?.data ?? []).length > 0)
  }
}
