import { useEffect } from 'react'

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

import { useApContext } from '../ApContext'

const Events = () => {
  const { serialNumber } = useApContext()
  const { fromTime, toTime } = useEventTableFilter()
  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: { ...eventDefaultPayload.filters, serialNumber: [ serialNumber ], fromTime, toTime }
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
  const { startDate, endDate } = useDateFilter()
  const { networkId } = useParams()

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
      ],
      filters: {
        networkId: [ networkId ]
      }
    },
    sorter: activityDefaultSorter,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
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

  return <ActivityTable tableQuery={tableQuery} filterables={['status', 'product']} hiddenColumn={['product']}/>
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

export function ApTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab = tabs[0].key, serialNumber } = useApContext()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}/details/timeline/`)
  // TODO: remove istanbul and add unit test once there are more than 1 tab
  /* istanbul ignore next */
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
