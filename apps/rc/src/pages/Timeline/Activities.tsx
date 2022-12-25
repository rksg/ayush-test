import { ActivityTable }                                           from '@acx-ui/rc/components'
import { useActivitiesQuery }                                      from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, RequestPayload, useTableQuery } from '@acx-ui/rc/utils'

const Activities = () => {
  const tableQuery = useTableQuery<Activity, RequestPayload<unknown>, unknown>({
    useQuery: useActivitiesQuery,
    defaultPayload: {
      url: CommonUrlsInfo.getActivityList.url,
      fields: [
        'startDatetime',
        'endDatetime',
        'status',
        'product',
        'admin',
        'descriptionTemplate',
        'descriptionData',
        'severity'
      ]
    },
    sorter: {
      sortField: 'startDatetime',
      sortOrder: 'DESC'
    }
  })
  return <ActivityTable tableQuery={tableQuery}/>
}

export { Activities }
