import _             from 'lodash'
import moment        from 'moment-timezone'
import { useParams } from 'react-router-dom'

import { Filter }                                            from '@acx-ui/components'
import { EventsExportPayload, useDownloadEventsCSVMutation } from '@acx-ui/rc/services'
import { RequestPayload, TableQuery }                        from '@acx-ui/rc/utils'
import { useUserProfileContext }                             from '@acx-ui/user'
import { useDateFilter }                                     from '@acx-ui/utils'

export function useExportCsv<T> (
  tableQuery: TableQuery<T, RequestPayload<unknown>, unknown>,
  fields: EventsExportPayload['fields']
) {
  const params = useParams()
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
    isSupport: false,
    searchString: tableQuery.payload?.searchString as string,
    searchTargetFields: tableQuery.payload?.searchTargetFields as string[],
    sortField: 'event_datetime',
    sortOrder: 'DESC',
    tenantId: params.tenantId!
  }

  return {
    exportCsv: () => downloadCsv(payload),
    disabled: !((tableQuery.data?.data ?? []).length > 0)
  }
}
