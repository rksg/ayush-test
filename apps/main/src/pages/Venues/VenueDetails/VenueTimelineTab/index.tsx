import React, { useEffect } from 'react'

import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate, useParams }                    from 'react-router-dom'

import { Tabs }           from '@acx-ui/components'
import {
  EventTable,
  eventDefaultPayload,
  eventDefaultSearch,
  eventDefaultSorter,
  useEventTableFilter,
  ActivityTable,
  activityDefaultSorter,
  activityDefaultPayload,
  useActivityTableFilter,
  useUserProfileContext
} from '@acx-ui/rc/components'
import { useActivitiesQuery, useEventsQuery } from '@acx-ui/rc/services'
import {
  Event,
  usePollingTableQuery,
  TimelineTypes,
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  Activity
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

const Events = () => {
  const { venueId } = useParams()
  const { fromTime, toTime } = useEventTableFilter()
  const { data: userProfileData } = useUserProfileContext()
  const currentUserDetailLevel = userProfileData?.detailLevel

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { ...eventDefaultPayload.filters, venueId: [ venueId ], fromTime, toTime },
      detailLevel: currentUserDetailLevel
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTime, toTime, venueId, currentUserDetailLevel])
  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: {
      ...eventDefaultPayload,
      filters: { ...eventDefaultPayload.filters, venueId: [ venueId ], fromTime, toTime }
    },
    sorter: eventDefaultSorter,
    search: eventDefaultSearch,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })
  return <EventTable tableQuery={tableQuery}/>
}

const Activities = () => {
  const { venueId } = useParams()
  const { fromTime, toTime } = useActivityTableFilter()
  const { data: userProfileData } = useUserProfileContext()
  const currentUserDetailLevel = userProfileData?.detailLevel

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        fromTime,
        toTime,
        entityType: 'VENUES',
        entityId: venueId
      },
      detailLevel: currentUserDetailLevel
    })
  }, [fromTime, toTime, currentUserDetailLevel])
  const tableQuery = usePollingTableQuery<Activity>({
    useQuery: useActivitiesQuery,
    defaultPayload: activityDefaultPayload,
    sorter: activityDefaultSorter,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })
  return <ActivityTable tableQuery={tableQuery} filterables={['status', 'product']}/>
}

const tabs : {
  key: TimelineTypes,
  title: MessageDescriptor,
  component: () => JSX.Element
}[] = [
  {
    key: 'activities',
    title: defineMessage({ defaultMessage: 'Activities' }),
    component: Activities
  },
  {
    key: 'events',
    title: defineMessage({ defaultMessage: 'Events' }),
    component: Events
  }
]

export function VenueTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab = tabs[0].key, venueId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/timeline/`)

  // TODO: remove istanbul and add unit test once there are more than 1 tab
  /* istanbul ignore next */
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const Tab = tabs.find(tab => tab.key === activeSubTab)?.component
  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    type='card'
  >
    {tabs.map(({ key, title }) =>
      <Tabs.TabPane tab={$t(title)} key={key} >{Tab && <Tab/>}</Tabs.TabPane>)}
  </Tabs>
}
