import { useEffect } from 'react'

import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate, useParams }                    from 'react-router-dom'

import { Tabs }           from '@acx-ui/components'
import {
  EventTable,
  eventDefaultPayload,
  eventDefaultSearch,
  eventDefaultSorter,
  ActivityTable,
  activityDefaultSorter } from '@acx-ui/rc/components'
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
  const { networkId } = useParams()
  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: {
      ...eventDefaultPayload,
      filters: { ...eventDefaultPayload.filters, networkId: [ networkId ] }
    },
    sorter: eventDefaultSorter,
    search: eventDefaultSearch,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
  })
  return <EventTable tableQuery={tableQuery} filterables={['severity', 'entity_type']}/>
}

// "filters":{
//   "entityType": "AP",
//   "entityId": "1234"
// }

const Activities = () => {
  const { networkId } = useParams()
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
        entityType: 'NETWORK',
        entityId: networkId
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
    title: defineMessage({ defaultMessage: 'Events' }),
    component: Events
  },
  {
    key: 'activities',
    title: defineMessage({ defaultMessage: 'Activities' }),
    component: Activities
  }
]

export function NetworkTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab = tabs[0].key, networkId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/networks/wireless/${networkId}/network-details/timeline/`)
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
