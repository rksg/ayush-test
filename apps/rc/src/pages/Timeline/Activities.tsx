import { useEffect } from 'react'

import { ActivityTable }                           from '@acx-ui/rc/components'
import { useActivitiesQuery }                      from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { useDateFilter }                           from '@acx-ui/utils'

const Activities = () => {
  const { startDate, endDate } = useDateFilter()

  const tableQuery = useTableQuery<Activity>({
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

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        fromTime: startDate,
        toTime: endDate
      }
    })
  }, [startDate, endDate])

  return <ActivityTable tableQuery={tableQuery}/>
}

export { Activities }
