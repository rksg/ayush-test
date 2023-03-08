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
  columnState,
  useActivityTableQuery
} from '@acx-ui/rc/components'
import { useEventsQuery }             from '@acx-ui/rc/services'
import {
  Event,
  usePollingTableQuery,
  TimelineTypes,
  TABLE_QUERY_LONG_POLLING_INTERVAL
} from '@acx-ui/rc/utils'
import { useTenantLink }         from '@acx-ui/react-router-dom'
import { useUserProfileContext } from '@acx-ui/user'

const Events = () => {
  const { networkId } = useParams()
  const { fromTime, toTime } = useEventTableFilter()
  const { data: userProfileData } = useUserProfileContext()
  const currentUserDetailLevel = userProfileData?.detailLevel

  useEffect(()=>{
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        ...eventDefaultPayload.filters,
        networkId: [ networkId ],
        fromTime,
        toTime
      },
      detailLevel: currentUserDetailLevel
    })
  }, [fromTime, toTime, currentUserDetailLevel])
  const tableQuery = usePollingTableQuery<Event>({
    useQuery: useEventsQuery,
    defaultPayload: {
      ...eventDefaultPayload,
      filters: { ...eventDefaultPayload.filters, networkId: [ networkId ] }
    },
    sorter: eventDefaultSorter,
    search: eventDefaultSearch,
    option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL },
    detailLevel: currentUserDetailLevel
  })
  return <EventTable tableQuery={tableQuery} filterables={['severity', 'entity_type']}/>
}

const Activities = () => {
  const { networkId } = useParams()
  const tableQuery = useActivityTableQuery({ entityType: 'NETWORK', entityId: networkId! })

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
