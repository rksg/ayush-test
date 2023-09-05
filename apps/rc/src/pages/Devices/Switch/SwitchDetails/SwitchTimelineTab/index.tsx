import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate, useParams }                    from 'react-router-dom'

import { Tabs }         from '@acx-ui/components'
import {
  ActivityTable,
  activityTableColumnState,
  EventTable,
  eventTableColumnState,
  useActivityTableQuery,
  useEventsTableQuery
} from '@acx-ui/rc/components'
import { TimelineTypes } from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

const Events = () => {
  const { serialNumber } = useParams()
  const tableQuery = useEventsTableQuery({ serialNumber: [serialNumber] })
  return <EventTable
    settingsId='switch-event-table'
    tableQuery={tableQuery}
    filterables={['severity']}
    columnState={{ defaultValue: { ...eventTableColumnState, product: false } }}
  />
}

const Activities = () => {
  const { serialNumber } = useParams()
  const tableQuery = useActivityTableQuery({ entityType: 'SWITCH', entityId: serialNumber! })

  return <ActivityTable
    settingsId='switch-activity-table'
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

  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    type='second'
  >
    {tabs.map(({ key, title, component }) =>
      <Tabs.TabPane tab={$t(title)} key={key} >{component}</Tabs.TabPane>)}
  </Tabs>
}
