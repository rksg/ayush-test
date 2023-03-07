import { useEffect } from 'react'


import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate }                               from 'react-router-dom'

import { Tabs }                  from '@acx-ui/components'
import { useUserProfileContext } from '@acx-ui/rc/components'
import {
  EventTable,
  eventDefaultPayload,
  eventDefaultSearch,
  eventDefaultSorter,
  useEventTableFilter,
  ActivityTable,
  activityDefaultSorter,
  activityDefaultPayload,
  useActivityTableFilter
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

import { useApContext } from '../ApContext'

const Events = () => {
  const { serialNumber } = useApContext()
  const { fromTime, toTime } = useEventTableFilter()
  const { data: userProfileData } = useUserProfileContext()
  const currentUserDetailLevel = userProfileData?.detailLevel

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { ...eventDefaultPayload.filters, serialNumber: [ serialNumber ], fromTime, toTime },
      detailLevel: currentUserDetailLevel
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTime, toTime, serialNumber])
  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: {
      ...eventDefaultPayload,
      filters: { ...eventDefaultPayload.filters, serialNumber: [ serialNumber ], fromTime, toTime }
    },
    sorter: eventDefaultSorter,
    search: eventDefaultSearch,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })
  return <EventTable tableQuery={tableQuery} filterables={['severity', 'entity_type']}/>
}

const Activities = () => {
  const { serialNumber } = useApContext()
  const { fromTime, toTime } = useActivityTableFilter()
  const { data: userProfileData } = useUserProfileContext()
  const currentUserDetailLevel = userProfileData?.detailLevel

  const columnState = {
    hidden: false,
    defaultValue: {
      startDateTime: true,
      product: false,
      status: true,
      source: true,
      description: true
    }
  }
  const tableQuery = usePollingTableQuery<Activity>({
    useQuery: useActivitiesQuery,
    defaultPayload: activityDefaultPayload,
    sorter: activityDefaultSorter,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })
  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        fromTime,
        toTime,
        entityType: 'AP',
        entityId: serialNumber
      },
      detailLevel: currentUserDetailLevel
    })
  }, [fromTime, toTime])
  return <ActivityTable
    tableQuery={tableQuery}
    filterables={['status']}
    columnState={columnState}
  />
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

export function ApTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab = tabs[0].key, serialNumber } = useApContext()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}/details/timeline/`)
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const Tab = tabs.find(tab => tab.key === activeSubTab)?.component
  return (
    <Tabs
      onChange={onTabChange}
      activeKey={activeSubTab}
      type='card'
    >
      {tabs.map(({ key, title }) =>
        <Tabs.TabPane tab={$t(title)} key={key} >{Tab && <Tab/>}</Tabs.TabPane>)}
    </Tabs>
  )
}
