import { ActivityTable }                                  from '@acx-ui/rc/components'
import { useActivitiesQuery }                             from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, usePollingTableQuery } from '@acx-ui/rc/utils'

const Activities = () => {
  const tableQuery = usePollingTableQuery<Activity>({
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
