import { useEffect } from 'react'

import { ActivityTable, useActivityTableFilter }   from '@acx-ui/rc/components'
import { useActivitiesQuery }                      from '@acx-ui/rc/services'
import { Activity, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { useUserProfileContext }                   from '@acx-ui/user'

const Activities = () => {
  const { fromTime, toTime } = useActivityTableFilter()
  const { data: userProfileData } = useUserProfileContext()
  const currentUserDetailLevel = userProfileData?.detailLevel

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
        fromTime,
        toTime
      },
      detailLevel: currentUserDetailLevel
    })
  }, [fromTime, toTime, currentUserDetailLevel])

  return <ActivityTable tableQuery={tableQuery}/>
}

export { Activities }
