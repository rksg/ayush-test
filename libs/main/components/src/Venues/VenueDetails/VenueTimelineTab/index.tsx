import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate, useParams }                    from 'react-router-dom'

import { Tabs }                                                                  from '@acx-ui/components'
import { ActivityTable, useActivityTableQuery, EventTable, useEventsTableQuery } from '@acx-ui/rc/components'
import { TimelineTypes }                                                         from '@acx-ui/rc/utils'
import { useTenantLink }                                                         from '@acx-ui/react-router-dom'

const Events = () => {
  const settingsId = 'venue-event-table'
  return <EventTable
    settingsId={settingsId}
    tableQuery={useEventsTableQuery(
      { venueId: [useParams().venueId] },
      undefined,
      { settingsId }
    )}
  />
}

const Activities = () => {
  const { venueId } = useParams()
  const settingsId = 'venue-activity-table'
  const tableQuery = useActivityTableQuery(
    { entityType: 'VENUE', entityId: venueId! },
    { settingsId }
  )

  return <ActivityTable
    settingsId={settingsId}
    tableQuery={tableQuery}
    filterables={['status', 'product']}
  />
}

const tabs : {
  key: TimelineTypes,
  title: MessageDescriptor,
  component: React.ReactNode
}[] = [
  {
    key: 'activities',
    title: defineMessage({ defaultMessage: 'Activities' }),
    component: <Activities />
  },
  {
    key: 'events',
    title: defineMessage({ defaultMessage: 'Events' }),
    component: <Events />
  }
]

export function VenueTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab, venueId } = useParams()
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

  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    type='card'
  >
    {tabs.map(({ key, title, component }) =>
      <Tabs.TabPane tab={$t(title)} key={key} >{component}</Tabs.TabPane>)}
  </Tabs>
}
