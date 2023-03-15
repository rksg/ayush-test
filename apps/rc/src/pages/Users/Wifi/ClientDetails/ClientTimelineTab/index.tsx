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
  />
}

const tabs : {
  key: string,
  title: MessageDescriptor,
  component: () => JSX.Element
}[] = [
  {
    key: 'events',
    title: defineMessage({ defaultMessage: 'Events' }),
    component: Events
  },
  {
    key: 'sessions',
    title: defineMessage({ defaultMessage: 'Sessions' }),
    component: SessionTable
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
