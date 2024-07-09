import { defineMessage, useIntl } from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }         from '@acx-ui/components'
import {
  ActivityTable,
  activityTableColumnState,
  EventTable,
  eventTableColumnState,
  useActivityTableQuery,
  useEventsTableQuery
} from '@acx-ui/rc/components'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { goToNotFound }  from '@acx-ui/user'

export enum TimelineTabsEnum {
  ACTIVITIES = 'activities',
  EVENTS = 'events'
}
interface TimelineTab {
  key: TimelineTabsEnum,
  tabPane: JSX.Element,
  component: JSX.Element
}

export function SwitchTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab = 'activities', switchId, serialNumber } = useParams()
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

  const tabs = [{
    key: TimelineTabsEnum.ACTIVITIES,
    tabPane: <Tabs.TabPane key={TimelineTabsEnum.ACTIVITIES}
      tab={$t(defineMessage({ defaultMessage: 'Activities' }))} />,
    component: <Activities />
  }, {
    key: TimelineTabsEnum.EVENTS,
    tabPane: <Tabs.TabPane key={TimelineTabsEnum.EVENTS}
      tab={$t(defineMessage({ defaultMessage: 'Events' }))} />,
    component: <Events />
  }] as TimelineTab[]


  const component = tabs.find(({ key }) =>
    key === activeSubTab)?.component || goToNotFound()

  return <>
    <Tabs onChange={onTabChange} activeKey={activeSubTab} type='card' >
      {tabs.map(tab => tab.tabPane)}
    </Tabs>
    {component}
  </>
}


const Events = () => {
  const { serialNumber } = useParams()
  const settingsId = 'switch-event-table'
  const tableQuery = useEventsTableQuery(
    { serialNumber: [serialNumber] },
    undefined,
    { settingsId }
  )
  return <EventTable
    settingsId={settingsId}
    tableQuery={tableQuery}
    filterables={['severity']}
    columnState={{ defaultValue: { ...eventTableColumnState, product: false } }}
  />
}

const Activities = () => {
  const { serialNumber } = useParams()
  const settingsId = 'switch-activity-table'
  const tableQuery = useActivityTableQuery(
    { entityType: 'SWITCH', entityId: serialNumber! },
    { settingsId }
  )

  return <ActivityTable
    settingsId={settingsId}
    tableQuery={tableQuery}
    filterables={['status']}
    columnState={activityTableColumnState}
  />
}
