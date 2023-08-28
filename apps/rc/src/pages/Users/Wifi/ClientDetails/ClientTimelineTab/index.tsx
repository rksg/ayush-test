import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate, useParams }                    from 'react-router-dom'

import { Tabs }                            from '@acx-ui/components'
import { EventTable, useEventsTableQuery } from '@acx-ui/rc/components'
import { useTenantLink }                   from '@acx-ui/react-router-dom'

import { SessionTable } from './SessionTable'

const Events = () => {
  const { clientId } = useParams()
  const tableQuery = useEventsTableQuery(
    { entity_type: ['CLIENT'] },
    { searchTargetFields: ['clientMac'], searchString: clientId }
  )
  return <EventTable
    tableQuery={tableQuery}
    searchables={false}
    filterables={['severity']}
    omitColumns={['entity_type', 'product', 'source', 'macAddress']}
  />
}

const tabs : {
  key: string,
  title: MessageDescriptor,
  component: React.ReactNode
}[] = [
  {
    key: 'events',
    title: defineMessage({ defaultMessage: 'Events' }),
    component: <Events />
  },
  {
    key: 'sessions',
    title: defineMessage({ defaultMessage: 'Completed Sessions' }),
    component: <SessionTable />
  }
]

export function ClientTimelineTab () {
  const { $t } = useIntl()
  const { activeSubTab = tabs[0].key, clientId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/users/wifi/clients/${clientId}/details/timeline/`)
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
