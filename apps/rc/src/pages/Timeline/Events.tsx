import { useEffect } from 'react'

import {
  EventTable,
  eventDefaultPayload,
  eventDefaultSearch,
  eventDefaultSorter,
  useEventTableFilter
} from '@acx-ui/rc/components'
import { useEventsQuery } from '@acx-ui/rc/services'
import {
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  Event,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { useUserProfileContext } from '@acx-ui/user'

const Events = () => {
  const { fromTime, toTime } = useEventTableFilter()
  const { data: userProfileData } = useUserProfileContext()
  const currentUserDetailLevel = userProfileData?.detailLevel

  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: eventDefaultPayload,
    sorter: eventDefaultSorter,
    search: eventDefaultSearch,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })

  useEffect(()=>{
    const payload = tableQuery.payload as { filters?: Record<string, string[]> }
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        ...payload.filters,
        fromTime,
        toTime
      },
      detailLevel: currentUserDetailLevel
    })
  }, [fromTime, toTime, currentUserDetailLevel])

  return <EventTable tableQuery={tableQuery}/>
}
export { Events }
