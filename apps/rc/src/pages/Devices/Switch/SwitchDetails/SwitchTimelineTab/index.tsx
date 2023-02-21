import { useEffect } from 'react'

import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate, useParams }                    from 'react-router-dom'

import { Tabs }           from '@acx-ui/components'
import {
  EventTable,
  eventDefaultPayload,
  eventDefaultSorter,
  eventDefaultSearch,
  ActivityTable,
  activityDefaultSorter
} from '@acx-ui/rc/components'
import { useActivitiesQuery, useEventsQuery } from '@acx-ui/rc/services'
import {
  Event,
  usePollingTableQuery,
  TimelineTypes,
  TABLE_QUERY_LONG_POLLING_INTERVAL,
  useTableQuery,
  Activity,
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { useDateFilter } from '@acx-ui/utils'

const Events = () => {
  // TODO: add fromTime/toTime to filter when DatePicker is ready
  const params = useParams()
  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: {
      ...eventDefaultPayload,
      filters: {
        ...eventDefaultPayload.filters,
        serialNumber: [ params.serialNumber ]
      }
    },
    sorter: eventDefaultSorter,
    search: eventDefaultSearch,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })
  return <EventTable tableQuery={tableQuery} filterables={['severity', 'entity_type']}/>
}

const Activities = () => {
  const { switchId } = useParams()
  const { startDate, endDate } = useDateFilter()

  const tableQuery = useTableQuery<Activity>({
    useQuery: useActivitiesQuery,
    defaultPayload: {
      url: CommonUrlsInfo.getActivityList.url,
      fields: [
        'startDatetime',
        'endDatetime',
        'status',
        'admin',
        'descriptionTemplate',
        'descriptionData',
        'severity'
      ]
    },
    sorter: activityDefaultSorter,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        fromTime: startDate,
        toTime: endDate,
        entityType: 'SWITCH',
        entityId: switchId
      }
    })
  }, [startDate, endDate])

  return <ActivityTable
    tableQuery={tableQuery}
    filterables={['status']}
    hiddenColumn={['product']}
  />
}

const tabs : {
  key: TimelineTypes,
  title: MessageDescriptor,
  component: () => JSX.Element
}[] = [
  {
    key: 'events',
    title: defineMessage({ defaultMessage: 'Events Switch' }),
    component: Events
  },
  {
    key: 'activities',
    title: defineMessage({ defaultMessage: 'Activitees' }),
    component: Activities
  }
]

export function SwitchTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab = tabs[0].key, switchId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}/details/timeline/`)
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
