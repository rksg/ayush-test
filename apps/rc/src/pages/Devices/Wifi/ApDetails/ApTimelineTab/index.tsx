import { omit }                                      from 'lodash'
import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate }                               from 'react-router-dom'

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
import { TimelineTypes, useApContext } from '@acx-ui/rc/utils'
import { useTenantLink }               from '@acx-ui/react-router-dom'


const Events = () => {
  const { serialNumber } = useApContext()
  const tableQuery = useEventsTableQuery({ serialNumber: [serialNumber] })
  return <EventTable
    settingsId='ap-event-table'
    tableQuery={tableQuery}
    filterables={['severity', 'entity_type']}
    eventTypeMap={omit(eventTypeMapping, ['SWITCH', 'EDGE'])}
    columnState={{ defaultValue: { ...eventTableColumnState, product: false } }}
  />
}

const Activities = () => {
  const { serialNumber } = useApContext()
  const tableQuery = useActivityTableQuery({ entityType: 'AP', entityId: serialNumber! })

  return <ActivityTable
    settingsId='ap-activity-table'
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

  return (
    <Tabs
      onChange={onTabChange}
      activeKey={activeSubTab}
      type='second'
    >
      {tabs.map(({ key, title, component }) =>
        <Tabs.TabPane tab={$t(title)} key={key} >{component}</Tabs.TabPane>)}
    </Tabs>
  )
}
