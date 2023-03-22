import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate }                               from 'react-router-dom'

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

import { useApContext } from '../ApContext'

const Events = () => {
  const { serialNumber } = useApContext()
  const tableQuery = useEventsTableQuery({ serialNumber: [serialNumber] })
  return <EventTable
    tableQuery={tableQuery}
    filterables={['severity']}
    columnState={{ defaultValue: { ...eventTableColumnState, product: false } }}
  />
}

const Activities = () => {
  const { serialNumber } = useApContext()
  const tableQuery = useActivityTableQuery({ entityType: 'AP', entityId: serialNumber! })

  return <ActivityTable
    tableQuery={tableQuery}
    filterables={['status']}
    columnState={activityTableColumnState}
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
