import { omit }                                      from 'lodash'
import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate, useParams }                    from 'react-router-dom'

import { Tabs }      from '@acx-ui/components'
import {
  ActivityTable,
  activityTableColumnState,
  EventTable,
  eventTableColumnState,
  useActivityTableQuery,
  useEventsTableQuery,
  eventTypeMapping
} from '@acx-ui/rc/components'
import { TimelineTypes } from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

const Events = () => {
  const { networkId } = useParams()
  const tableQuery = useEventsTableQuery({ networkId: [networkId] })
  return <EventTable
    settingsId='network-event-table'
    tableQuery={tableQuery}
    filterables={['severity', 'entity_type']}
    eventTypeMap={omit(eventTypeMapping, ['SWITCH', 'EDGE'])}
    columnState={{ defaultValue: { ...eventTableColumnState, product: false } }}
  />
}

const Activities = () => {
  const { networkId } = useParams()
  const tableQuery = useActivityTableQuery({ entityType: 'NETWORK', entityId: networkId! })

  return <ActivityTable
    settingsId='network-activity-table'
    tableQuery={tableQuery}
    filterables={['status']}
    columnState={activityTableColumnState}
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

  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    type='card'
  >
    {tabs.map(({ key, title, component }) =>
      <Tabs.TabPane tab={$t(title)} key={key} >{component}</Tabs.TabPane>)}
  </Tabs>
}
