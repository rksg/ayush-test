import { pick }                   from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }         from '@acx-ui/components'
import {
  ActivityTable,
  EventTable,
  activityTableColumnState,
  eventDefaultFilters,
  eventTableColumnState,
  eventTypeMapping,
  useActivityTableQuery,
  useEventsTableQuery
} from '@acx-ui/rc/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

const EdgeActivityTable = () => {

  const { serialNumber } = useParams()
  const tableQuery = useActivityTableQuery({ entityType: 'EDGE', entityId: serialNumber! })

  return (
    <ActivityTable
      settingsId='edge-activity-table'
      tableQuery={tableQuery}
      filterables={['status']}
      columnState={activityTableColumnState}
    />
  )
}

const EdgeEventTable = () => {

  const { serialNumber } = useParams()
  const tableQuery = useEventsTableQuery({
    serialNumber: [serialNumber],
    entity_type: [...eventDefaultFilters.entity_type, 'EDGE']
  })

  return (
    <EventTable
      settingsId='edge-event-table'
      tableQuery={tableQuery}
      filterables={['severity', 'entity_type']}
      eventTypeMap={pick(eventTypeMapping, 'EDGE')}
      columnState={{ defaultValue: { ...eventTableColumnState, product: false } }}
    />
  )
}

export function EdgeTimeline () {
  const { $t } = useIntl()
  const { serialNumber, activeSubTab } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/details/timeline/`)
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabs = {
    activities: {
      title: $t({ defaultMessage: 'Activities' }),
      content: <EdgeActivityTable />
    },
    events: {
      title: $t({ defaultMessage: 'Events' }),
      content: <EdgeEventTable />
    }
  }

  return (
    <Tabs
      onChange={onTabChange}
      activeKey={activeSubTab}
      defaultActiveKey='activities'
      type='second'
    >
      {Object.keys(tabs)
        .map(
          (key) => <Tabs.TabPane
            key={key}
            tab={tabs[key as keyof typeof tabs].title}
            children={tabs[key as keyof typeof tabs].content}
          />
        )}
    </Tabs>
  )
}
